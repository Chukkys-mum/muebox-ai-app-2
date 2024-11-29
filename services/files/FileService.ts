// services/files/FileService.ts
// Handles Supabase interactions for file upload, deletion, metadata fetching, and updates.

import { supabase } from "@/supabase/supabaseClient";
import { FileRow } from "@/types/FileTypes";

export const FileService = {
  /**
   * Fetch all files from the database.
   * @returns {Promise<FileRow[]>} Array of files or an empty array on error.
   */
  async fetchFiles(): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase.from('files').select('*');
  
      if (error) {
        throw new Error(`Error fetching files: ${error.message}`);
      }
  
      // Map backend fields to frontend fields
      return (
        data?.map((file) => ({
          ...file,
          modifiedAt: file.modified_at, // Map backend `modified_at` to frontend `modifiedAt`
        })) || []
      );
    } catch (error) {
      console.error('fetchFiles:', error);
      return [];
    }
  }

  /**
   * Fetch file settings.
   * @returns {Promise<{ maxFileSize: number; allowedFileTypes: string[] } | null>} File settings or null on error.
   */
  async getFileSettings(): Promise<{ maxFileSize: number; allowedFileTypes: string[] } | null> {
    try {
      const { data, error } = await supabase.from("file_settings").select("*").single();

      if (error) {
        throw new Error(`Error fetching file settings: ${error.message}`);
      }

      return {
        ...data,
        allowedFileTypes: (data?.allowedFileTypes || "")
          .split(",")
          .map((type: string) => type.trim()),
      };
    } catch (error) {
      console.error("getFileSettings:", error);
      return null;
    }
  },

  /**
   * Update file settings.
   * @param settings - Object containing maxFileSize and allowedFileTypes.
   * @returns {Promise<boolean>} True if update is successful, false otherwise.
   */
  async updateFileSettings(settings: { maxFileSize: number; allowedFileTypes: string[] }): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("file_settings")
        .update({
          ...settings,
          allowedFileTypes: settings.allowedFileTypes.join(","),
        })
        .eq("id", 1);

      if (error) {
        throw new Error(`Error updating file settings: ${error.message}`);
      }
      return true;
    } catch (error) {
      console.error("updateFileSettings:", error);
      return false;
    }
  },

  /**
   * Search files by name.
   * @param query - Search term to filter files by name.
   * @returns {Promise<FileRow[]>} Array of matching files or an empty array on error.
   */
  async searchFiles(query: string): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .ilike("name", `%${query}%`);

      if (error) {
        throw new Error(`Error searching files: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("searchFiles:", error);
      return [];
    }
  },

  /**
   * Delete a file by its ID.
   * @param fileId - The ID of the file to delete.
   * @returns {Promise<boolean>} True if deletion is successful, false otherwise.
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("files").delete().eq("id", fileId);

      if (error) {
        throw new Error(`Error deleting file: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("deleteFile:", error);
      return false;
    }
  },

  /**
   * Upload a new file.
   * @param file - File metadata object to insert into the database.
   * @returns {Promise<boolean>} True if upload is successful, false otherwise.
   */
  async uploadFile(file: Omit<FileRow, "id" | "created_at" | "modified_at">): Promise<boolean> {
    try {
      const { error } = await supabase.from("files").insert([file]);

      if (error) {
        throw new Error(`Error uploading file: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("uploadFile:", error);
      return false;
    }
  },

  /**
   * Fetch files by folder ID.
   * @param folderId - ID of the folder to fetch files for.
   * @returns {Promise<FileRow[]>} Array of files in the folder or an empty array on error.
   */
  async getFilesByFolder(folderId: string): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase.from("files").select("*").eq("parent_id", folderId);

      if (error) {
        throw new Error(`Error fetching files for folder ${folderId}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("getFilesByFolder:", error);
      return [];
    }
  },

  /**
   * Fetch files by category.
   * @param category - The category of files to fetch (e.g., image, video).
   * @returns {Promise<FileRow[]>} Array of files in the category or an empty array on error.
   */
  async getFilesByCategory(category: FileRow["category"]): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase.from("files").select("*").eq("category", category);

      if (error) {
        throw new Error(`Error fetching files for category ${category}: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("getFilesByCategory:", error);
      return [];
    }
  },

  /**
   * Fetch all files and folders from the root directory.
   * @returns {Promise<FileRow[]>} Array of files and folders in the root directory.
   */
  async getFilesAndFolders(): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase.from("files").select("*").is("parent_id", null);

      if (error) {
        throw new Error(`Error fetching files and folders: ${error.message}`);
      }

      return data || [];
    } catch (error) {
      console.error("getFilesAndFolders:", error);
      return [];
    }
  },

  /**
   * Restore a deleted file.
   * @param fileId - The ID of the file to restore.
   * @returns {Promise<boolean>} True if restoration is successful, false otherwise.
   */
  async restoreFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("files")
        .update({ deleted: false })
        .eq("id", fileId);

      if (error) {
        throw new Error(`Error restoring file: ${error.message}`);
      }

      return true;
    } catch (error) {
      console.error("restoreFile:", error);
      return false;
    }
  },
};

  