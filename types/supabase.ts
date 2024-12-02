// /types/supabase.ts
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      paddle_subscriptions: {
        Row: {
          passthrough: string | null
          status: string | null
          subscription_cancel_url: string | null
          subscription_end_date: string | null
          subscription_id: string
          subscription_plan_id: string | null
          subscription_update_url: string | null
        }
        Insert: {
          passthrough?: string | null
          status?: string | null
          subscription_cancel_url?: string | null
          subscription_end_date?: string | null
          subscription_id: string
          subscription_plan_id?: string | null
          subscription_update_url?: string | null
        }
        Update: {
          passthrough?: string | null
          status?: string | null
          subscription_cancel_url?: string | null
          subscription_end_date?: string | null
          subscription_id?: string
          subscription_plan_id?: string | null
          subscription_update_url?: string | null
        }
        Relationships: []
      },
      // Add files table definition
      files: {
        Row: {
          id: string;
          file_name: string;
          size: number;
          type: 'file' | 'folder';
          status: string;
          category: string | null;
          extension: string | null;
          mime_type: string | null;
          parent_id: string | null;
          is_pinned: boolean | null;
          starred: boolean | null;
          tags: string[] | null;
          description: string | null;
          created_at: string;
          updated_at: string;
          deleted_at: string | null;
          archived_at: string | null;
          is_shared: boolean | null;
          shared_with: string[] | null;
          permissions: Record<string, boolean> | null;
          user_id: string;
          metadata: Record<string, any> | null;
          related_entity_type: string | null;
          related_entity_id: string | null;
          file_type: string | null;
          file_path: string | null;
          uploaded_by: string;
        };
        Insert: Omit<Database['public']['Tables']['files']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['files']['Insert']>;
      };

      email_accounts: {
        Row: {
          id: string;
          user_id: string;
          provider: string;
          email_address: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          provider: string;
          email_address: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          provider?: string;
          email_address?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "email_accounts_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      },

      llm_providers: {
        Row: {
          id: string;
          name: string;
          contact_info: string | null;
          website: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          contact_info?: string | null;
          website?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          contact_info?: string | null;
          website?: string | null;
          created_at?: string;
        };
      };
      
      user_api_keys: {
        Row: {
          id: string;
          llm_id: string;
          user_id: string;
          api_key: string;
          is_enabled: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          llm_id: string;
          user_id: string;
          api_key: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          llm_id?: string;
          user_id?: string;
          api_key?: string;
          is_enabled?: boolean;
          created_at?: string;
          updated_at?: string;
        };
      };

      archives: {
        Row: {
          id: string;
          file_id: string;
          user_id: string;
          archived_at: string;
          restored_at: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['archives']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['archives']['Insert']>;
      };

      // Add file_settings table definition
      file_settings: {
        Row: {
          id: number;
          max_file_size: number | null;
          allowed_file_types: string[] | null;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['file_settings']['Row'], 'id' | 'updated_at'>;
        Update: Partial<Database['public']['Tables']['file_settings']['Insert']>;
      };
      
    };
    Views: {
      [_ in never]: never
    };
    Functions: {
      get_storage_usage: {
        Args: Record<string, never>;
        Returns: {
          used_space: number;
          total_space: number;
          storage_breakdown: Record<string, number>;
        };
      };
      get_archive_storage_usage: {
        Args: Record<string, never>;
        Returns: {
          used_space: number;
          total_space: number;
          storage_breakdown: {
            images: number;
            videos: number;
            documents: number;
            others: number;
          };
        };
      };
      get_knowledge_base_storage: {
        Args: Record<string, never>;
        Returns: {
          used: number;
          total: number;
        };
      };
    };
    Enums: {
      [_ in never]: never
    };
    CompositeTypes: {
      [_ in never]: never
    };
  };
}