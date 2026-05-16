export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string;
          name: string;
          email: string | null;
          username: string | null;
          pin_hash: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          email?: string | null;
          username?: string | null;
          pin_hash: string;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["clients"]["Insert"]>;
      };
      galleries: {
        Row: {
          id: string;
          client_id: string;
          title: string;
          slug: string;
          cover_image_url: string | null;
          is_active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          client_id: string;
          title: string;
          slug: string;
          cover_image_url?: string | null;
          is_active?: boolean;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["galleries"]["Insert"]>;
      };
      gallery_images: {
        Row: {
          id: string;
          gallery_id: string;
          storage_path: string;
          thumbnail_path: string | null;
          filename: string;
          size: number | null;
          width: number | null;
          height: number | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          gallery_id: string;
          storage_path: string;
          thumbnail_path?: string | null;
          filename: string;
          size?: number | null;
          width?: number | null;
          height?: number | null;
          created_at?: string;
        };
        Update: Partial<Database["public"]["Tables"]["gallery_images"]["Insert"]>;
      };
      admin_users: {
        Row: {
          user_id: string;
          created_at: string;
        };
        Insert: {
          user_id: string;
          created_at?: string;
        };
        Update: never;
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
