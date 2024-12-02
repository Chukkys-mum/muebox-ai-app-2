// /services/email/AttachmentService.ts

import { createClient } from '@/utils/supabase/server';
import { FileValidationError } from '@/utils/errors';
import { ClamAV } from '@/utils/virus-scan';
import { formatBytes } from '@/utils/formatters';

const MAX_FILE_SIZE = 25 * 1024 * 1024; // 25MB
const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/gif',
  'application/pdf', 'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/plain'
];

export class AttachmentService {
  private supabase;
  private virusScanner;

  constructor() {
    this.supabase = createClient();
    this.virusScanner = new ClamAV();
  }

  async uploadAttachment(file: File, emailId: string): Promise<string> {
    // Validate file
    await this.validateFile(file);

    // Scan for viruses
    const isSafe = await this.virusScanner.scanFile(file);
    if (!isSafe) {
      throw new FileValidationError('File failed virus scan');
    }

    // Generate unique filename
    const fileName = `${emailId}/${Date.now()}-${file.name}`;

    // Handle large files with chunking
    if (file.size > 5 * 1024 * 1024) { // 5MB chunks
      await this.uploadLargeFile(file, fileName);
    } else {
      const { error } = await this.supabase.storage
        .from('email-attachments')
        .upload(fileName, file);

      if (error) throw error;
    }

    // Store attachment metadata
    const { error: dbError } = await this.supabase
    .from('chat_files')
    .insert({
        chat_id: emailId,
        file_type: file.type,
        file_path: fileName,
        uploaded_by_id: 'system', // Changed from 'uploaded_by'
        status: 'active'
        // Remove 'file_name' and 'size' if they're not in your table schema
    });


    if (dbError) throw dbError;

    return fileName;
  }

  private async validateFile(file: File) {
    if (file.size > MAX_FILE_SIZE) {
      throw new FileValidationError(
        `File size exceeds maximum allowed size of ${formatBytes(MAX_FILE_SIZE)}`
      );
    }

    if (!ALLOWED_TYPES.includes(file.type)) {
      throw new FileValidationError('File type not allowed');
    }
  }

  private async uploadLargeFile(file: File, fileName: string) {
    const chunkSize = 5 * 1024 * 1024; // 5MB chunks
    const chunks = Math.ceil(file.size / chunkSize);
    
    for (let i = 0; i < chunks; i++) {
      const start = i * chunkSize;
      const end = Math.min(start + chunkSize, file.size);
      const chunk = file.slice(start, end);

      const { error } = await this.supabase.storage
        .from('email-attachments')
        .upload(
          `${fileName}.part${i}`, 
          chunk,
          { upsert: true }
        );

      if (error) throw error;
    }

    // Combine chunks
    await this.combineChunks(fileName, chunks);
  }

  private async combineChunks(fileName: string, totalChunks: number) {
    // Request server to combine chunks
    const response = await fetch('/api/attachments/combine', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        fileName,
        totalChunks
      })
    });

    if (!response.ok) {
      throw new Error('Failed to combine file chunks');
    }
  }

  async deleteAttachment(fileName: string) {
    const { error } = await this.supabase.storage
      .from('email-attachments')
      .remove([fileName]);

    if (error) throw error;

    // Update database record
    await this.supabase
      .from('chat_files')
      .update({ status: 'deleted' })
      .match({ file_path: fileName });
  }

  async getDownloadUrl(fileName: string): Promise<string> {
    const { data, error } = await this.supabase.storage
      .from('email-attachments')
      .createSignedUrl(fileName, 3600); // 1 hour expiry

    if (error) throw error;
    return data.signedUrl;
  }
}

export const attachmentService = new AttachmentService();