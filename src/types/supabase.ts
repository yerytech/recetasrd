export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  public: {
    Tables: {
      recipes: {
        Row: {
          id: string;
          title: string;
          category: string;
          image_url: string;
          ingredients: Json;
          preparation: string;
          author_id: string;
          location_data: Json | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          category: string;
          image_url: string;
          ingredients: Json;
          preparation: string;
          author_id: string;
          location_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          category?: string;
          image_url?: string;
          ingredients?: Json;
          preparation?: string;
          author_id?: string;
          location_data?: Json | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'recipes_author_id_fkey';
            columns: ['author_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
            isOneToOne: false;
          },
        ];
      };
      comments: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          user_name: string;
          content: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          user_name: string;
          content: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          user_name?: string;
          content?: string;
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'comments_recipe_id_fkey';
            columns: ['recipe_id'];
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
            isOneToOne: false;
          },
          {
            foreignKeyName: 'comments_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
            isOneToOne: false;
          },
        ];
      };
      ratings: {
        Row: {
          id: string;
          recipe_id: string;
          user_id: string;
          value: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          recipe_id: string;
          user_id: string;
          value: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          recipe_id?: string;
          user_id?: string;
          value?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ratings_recipe_id_fkey';
            columns: ['recipe_id'];
            referencedRelation: 'recipes';
            referencedColumns: ['id'];
            isOneToOne: false;
          },
          {
            foreignKeyName: 'ratings_user_id_fkey';
            columns: ['user_id'];
            referencedRelation: 'users';
            referencedColumns: ['id'];
            isOneToOne: false;
          },
        ];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
