// services/time-machine/ArchiveService.ts

import { supabase } from "@/supabase/supabaseClient";
import { getFileCategory } from "@/utils/FileUtils"; // For categorizing files
import { FileRow } from "@/types/FileTypes"; // Import the file type for defining the structure

export const ArchiveService = {
  /**
   * Fetch all archived files ordered by the most recently updated.
   * Adds a category field for each file based on its extension.
   * @returns {Promise<FileRow[]>} A list of archived files or an empty array on error.
   */
  async getArchivedFiles(): Promise<(FileRow & { category: string })[]> {
    try {
      const { data, error } = await supabase
        .from("archives")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching archived files: ${error.message}`);
      }

      // Add category to each file
      return (data || []).map((file: FileRow) => ({
        ...file,
        category: getFileCategory(file.name.split(".").pop() || ""), // Categorize file based on extension
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Fetch the total and used storage for archives.
   * @returns {Promise<StorageUsage>} Storage usage data or a default value on error.
   */
  async getStorageUsage(): Promise<{ used: number; total: number }> {
    try {
      const { data, error } = await supabase.rpc("get_archive_storage_usage");

      if (error) {
        throw new Error(`Error fetching storage usage: ${error.message}`);
      }

      return data || { used: 0, total: 0 };
    } catch (err) {
      console.error(err);
      return { used: 0, total: 0 };
    }
  },

  /**
   * Add a file to the archive.
   * @param {string} fileId - The ID of the file to archive.
   * @returns {Promise<boolean>} Returns true if successful, false otherwise.
   */
  async addToArchive(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("archives")
        .insert([{ id: fileId }]);

      if (error) {
        throw new Error(`Error adding file to archive: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Remove a file from the archive.
   * @param {string} fileId - The ID of the file to remove from the archive.
   * @returns {Promise<boolean>} Returns true if successful, false otherwise.
   */
  async removeFromArchive(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("archives")
        .delete()
        .eq("id", fileId);

      if (error) {
        throw new Error(`Error removing file from archive: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Search for files in the archive by name.
   * @param {string} searchQuery - The search term to match file names.
   * @returns {Promise<FileRow[]>} A list of matching files or an empty array on error.
   */
  async searchArchivedFiles(searchQuery: string): Promise<(FileRow & { category: string })[]> {
    try {
      const { data, error } = await supabase
        .from("archives")
        .select("*")
        .ilike("name", `%${searchQuery}%`); // Case-insensitive partial match

      if (error) {
        throw new Error(`Error searching archived files: ${error.message}`);
      }

      // Add category to each file
      return (data || []).map((file: FileRow) => ({
        ...file,
        category: getFileCategory(file.name.split(".").pop() || ""),
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  },
};
