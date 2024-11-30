// services/time-machine/TrashService.ts

import { supabase } from "@/supabase/supabaseClient";

// Define type for a trashed file
export type TrashedFile = {
  id: string;
  name: string;
  size: number; // File size in bytes
  deletedAt: string; // ISO timestamp
  category?: string; // File category (e.g., image, document, etc.)
  tags?: string[]; // Optional tags for the file
  description?: string; // Optional description for the file
};

export const TrashService = {
  /**
   * Fetch trashed files with pagination, ordered by deletion date.
   * @param {number} page - Page number (starts from 1).
   * @param {number} limit - Number of files per page.
   * @returns {Promise<{ files: TrashedFile[]; total: number }>} Paginated trashed files and total count.
   */
  async getTrashedFiles(
    page: number = 1,
    limit: number = 10
  ): Promise<{ files: TrashedFile[]; total: number }> {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await supabase
        .from("trash")
        .select("id, name, size, deleted_at, tags, description", { count: "exact" })
        .order("deleted_at", { ascending: false })
        .range(start, end);

      if (error) {
        throw new Error(`Error fetching trashed files: ${error.message}`);
      }

      const files = (data || []).map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        deletedAt: file.deleted_at,
        tags: file.tags || [],
        description: file.description || "",
      }));

      return { files, total: count || 0 };
    } catch (err) {
      console.error(err);
      return { files: [], total: 0 };
    }
  },

  /**
   * Fetch the total and used storage for trashed files.
   * @returns {Promise<{ used: number; total: number; breakdown?: Record<string, number> }>} Storage usage details.
   */
  async getStorageUsage(): Promise<{ used: number; total: number; breakdown?: Record<string, number> }> {
    try {
      const { data, error } = await supabase.rpc("get_trash_storage_usage");

      if (error) {
        throw new Error(`Error fetching storage usage: ${error.message}`);
      }

      // Simulate breakdown (e.g., calculated or fetched separately)
      const breakdown = {
        images: data?.images || 0,
        videos: data?.videos || 0,
        documents: data?.documents || 0,
        others: data?.others || 0,
      };

      return { used: data?.used || 0, total: data?.total || 0, breakdown };
    } catch (err) {
      console.error(err);
      return { used: 0, total: 0, breakdown: {} };
    }
  },

  /**
   * Restore a file from trash by deleting it from the trash table.
   * @param {string} fileId - The ID of the file to restore.
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`.
   */
  async restoreFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("trash").delete().eq("id", fileId);

      if (error) {
        throw new Error(`Error restoring file: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Restore multiple files in bulk.
   * @param {string[]} fileIds - Array of file IDs to restore.
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`.
   */
  async bulkRestoreFiles(fileIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("trash").delete().in("id", fileIds);

      if (error) {
        throw new Error(`Error restoring files: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Permanently delete a file from the trash.
   * @param {string} fileId - The ID of the file to delete.
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`.
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("trash").delete().eq("id", fileId);

      if (error) {
        throw new Error(`Error deleting file permanently: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Permanently delete multiple files in bulk.
   * @param {string[]} fileIds - Array of file IDs to delete.
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`.
   */
  async bulkDeleteFiles(fileIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("trash").delete().in("id", fileIds);

      if (error) {
        throw new Error(`Error deleting files permanently: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Search for trashed files by name.
   * @param {string} query - Search term to filter files by name.
   * @returns {Promise<TrashedFile[]>} Array of matching trashed files.
   */
  async searchTrashedFiles(query: string): Promise<TrashedFile[]> {
    try {
      const { data, error } = await supabase
        .from("trash")
        .select("id, name, size, deleted_at, tags, description")
        .ilike("name", `%${query}%`); // Case-insensitive partial match

      if (error) {
        throw new Error(`Error searching trashed files: ${error.message}`);
      }

      const files = (data || []).map((file) => ({
        id: file.id,
        name: file.name,
        size: file.size,
        deletedAt: file.deleted_at,
        tags: file.tags || [],
        description: file.description || "",
      }));

      return files;
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Update metadata for a trashed file.
   * @param {string} fileId - The ID of the file to update.
   * @param {Partial<Pick<TrashedFile, "tags" | "description">>} metadata - Metadata to update.
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`.
   */
  async updateTrashedFileMetadata(
    fileId: string,
    metadata: Partial<Pick<TrashedFile, "tags" | "description">>
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("trash").update(metadata).eq("id", fileId);

      if (error) {
        throw new Error(`Error updating file metadata: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
};
