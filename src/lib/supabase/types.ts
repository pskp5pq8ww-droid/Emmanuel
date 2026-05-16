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
        Relationships: [];
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
        Relationships: [
          {
            foreignKeyName: "galleries_client_id_fkey";
            columns: ["client_id"];
            isOneToOne: false;
            referencedRelation: "clients";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [
          {
            foreignKeyName: "gallery_images_gallery_id_fkey";
            columns: ["gallery_id"];
            isOneToOne: false;
            referencedRelation: "galleries";
            referencedColumns: ["id"];
          },
        ];
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
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
