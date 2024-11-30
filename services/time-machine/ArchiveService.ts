// services/time-machine/ArchiveService.ts
import { createClient } from "@/utils/supabase/client";
import { getFileCategory } from "@/utils/FileUtils";
import { FileRow } from "@/types/FileTypes";

const supabase = createClient();

// Add this type to handle files with required category
type FileWithCategory = FileRow & { 
  category: string; 
};

export const ArchiveService = {
  async getArchivedFiles(
    page: number = 1,
    limit: number = 10
  ): Promise<{ files: FileWithCategory[]; total: number }> {
    try {
      const start = (page - 1) * limit;
      const end = start + limit - 1;

      const { data, error, count } = await supabase
        .from("archives")
        .select("*", { count: "exact" })
        .order("updated_at", { ascending: false })
        .range(start, end);

      if (error) {
        throw new Error(`Error fetching archived files: ${error.message}`);
      }

      const files = (data || []).map((file: FileRow): FileWithCategory => ({
        ...file,
        // Ensure category is always a string
        category: file.category || getFileCategory(file.name.split(".").pop() || "") || "other",
      }));

      return { files, total: count || 0 };
    } catch (err) {
      console.error(err);
      return { files: [], total: 0 };
    }
  },

  /**
   * Fetch the total and used storage for archives with breakdown.
   * @returns {Promise<{ used: number; total: number; breakdown?: Record<string, number> }>} Storage usage data with breakdown by category.
   */
  async getStorageUsage(): Promise<{ used: number; total: number; breakdown?: Record<string, number> }> {
    try {
      const { data, error } = await supabase.rpc("get_archive_storage_usage");

      if (error) {
        throw new Error(`Error fetching storage usage: ${error.message}`);
      }

      // Simulate breakdown (e.g., from a database call or calculated separately)
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
   * Add a file to the archive.
   * @param {string} fileId - The ID of the file to archive.
   * @returns {Promise<boolean>} Returns true if successful, false otherwise.
   */
  async addToArchive(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase.from("archives").insert([{ id: fileId }]);

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
   * Add multiple files to the archive in bulk.
   * @param {string[]} fileIds - An array of file IDs to archive.
   * @returns {Promise<boolean>} Returns true if successful, false otherwise.
   */
  async bulkAddToArchive(fileIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase.from("archives").insert(
        fileIds.map((id) => ({ id }))
      );

      if (error) {
        throw new Error(`Error adding files to archive: ${error.message}`);
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
      const { error } = await supabase.from("archives").delete().eq("id", fileId);

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
   * Remove multiple files from the archive in bulk.
   * @param {string[]} fileIds - An array of file IDs to remove from the archive.
   * @returns {Promise<boolean>} Returns true if successful, false otherwise.
   */
  async bulkRemoveFromArchive(fileIds: string[]): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("archives")
        .delete()
        .in("id", fileIds);

      if (error) {
        throw new Error(`Error removing files from archive: ${error.message}`);
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
  async searchArchivedFiles(searchQuery: string): Promise<FileWithCategory[]> {
    try {
      const { data, error } = await supabase
        .from("archives")
        .select("*")
        .ilike("name", `%${searchQuery}%`);

      if (error) {
        throw new Error(`Error searching archived files: ${error.message}`);
      }

      return (data || []).map((file: FileRow): FileWithCategory => ({
        ...file,
        category: file.category || getFileCategory(file.name.split(".").pop() || "") || "other",
      }));
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Update metadata for a specific archived file.
   * @param {string} fileId - The ID of the file to update.
   * @param {Partial<Pick<FileRow, "tags" | "description">>} metadata - Metadata to update.
   * @returns {Promise<boolean>} Returns true if successful, false otherwise.
   */
  async updateArchivedFileMetadata(
    fileId: string,
    metadata: Partial<Pick<FileRow, "tags" | "description">>
  ): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("archives")
        .update(metadata)
        .eq("id", fileId);

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
