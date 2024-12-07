// types/types_db.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      customers: {
        Row: {
          id: string;
          stripe_customer_id: string | null;
          account_id: string; // Added to link to account
        };
        Insert: {
          id: string;
          stripe_customer_id?: string | null;
          account_id: string;
        };
        Update: {
          id?: string;
          stripe_customer_id?: string | null;
          account_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'customers_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'customers_account_id_fkey';
            columns: ['account_id'];
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          }
        ];
      };

      prices: {
        Row: {
          active: boolean | null;
          currency: string | null;
          description: string | null;
          id: string;
          interval: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count: number | null;
          metadata: Json | null;
          product_id: string | null;
          trial_period_days: number | null;
          type: Database['public']['Enums']['pricing_type'] | null;
          unit_amount: number | null;
          account_id: string; // Added to scope prices to accounts
        };
        Insert: {
          active?: boolean | null;
          currency?: string | null;
          description?: string | null;
          id: string;
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count?: number | null;
          metadata?: Json | null;
          product_id?: string | null;
          trial_period_days?: number | null;
          type?: Database['public']['Enums']['pricing_type'] | null;
          unit_amount?: number | null;
          account_id: string;
        };
        Update: {
          active?: boolean | null;
          currency?: string | null;
          description?: string | null;
          id?: string;
          interval?: Database['public']['Enums']['pricing_plan_interval'] | null;
          interval_count?: number | null;
          metadata?: Json | null;
          product_id?: string | null;
          trial_period_days?: number | null;
          type?: Database['public']['Enums']['pricing_type'] | null;
          unit_amount?: number | null;
          account_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'prices_product_id_fkey';
            columns: ['product_id'];
            referencedRelation: 'products';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'prices_account_id_fkey';
            columns: ['account_id'];
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          }
        ];
      };

      products: {
        Row: {
          active: boolean | null;
          description: string | null;
          id: string;
          image: string | null;
          metadata: Json | null;
          name: string | null;
        };
        Insert: {
          active?: boolean | null;
          description?: string | null;
          id: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Update: {
          active?: boolean | null;
          description?: string | null;
          id?: string;
          image?: string | null;
          metadata?: Json | null;
          name?: string | null;
        };
        Relationships: [];
      };

      subscriptions: {
        Row: {
          cancel_at: string | null;
          cancel_at_period_end: boolean | null;
          canceled_at: string | null;
          created: string;
          current_period_end: string;
          current_period_start: string;
          ended_at: string | null;
          id: string;
          metadata: Json | null;
          price_id: string | null;
          quantity: number | null;
          status: Database['public']['Enums']['subscription_status'] | null;
          trial_end: string | null;
          trial_start: string | null;
          account_id: string;  // Changed from user_id
          credits: number | null;
          trial_credits?: number | null;
        };
        Insert: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id: string;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          account_id: string;  // Changed from user_id
          credits: number | null;
          trial_credits?: number | null;
        };
        Update: {
          cancel_at?: string | null;
          cancel_at_period_end?: boolean | null;
          canceled_at?: string | null;
          created?: string;
          current_period_end?: string;
          current_period_start?: string;
          ended_at?: string | null;
          id?: string;
          metadata?: Json | null;
          price_id?: string | null;
          quantity?: number | null;
          status?: Database['public']['Enums']['subscription_status'] | null;
          trial_end?: string | null;
          trial_start?: string | null;
          account_id: string;  // Changed from user_id
          credits: number | null;
          trial_credits?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'subscriptions_price_id_fkey';
            columns: ['price_id'];
            referencedRelation: 'prices';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'subscriptions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      users: {
        Row: {
          avatar_url: string | null;
          billing_address: Json | null;
          full_name: string | null;
          id: string;
          payment_method: Json | null;
        };
        Insert: {
          avatar_url?: string | null;
          billing_address?: Json | null;
          full_name?: string | null;
          id: string;
          payment_method?: Json | null;
        };
        Update: {
          avatar_url?: string | null;
          billing_address?: Json | null;
          full_name?: string | null;
          id?: string;
          payment_method?: Json | null;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      chat_scopes: {
        Row: {
          id: string;
          name: string;
          initial_prompt: string | null;
          context: Json | null;
          personality_profile_id: string | null;
          custom_instructions: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          initial_prompt?: string | null;
          context?: Json | null;
          personality_profile_id?: string | null;
          custom_instructions?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          initial_prompt?: string | null;
          context?: Json | null;
          personality_profile_id?: string | null;
          custom_instructions?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_scopes_personality_profile_id_fkey';
            columns: ['personality_profile_id'];
            referencedRelation: 'personality_profiles';
            referencedColumns: ['id'];
          }
        ];
      };

      chats: {
        Row: {
          id: string;
          chat_type: Database['public']['Enums']['chat_type'];
          created_by_user_id: string;
          chat_scope_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_type: Database['public']['Enums']['chat_type'];
          created_by_user_id: string;
          chat_scope_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_type?: Database['public']['Enums']['chat_type'];
          created_by_user_id?: string;
          chat_scope_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chats_created_by_user_id_fkey';
            columns: ['created_by_user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chats_chat_scope_id_fkey';
            columns: ['chat_scope_id'];
            referencedRelation: 'chat_scopes';
            referencedColumns: ['id'];
          }
        ];
      };

      chat_participants: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          role_in_chat: string | null;
          status: string;
          joined_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          role_in_chat?: string | null;
          status?: string;
          joined_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          user_id?: string;
          role_in_chat?: string | null;
          status?: string;
          joined_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_participants_chat_id_fkey';
            columns: ['chat_id'];
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_participants_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      chat_files: {
        Row: {
          id: string;
          chat_id: string;
          file_type: string | null;
          file_path: string | null;
          uploaded_by_id: string;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          file_type?: string | null;
          file_path?: string | null;
          uploaded_by_id: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          file_type?: string | null;
          file_path?: string | null;
          uploaded_by_id?: string;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_files_chat_id_fkey';
            columns: ['chat_id'];
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_files_uploaded_by_id_fkey';
            columns: ['uploaded_by_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      chat_notifications: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          message: string;
          type: string;
          is_read: boolean;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          message: string;
          type: string;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          chat_id?: string;
          user_id?: string;
          message?: string;
          type?: string;
          is_read?: boolean;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'chat_notifications_chat_id_fkey';
            columns: ['chat_id'];
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'chat_notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      tones: {
        Row: {
          id: string;
          name: string;
          formality_level: number | null;
          emotion_level: number | null;
          style: Json | null;
          tone_type: string | null;
          attributes: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          formality_level?: number | null;
          emotion_level?: number | null;
          style?: Json | null;
          tone_type?: string | null;
          attributes?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          formality_level?: number | null;
          emotion_level?: number | null;
          style?: Json | null;
          tone_type?: string | null;
          attributes?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      personalities: {
        Row: {
          id: string;
          profile_id: string;
          name: string;
          default_tone_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          profile_id: string;
          name: string;
          default_tone_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          profile_id?: string;
          name?: string;
          default_tone_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'personalities_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'personality_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personalities_default_tone_id_fkey';
            columns: ['default_tone_id'];
            referencedRelation: 'tones';
            referencedColumns: ['id'];
          }
        ];
      };

      personality_profiles: {
        Row: {
          id: string;
          user_id: string;
          profile_name: string;
          default_tone_id: string | null;
          knowledge_base_id: string | null;
          role_id: string | null;
          team_id: string | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          profile_name: string;
          default_tone_id?: string | null;
          knowledge_base_id?: string | null;
          role_id?: string | null;
          team_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          profile_name?: string;
          default_tone_id?: string | null;
          knowledge_base_id?: string | null;
          role_id?: string | null;
          team_id?: string | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'personality_profiles_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_profiles_default_tone_id_fkey';
            columns: ['default_tone_id'];
            referencedRelation: 'tones';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_profiles_knowledge_base_id_fkey';
            columns: ['knowledge_base_id'];
            referencedRelation: 'knowledge_base';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_profiles_role_id_fkey';
            columns: ['role_id'];
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_profiles_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };

      personality_profiles_teams: {
        Row: {
          profile_id: string;
          team_id: string;
          created_at: string;
          updated_at: string;
          status: string;
        };
        Insert: {
          profile_id: string;
          team_id: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
        };
        Update: {
          profile_id?: string;
          team_id?: string;
          created_at?: string;
          updated_at?: string;
          status?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'personality_profiles_teams_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'personality_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_profiles_teams_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };

      personality_tone: {
        Row: {
          personality_id: string;
          tone_id: string;
        };
        Insert: {
          personality_id: string;
          tone_id: string;
        };
        Update: {
          personality_id?: string;
          tone_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'personality_tone_personality_id_fkey';
            columns: ['personality_id'];
            referencedRelation: 'personalities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_tone_tone_id_fkey';
            columns: ['tone_id'];
            referencedRelation: 'tones';
            referencedColumns: ['id'];
          }
        ];
      };

      personality_profile_knowledge_base: {
        Row: {
          profile_id: string;
          knowledge_base_id: string;
        };
        Insert: {
          profile_id: string;
          knowledge_base_id: string;
        };
        Update: {
          profile_id?: string;
          knowledge_base_id?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'personality_profile_knowledge_base_profile_id_fkey';
            columns: ['profile_id'];
            referencedRelation: 'personality_profiles';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'personality_profile_knowledge_base_knowledge_base_id_fkey';
            columns: ['knowledge_base_id'];
            referencedRelation: 'knowledge_base';
            referencedColumns: ['id'];
          }
        ];
      };

      knowledge_base: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          type: Database['public']['Enums']['knowledge_base_type'];
          file_path: string | null;
          status: string;
          size: number | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          type?: Database['public']['Enums']['knowledge_base_type'];
          file_path?: string | null;
          status?: string;
          size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          type?: Database['public']['Enums']['knowledge_base_type'];
          file_path?: string | null;
          status?: string;
          size?: number | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      knowledge_base_files: {
        Row: {
          id: string;
          knowledge_base_id: string;
          file_name: string;
          file_type: string | null;
          file_path: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          knowledge_base_id: string;
          file_name: string;
          file_type?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          knowledge_base_id?: string;
          file_name?: string;
          file_type?: string | null;
          file_path?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'knowledge_base_files_knowledge_base_id_fkey';
            columns: ['knowledge_base_id'];
            referencedRelation: 'knowledge_base';
            referencedColumns: ['id'];
          }
        ];
      };

      files: {
        Row: {
          id: string;
          related_entity_type: string | null;
          related_entity_id: string | null;
          file_name: string;
          file_type: string | null;
          file_path: string | null;
          uploaded_by: string;
          category: string | null;
          extension: string | null;
          created_at: string;
          updated_at: string;
          size: number;
          type: "file" | "folder";
          status: string;
          mime_type: string | null;
          parent_id: string | null;
          archived_at: string | null;
          deleted_at: string | null;
          metadata: Record<string, any> | null;
        };
        Insert: {
          id?: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          file_name: string;
          file_type?: string | null;
          file_path?: string | null;
          uploaded_by: string;
          category?: string | null;
          extension?: string | null;
          created_at?: string;
          updated_at?: string;
          size?: number;
          type?: "file" | "folder";
          status?: string;
          mime_type?: string | null;
          parent_id?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
          metadata?: Record<string, any> | null;
        };
        Update: {
          id?: string;
          related_entity_type?: string | null;
          related_entity_id?: string | null;
          file_name?: string;
          file_type?: string | null;
          file_path?: string | null;
          uploaded_by?: string;
          category?: string | null;
          extension?: string | null;
          created_at?: string;
          updated_at?: string;
          size?: number;
          type?: "file" | "folder";
          status?: string;
          mime_type?: string | null;
          parent_id?: string | null;
          archived_at?: string | null;
          deleted_at?: string | null;
          metadata?: Record<string, any> | null;
        };
        Relationships: [
          {
            foreignKeyName: "files_uploaded_by_fkey";
            columns: ["uploaded_by"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
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
        Insert: {
          file_id: string;
          user_id: string;
          archived_at: string;
          restored_at?: string | null;
        };
        Update: {
          file_id?: string;
          user_id?: string;
          archived_at?: string;
          restored_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: "archives_file_id_fkey";
            columns: ["file_id"];
            referencedRelation: "files";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "archives_user_id_fkey";
            columns: ["user_id"];
            referencedRelation: "users";
            referencedColumns: ["id"];
          }
        ];
      };

      file_settings: {
        Row: {
          id: number;
          max_file_size: number | null;
          allowed_file_types: string[] | null;
          updated_at: string;
        };
        Insert: {
          id?: number;
          max_file_size?: number | null;
          allowed_file_types?: string[] | null;
          updated_at?: string;
        };
        Update: {
          id?: number;
          max_file_size?: number | null;
          allowed_file_types?: string[] | null;
          updated_at?: string;
        };
        Relationships: [];
      };

      file_versions: {
        Row: {
          id: string;
          file_id: string;
          version_number: number;
          file_path: string | null;
          uploaded_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          file_id: string;
          version_number: number;
          file_path?: string | null;
          uploaded_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          file_id?: string;
          version_number?: number;
          file_path?: string | null;
          uploaded_by?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'file_versions_file_id_fkey';
            columns: ['file_id'];
            referencedRelation: 'files';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'file_versions_uploaded_by_fkey';
            columns: ['uploaded_by'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      trash: {
        Row: {
          id: string;
          name: string | null;
          size: number | null;
          description: string | null;
          tags: string[] | null;
          type: string | null;
          status: string;
          user_id: string;
          deleted_at: string;
          created_at: string;
          modified_at: string;
        };
        Insert: {
          id?: string;
          name?: string | null;
          size?: number | null;
          description?: string | null;
          tags?: string[] | null;
          type?: string | null;
          status?: string;
          user_id: string;
          deleted_at?: string;
          created_at?: string;
          modified_at?: string;
        };
        Update: {
          name?: string | null;
          size?: number | null;
          description?: string | null;
          tags?: string[] | null;
          type?: string | null;
          status?: string;
          deleted_at?: string;
          modified_at?: string;
        };
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
            foreignKeyName: 'email_accounts_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      email_sync_status: {
        Row: {
          id: string
          account_id: string
          status: 'syncing' | 'error' | 'success'
          last_sync: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          account_id: string
          status: 'syncing' | 'error' | 'success'
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          account_id?: string
          status?: 'syncing' | 'error' | 'success'
          last_sync?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "email_sync_status_account_id_fkey"
            columns: ["account_id"]
            referencedRelation: "email_accounts"
            referencedColumns: ["id"]
          }
        ]
      }

      emails: {
        Row: {
          id: string;
          user_id: string;
          email_account_id: string;
          subject: string | null;
          sender: string | null;
          recipient: Json | null;
          email_body: string | null;
          status: Database['public']['Enums']['email_status'];
          created_at: string;
          updated_at: string;
          metadata: Json;
        };
        Insert: {
          id?: string;
          user_id: string;
          email_account_id: string;
          subject?: string | null;
          sender?: string | null;
          recipient?: Json | null;
          email_body?: string | null;
          status?: Database['public']['Enums']['email_status'];
          created_at?: string;
          updated_at?: string;
          metadata: Json;
        };
        Update: {
          id?: string;
          user_id?: string;
          email_account_id?: string;
          subject?: string | null;
          sender?: string | null;
          recipient?: Json | null;
          email_body?: string | null;
          status?: Database['public']['Enums']['email_status'];
          created_at?: string;
          updated_at?: string;
          metadata: Json;
        };
        Relationships: [
          {
            foreignKeyName: 'emails_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'emails_email_account_id_fkey';
            columns: ['email_account_id'];
            referencedRelation: 'email_accounts';
            referencedColumns: ['id'];
          }
        ];
      };

      tone_analysis: {
        Row: {
          id: string;
          email_id: string;
          personality_id: string;
          tone_id: string;
          sentiment: string | null;
          context: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          email_id: string;
          personality_id: string;
          tone_id: string;
          sentiment?: string | null;
          context?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          email_id?: string;
          personality_id?: string;
          tone_id?: string;
          sentiment?: string | null;
          context?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'tone_analysis_email_id_fkey';
            columns: ['email_id'];
            referencedRelation: 'emails';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tone_analysis_personality_id_fkey';
            columns: ['personality_id'];
            referencedRelation: 'personalities';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'tone_analysis_tone_id_fkey';
            columns: ['tone_id'];
            referencedRelation: 'tones';
            referencedColumns: ['id'];
          }
        ];
      };

      audio_transcriptions: {
        Row: {
          id: string;
          chat_id: string;
          user_id: string;
          audio_file_path: string;
          transcription_text: string | null;
          language: string | null;
          duration: number | null;
          status: Database['public']['Enums']['audio_status'];
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          user_id: string;
          audio_file_path: string;
          transcription_text?: string | null;
          language?: string | null;
          duration?: number | null;
          status?: Database['public']['Enums']['audio_status'];
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          user_id?: string;
          audio_file_path?: string;
          transcription_text?: string | null;
          language?: string | null;
          duration?: number | null;
          status?: Database['public']['Enums']['audio_status'];
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audio_transcriptions_chat_id_fkey';
            columns: ['chat_id'];
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'audio_transcriptions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      voice_messages: {
        Row: {
          id: string;
          chat_id: string;
          sender_id: string;
          audio_file_path: string;
          duration: number | null;
          transcription_id: string | null;
          status: Database['public']['Enums']['audio_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          chat_id: string;
          sender_id: string;
          audio_file_path: string;
          duration?: number | null;
          transcription_id?: string | null;
          status?: Database['public']['Enums']['audio_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          chat_id?: string;
          sender_id?: string;
          audio_file_path?: string;
          duration?: number | null;
          transcription_id?: string | null;
          status?: Database['public']['Enums']['audio_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'voice_messages_chat_id_fkey';
            columns: ['chat_id'];
            referencedRelation: 'chats';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'voice_messages_sender_id_fkey';
            columns: ['sender_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'voice_messages_transcription_id_fkey';
            columns: ['transcription_id'];
            referencedRelation: 'audio_transcriptions';
            referencedColumns: ['id'];
          }
        ];
      };

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
        Relationships: [];
      };

      llms: {
        Row: {
          id: string;
          name: string;
          theme: string | null;
          description: string | null;
          api_endpoint: string | null;
          provider_id: string;
          status: Database['public']['Enums']['llm_status'];
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          theme?: string | null;
          description?: string | null;
          api_endpoint?: string | null;
          provider_id: string;
          status?: Database['public']['Enums']['llm_status'];
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          theme?: string | null;
          description?: string | null;
          api_endpoint?: string | null;
          provider_id?: string;
          status?: Database['public']['Enums']['llm_status'];
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'llms_provider_id_fkey';
            columns: ['provider_id'];
            referencedRelation: 'llm_providers';
            referencedColumns: ['id'];
          }
        ];
      };

      llm_features: {
        Row: {
          id: string;
          llm_id: string;
          feature: string;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          llm_id: string;
          feature: string;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          llm_id?: string;
          feature?: string;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'llm_features_llm_id_fkey';
            columns: ['llm_id'];
            referencedRelation: 'llms';
            referencedColumns: ['id'];
          }
        ];
      };

      llm_usage_logs: {
        Row: {
          id: string;
          llm_id: string;
          user_id: string;
          request_payload: Json | null;
          response_payload: Json | null;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          llm_id: string;
          user_id: string;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          llm_id?: string;
          user_id?: string;
          request_payload?: Json | null;
          response_payload?: Json | null;
          status?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'llm_usage_logs_llm_id_fkey';
            columns: ['llm_id'];
            referencedRelation: 'llms';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'llm_usage_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      llm_configurations: {
        Row: {
          id: string;
          name: string;
          provider: string;
          api_endpoint: string;
          capabilities: string[];
          max_tokens: number;
          default_params: Json;
          platform_api_key?: string;
          is_enabled: boolean;
          cost: {
            prompt_tokens: number;
            completion_tokens: number;
            currency: string;
          };
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          provider: string;
          api_endpoint: string;
          capabilities: string[];
          max_tokens: number;
          default_params: Json;
          platform_api_key?: string;
          is_enabled?: boolean;
          cost: {
            prompt_tokens: number;
            completion_tokens: number;
            currency: string;
          };
        };
        Update: {
          name?: string;
          provider?: string;
          api_endpoint?: string;
          capabilities?: string[];
          max_tokens?: number;
          default_params?: Json;
          platform_api_key?: string;
          is_enabled?: boolean;
          cost?: {
            prompt_tokens: number;
            completion_tokens: number;
            currency: string;
          };
        };
        Relationships: [];
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
        };
        Update: {
          llm_id?: string;
          user_id?: string;
          api_key?: string;
          is_enabled?: boolean;
        };
      };

      accounts: {
        Row: {
          id: string;
          type: Database['public']['Enums']['account_type'];
          name: string;
          domain: string | null;
          organization_number: string | null;
          tax_id: string | null;
          contact_emails: string[] | null;
          contact_phone: string | null;
          website: string | null;
          billing_address: Json | null;
          payment_method: Json | null;
          currency: string | null;
          display_picture: string | null;
          banner_image: string | null;
          timezone: string | null;
          address_line1: string | null;
          address_line2: string | null;
          city: string | null;
          state: string | null;
          zip_code: string | null;
          metadata: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
          credits: number | null;
          trial_credits: number | null; // Add this line
        };
        Insert: {
          id?: string;
          type: Database['public']['Enums']['account_type'];
          name: string;
          domain?: string | null;
          organization_number?: string | null;
          tax_id?: string | null;
          contact_emails?: string[] | null;
          contact_phone?: string | null;
          website?: string | null;
          billing_address?: Json | null;
          payment_method?: Json | null;
          currency?: string | null;
          display_picture?: string | null;
          banner_image?: string | null;
          timezone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          credits: number | null;
          trial_credits: number | null; // Add this line
        };
        Update: {
          id?: string;
          type?: Database['public']['Enums']['account_type'];
          name?: string;
          domain?: string | null;
          organization_number?: string | null;
          tax_id?: string | null;
          contact_emails?: string[] | null;
          contact_phone?: string | null;
          website?: string | null;
          billing_address?: Json | null;
          payment_method?: Json | null;
          currency?: string | null;
          display_picture?: string | null;
          banner_image?: string | null;
          timezone?: string | null;
          address_line1?: string | null;
          address_line2?: string | null;
          city?: string | null;
          state?: string | null;
          zip_code?: string | null;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
          credits: number | null;
          trial_credits: number | null; // Add this line
        };
        Relationships: [];
      };

      teams: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          metadata: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      roles: {
        Row: {
          id: string;
          name: string;
          status: string;
          permission_scheme_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          status?: string;
          permission_scheme_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          status?: string;
          permission_scheme_id?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'roles_permission_scheme_id_fkey';
            columns: ['permission_scheme_id'];
            referencedRelation: 'permission_schemes';
            referencedColumns: ['id'];
          }
        ];
      };

      permission_schemes: {
        Row: {
          id: string;
          name: string;
          description: string | null;
          permissions: Json;
          is_super_admin: boolean;
          is_account_admin: boolean;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string | null;
          permissions: Json;
          is_super_admin?: boolean;
          is_account_admin?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          description?: string | null;
          permissions?: Json;
          is_super_admin?: boolean;
          is_account_admin?: boolean;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };

      account_users: {
        Row: {
          id: string;
          account_id: string;
          user_id: string;
          role_id: string;
          is_primary: boolean;
          metadata: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          user_id: string;
          role_id: string;
          is_primary?: boolean;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          user_id?: string;
          role_id?: string;
          is_primary?: boolean;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'account_users_account_id_fkey';
            columns: ['account_id'];
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'account_users_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'account_users_role_id_fkey';
            columns: ['role_id'];
            referencedRelation: 'roles';
            referencedColumns: ['id'];
          }
        ];
      };

      account_teams: {
        Row: {
          id: string;
          account_id: string;
          team_id: string;
          metadata: Json | null;
          status: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          account_id: string;
          team_id: string;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          account_id?: string;
          team_id?: string;
          metadata?: Json | null;
          status?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'account_teams_account_id_fkey';
            columns: ['account_id'];
            referencedRelation: 'accounts';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'account_teams_team_id_fkey';
            columns: ['team_id'];
            referencedRelation: 'teams';
            referencedColumns: ['id'];
          }
        ];
      };

      notifications: {
        Row: {
          id: string;
          user_id: string;
          notification_type: string;
          message: string | null;
          status: string;
          created_at: string;
          read_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          notification_type: string;
          message?: string | null;
          status?: string;
          created_at?: string;
          read_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          notification_type?: string;
          message?: string | null;
          status?: string;
          created_at?: string;
          read_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'notifications_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      audit_logs: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          entity_type: string | null;
          entity_id: string | null;
          details: Json | null;
          description: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json | null;
          description?: string | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          entity_type?: string | null;
          entity_id?: string | null;
          details?: Json | null;
          description?: string | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'audit_logs_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      activity_log: {
        Row: {
          id: string;
          user_id: string;
          action: string;
          details: Json | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          action: string;
          details?: Json | null;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          action?: string;
          details?: Json | null;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'activity_log_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      login_sessions: {
        Row: {
          id: string;
          user_id: string;
          ip_address: string | null;
          device: string | null;
          status: string;
          logged_in_at: string;
          logged_out_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          ip_address?: string | null;
          device?: string | null;
          status?: string;
          logged_in_at?: string;
          logged_out_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          ip_address?: string | null;
          device?: string | null;
          status?: string;
          logged_in_at?: string;
          logged_out_at?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'login_sessions_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      recent_devices: {
        Row: {
          id: string;
          user_id: string;
          device: string | null;
          ip_address: string | null;
          last_used_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          device?: string | null;
          ip_address?: string | null;
          last_used_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          device?: string | null;
          ip_address?: string | null;
          last_used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recent_devices_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
          }
        ];
      };

      system_settings: {
        Row: {
          id: string;
          key: string;
          value: Json;
          description: string | null;
          is_encrypted: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          key: string;
          value: Json;
          description?: string | null;
          is_encrypted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          key?: string;
          value?: Json;
          description?: string | null;
          is_encrypted?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      
      templates: {
        Row: {
          id: string;
          name: string;
          description: string;
          category: string;
          metadata: Json;
          configuration: Json;
          prompts: Json;
          validation: Json;
          version: string;
          created_at: string;
          updated_at: string;
          user_id: string;
          archived: boolean;
        };
        Insert: {
          id?: string;
          name: string;
          description?: string;
          category: string;
          metadata: Json;
          configuration: Json;
          prompts: Json;
          validation: Json;
          version?: string;
          created_at?: string;
          updated_at?: string;
          user_id: string;
          archived?: boolean;
        };
        Update: {
          name?: string;
          description?: string;
          category?: string;
          metadata?: Json;
          configuration?: Json;
          prompts?: Json;
          validation?: Json;
          version?: string;
          updated_at?: string;
          archived?: boolean;
        };
      };
      
      template_versions: {
        Row: {
          id: string;
          template_id: string;
          version: string;
          changes: Json;
          template_data: Json;
          created_at: string;
          created_by: string;
        };
        Insert: {
          id?: string;
          template_id: string;
          version: string;
          changes: Json;
          template_data: Json;
          created_at?: string;
          created_by: string;
        };
        Update: {
          changes?: Json;
          template_data?: Json;
        };
      };
      
      template_usage: {
        Row: {
          id: string;
          template_id: string;
          user_id: string;
          timestamp: string;
          inputs: Json;
          result: Json;
          metrics: Json;
        };
        Insert: {
          id?: string;
          template_id: string;
          user_id: string;
          timestamp?: string;
          inputs: Json;
          result: Json;
          metrics: Json;
        };
        Update: {
          inputs?: Json;
          result?: Json;
          metrics?: Json;
        };
      };

      scopes: {
        Row: {
          id: string;
          type: string; // USER-DEFINED enum (scope_type)
          name: string;
          description: string | null;
          context: Json;
          llm_preferences: Json | null;
          template_id: string | null;
          metadata: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          name: string;
          description?: string | null;
          context: Json;
          llm_preferences?: Json | null;
          template_id?: string | null;
          metadata?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          type?: string;
          name?: string;
          description?: string | null;
          context?: Json;
          llm_preferences?: Json | null;
          template_id?: string | null;
          metadata?: Json | null;
          updated_at?: string;
        };
      };

      classification_rules: {
        Row: {
          id: string;
          category: string;
          patterns: string[];
          keywords: string[];
          weight: number;
          llm_mapping: string[];
          min_confidence: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          category: string;
          patterns: string[];
          keywords: string[];
          weight: number;
          llm_mapping: string[];
          min_confidence: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category?: string;
          patterns?: string[];
          keywords?: string[];
          weight?: number;
          llm_mapping?: string[];
          min_confidence?: number;
          updated_at?: string;
        };
      };
      
      routing_history: {
        Row: {
          id: string;
          request_id: string;
          llm_used: string;
          token_usage: Json;
          costs: Json;
          timing: Json;
          metadata: Json;
          status: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          request_id: string;
          llm_used: string;
          token_usage: Json;
          costs: Json;
          timing: Json;
          metadata?: Json;
          status?: string;
          created_at?: string;
        };
        Update: {
          request_id?: string;
          llm_used?: string;
          token_usage?: Json;
          costs?: Json;
          timing?: Json;
          metadata?: Json;
          status?: string;
        };
      };
      
      routing_errors: {
        Row: {
          id: string;
          error_code: string;
          error_message: string;
          llm_id?: string;
          context?: Json;
          created_at: string;
        };
        Insert: {
          id?: string;
          error_code: string;
          error_message: string;
          llm_id?: string;
          context?: Json;
          created_at?: string;
        };
        Update: {
          error_code?: string;
          error_message?: string;
          llm_id?: string;
          context?: Json;
        };
      };

    };

    Views: {
      [_ in never]: never;
    };
    Functions: {
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
      get_trash_storage_usage: {
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
    };
    Enums: {
      pricing_plan_interval: 'day' | 'week' | 'month' | 'year';
      pricing_type: 'one_time' | 'recurring';
      subscription_status: 'trialing' | 'active' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid' | 'paused';
      audio_status: 'pending' | 'processing' | 'completed' | 'failed';
      knowledge_base_type: 'public' | 'private' | 'safeguard';
      chat_type: 'direct' | 'group' | 'ai';
      email_status: 'pending' | 'analyzed' | 'deleted';
      llm_status: 'active' | 'deprecated' | 'testing';
      account_type: 'personal' | 'company';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}
  
// Generic type for tables
export type Tables<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Row: infer R;
    }
    ? R
    : never
  : never;

// Generic type for table inserts
export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Insert: infer I;
    }
    ? I
    : never
  : never;

// Generic type for table updates
export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof Database['public']['Tables']
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
    : never = never
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof Database['public']['Tables']
  ? Database['public']['Tables'][PublicTableNameOrOptions] extends {
      Update: infer U;
    }
    ? U
    : never
  : never;

// Generic type for enums
export type Enums<
  PublicEnumNameOrOptions extends
    | keyof Database['public']['Enums']
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
    : never = never
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
  : PublicEnumNameOrOptions extends keyof Database['public']['Enums']
  ? Database['public']['Enums'][PublicEnumNameOrOptions]
  : never;