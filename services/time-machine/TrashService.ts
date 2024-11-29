// services/time-machine/TrashService.ts

import { supabase } from "@/supabase/supabaseClient";

// Define type for a trashed file
export type TrashedFile = {
  id: string;
  name: string;
  size: number; // File size in bytes
  deletedAt: string; // ISO timestamp
};

export const TrashService = {
  /**
   * Fetch all trashed files, ordered by deletion date.
   * @returns {Promise<TrashedFile[]>} Array of trashed files
   */
  async getTrashedFiles(): Promise<TrashedFile[]> {
    try {
      const { data, error } = await supabase
        .from("trash")
        .select("id, name, size, deleted_at")
        .order("deleted_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching trashed files: ${error.message}`);
      }

      // Transform data to match `TrashedFile` type
      return (
        data?.map((file: { id: string; name: string; size: number; deleted_at: string }) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          deletedAt: file.deleted_at,
        })) || []
      );
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Restore a file from trash by deleting it from the trash table.
   * @param {string} fileId - The ID of the file to restore
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`
   */
  async restoreFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("trash")
        .delete()
        .eq("id", fileId);

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
   * Permanently delete a file from the trash.
   * @param {string} fileId - The ID of the file to delete
   * @returns {Promise<boolean>} `true` if successful, otherwise `false`
   */
  async deleteFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("trash")
        .delete()
        .eq("id", fileId);

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
   * Search for trashed files by name.
   * @param {string} query - Search term to filter files by name
   * @returns {Promise<TrashedFile[]>} Array of matching trashed files
   */
  async searchTrashedFiles(query: string): Promise<TrashedFile[]> {
    try {
      const { data, error } = await supabase
        .from("trash")
        .select("id, name, size, deleted_at")
        .ilike("name", `%${query}%`); // Case-insensitive partial match

      if (error) {
        throw new Error(`Error searching trashed files: ${error.message}`);
      }

      // Transform data to match `TrashedFile` type
      return (
        data?.map((file: { id: string; name: string; size: number; deleted_at: string }) => ({
          id: file.id,
          name: file.name,
          size: file.size,
          deletedAt: file.deleted_at,
        })) || []
      );
    } catch (err) {
      console.error(err);
      return [];
    }
  },
};
