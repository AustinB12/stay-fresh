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
			items: {
				Row: {
					id: string
					user_id: string
					household_id: string
					name: string
					category: 'fridge' | 'pantry' | 'freezer'
					quantity: number
					unit: string
					expiry_date: string | null
					image_url: string | null
					created_at: string
					updated_at: string
					tags: string[] | null
					tracking_type: 'quantity' | 'percentage'
					percentage_remaining: number | null
				}
				Insert: {
					id?: string
					user_id: string
					household_id: string
					name: string
					category: 'fridge' | 'pantry' | 'freezer'
					quantity?: number
					unit?: string
					expiry_date?: string | null
					image_url?: string | null
					created_at?: string
					updated_at?: string
					tags?: string[] | null
					tracking_type?: 'quantity' | 'percentage'
					percentage_remaining?: number | null
				}
				Update: {
					id?: string
					user_id?: string
					household_id?: string
					name?: string
					category?: 'fridge' | 'pantry' | 'freezer'
					quantity?: number
					unit?: string
					expiry_date?: string | null
					image_url?: string | null
					created_at?: string
					updated_at?: string
					tags?: string[] | null
					tracking_type?: 'quantity' | 'percentage'
					percentage_remaining?: number | null
				}
				Relationships: []
			}
			households: {
				Row: {
					id: string
					name: string
					invite_code: string
					created_by: string
					created_at: string
				}
				Insert: {
					id?: string
					name: string
					invite_code?: string
					created_by: string
					created_at?: string
				}
				Update: {
					id?: string
					name?: string
					invite_code?: string
					created_by?: string
					created_at?: string
				}
				Relationships: []
			}
			household_members: {
				Row: {
					id: string
					household_id: string
					user_id: string
					role: 'owner' | 'member'
					joined_at: string
				}
				Insert: {
					id?: string
					household_id: string
					user_id: string
					role?: 'owner' | 'member'
					joined_at?: string
				}
				Update: {
					id?: string
					household_id?: string
					user_id?: string
					role?: 'owner' | 'member'
					joined_at?: string
				}
				Relationships: []
			}
			profiles: {
				Row: {
					id: string
					email: string | null
					full_name: string | null
					avatar_url: string | null
					updated_at: string
				}
				Insert: {
					id: string
					email?: string | null
					full_name?: string | null
					avatar_url?: string | null
					updated_at?: string
				}
				Update: {
					id?: string
					email?: string | null
					full_name?: string | null
					avatar_url?: string | null
					updated_at?: string
				}
				Relationships: []
			}
			user_tag_colors: {
				Row: {
					user_id: string
					tag: string
					color: string
				}
				Insert: {
					user_id: string
					tag: string
					color: string
				}
				Update: {
					user_id?: string
					tag?: string
					color?: string
				}
				Relationships: []
			}
		}
		Views: { [_ in never]: never }
		Functions: { [_ in never]: never }
		Enums: { [_ in never]: never }
		CompositeTypes: { [_ in never]: never }
	}
}

export type Item = Database['public']['Tables']['items']['Row']
export type Household = Database['public']['Tables']['households']['Row']
export type HouseholdMember =
	Database['public']['Tables']['household_members']['Row']
export type Profile = Database['public']['Tables']['profiles']['Row']
