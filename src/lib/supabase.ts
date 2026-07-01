import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey)

if (!isConfigured) {
	console.warn(
		'Supabase credentials not found. Please set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in the Secrets panel.',
	)
}

export const supabase: SupabaseClient<Database> = isConfigured
	? createClient<Database>(supabaseUrl, supabaseAnonKey)
	: (new Proxy(
			{},
			{
				get(_, prop) {
					throw new Error(
						`Supabase is not configured. Field "${String(prop)}" cannot be accessed. ` +
							`Please provide VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY environment variables.`,
					)
				},
			},
		) as SupabaseClient<Database>)

/** Fetch all tag → color mappings for the current user. */
export async function fetchTagColors(
	userId: string,
): Promise<Record<string, string>> {
	const { data } = await supabase
		.from('user_tag_colors')
		.select('tag, color')
		.eq('user_id', userId)
	return Object.fromEntries((data ?? []).map(({ tag, color }) => [tag, color]))
}

/** Upsert a single tag colour. Pass color = null to remove. */
export async function setTagColor(
	userId: string,
	tag: string,
	color: string | null,
): Promise<void> {
	if (color === null) {
		await supabase
			.from('user_tag_colors')
			.delete()
			.match({ user_id: userId, tag })
	} else {
		await supabase
			.from('user_tag_colors')
			.upsert({ user_id: userId, tag, color })
	}
}
