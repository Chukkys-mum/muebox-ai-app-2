// /files/KnowledgeBaseService.ts

import { supabase } from "@/supabase/supabaseClient";
import { FileRow } from "@/types/FileTypes";

export const KnowledgeBaseService = {
  /**
   * Fetch all files in the Knowledge Base ordered by most recently updated.
   * @returns {Promise<FileRow[]>} A list of Knowledge Base files or an empty array on error.
   */
  async getKnowledgeBaseFiles(): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .order("updated_at", { ascending: false });

      if (error) {
        throw new Error(`Error fetching Knowledge Base files: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Fetch storage usage for the Knowledge Base.
   * @returns {Promise<{ used: number; total: number }>} Storage usage data or default values on error.
   */
  async getStorageUsage(): Promise<{ used: number; total: number }> {
    try {
      const { data, error } = await supabase.rpc("get_knowledge_base_storage");

      if (error) {
        throw new Error(
          `Error fetching Knowledge Base storage usage: ${error.message}`
        );
      }

      return data || { used: 0, total: 0 };
    } catch (err) {
      console.error(err);
      return { used: 0, total: 0 };
    }
  },

  /**
   * Add a file to the Knowledge Base.
   * @param {Omit<FileRow, "created_at" | "modified_at">} file - The file object to add to the Knowledge Base.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async addFile(
    file: Omit<FileRow, "created_at" | "modified_at">
  ): Promise<boolean> {
    try {
      const { error } = await supabase.from("knowledge_base").insert([file]);

      if (error) {
        throw new Error(`Error adding file to Knowledge Base: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Remove a file from the Knowledge Base.
   * @param {string} fileId - The ID of the file to remove.
   * @returns {Promise<boolean>} True if successful, false otherwise.
   */
  async removeFile(fileId: string): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .delete()
        .eq("id", fileId);

      if (error) {
        throw new Error(
          `Error removing file from Knowledge Base: ${error.message}`
        );
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },

  /**
   * Search for files in the Knowledge Base by name.
   * @param {string} query - Search term to filter files by name.
   * @returns {Promise<FileRow[]>} Array of matching files or an empty array on error.
   */
  async searchFiles(query: string): Promise<FileRow[]> {
    try {
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .ilike("name", `%${query}%`); // Case-insensitive partial match.

      if (error) {
        throw new Error(`Error searching files in Knowledge Base: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error(err);
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
      const { data, error } = await supabase
        .from("knowledge_base")
        .select("*")
        .eq("category", category);

      if (error) {
        throw new Error(`Error fetching files by category: ${error.message}`);
      }

      return data || [];
    } catch (err) {
      console.error(err);
      return [];
    }
  },

  /**
   * Update an existing file in the Knowledge Base.
   * @param fileId - The ID of the file to update.
   * @param updates - Object containing the fields to update.
   * @returns {Promise<boolean>} True if the update is successful, false otherwise.
   */
  async updateFile(fileId: string, updates: Partial<FileRow>): Promise<boolean> {
    try {
      const { error } = await supabase
        .from("knowledge_base")
        .update(updates)
        .eq("id", fileId);

      if (error) {
        throw new Error(`Error updating file: ${error.message}`);
      }

      return true;
    } catch (err) {
      console.error(err);
      return false;
    }
  },
};
