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
      items: {
        Row: {
          id: string;
          user_id: string;
          name: string;
          category: 'fridge' | 'pantry' | 'freezer';
          quantity: number;
          unit: string;
          expiry_date: string | null;
          image_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          name: string;
          category: 'fridge' | 'pantry' | 'freezer';
          quantity?: number;
          unit?: string;
          expiry_date?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          name?: string;
          category?: 'fridge' | 'pantry' | 'freezer';
          quantity?: number;
          unit?: string;
          expiry_date?: string | null;
          image_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}

export type Item = Database['public']['Tables']['items']['Row'];
