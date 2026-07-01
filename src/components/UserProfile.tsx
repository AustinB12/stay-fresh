import { ImagePlus, Mail, Trash2, User } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'
import { toast } from 'sonner'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeProvider'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

export default function UserProfile() {
	const { user } = useAuth()
	const { theme, setTheme } = useTheme()
	const [fullName, setFullName] = useState<string | null>(null)
	const [avatarUrl, setAvatarUrl] = useState<string | null>(null)
	const [uploading, setUploading] = useState(false)
	const fileInputRef = useRef<HTMLInputElement>(null)

	useEffect(() => {
		if (!user) return
		let cancelled = false
		;(async () => {
			const { data } = await supabase
				.from('profiles')
				.select('full_name, avatar_url')
				.eq('id', user.id)
				.maybeSingle()
			if (!cancelled) {
				setFullName(data?.full_name ?? null)
				setAvatarUrl(data?.avatar_url ?? null)
			}
		})()
		return () => {
			cancelled = true
		}
	}, [user])

	const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0]
		if (!file || !user) return

		setUploading(true)
		try {
			const fileExt = file.name.split('.').pop()
			const filePath = `avatars/${user.id}.${fileExt}`

			const { error: uploadError } = await supabase.storage
				.from('images')
				.upload(filePath, file, { upsert: true })
			if (uploadError) throw uploadError

			const {
				data: { publicUrl },
			} = supabase.storage.from('images').getPublicUrl(filePath)

			const { error: updateError } = await supabase
				.from('profiles')
				.update({ avatar_url: publicUrl })
				.eq('id', user.id)
			if (updateError) throw updateError

			setAvatarUrl(publicUrl)
			toast.success('Profile photo updated!')
		} catch (err: any) {
			toast.error(`Failed to upload photo: ${err.message}`)
		} finally {
			setUploading(false)
			// Reset file input so the same file can be re-selected
			if (fileInputRef.current) fileInputRef.current.value = ''
		}
	}

	const handleAvatarDelete = async () => {
		if (!user) return
		setUploading(true)
		try {
			const { error } = await supabase
				.from('profiles')
				.update({ avatar_url: null })
				.eq('id', user.id)
			if (error) throw error

			setAvatarUrl(null)
			toast.success('Profile photo removed.')
		} catch (err: any) {
			toast.error(`Failed to remove photo: ${err.message}`)
		} finally {
			setUploading(false)
		}
	}

	return (
		<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<header className="space-y-1">
				<h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
					MY <span className="text-green-600">PROFILE</span>
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400 font-medium">
					View and manage your account information.
				</p>
			</header>

			<Card className="border-zinc-200 dark:border-zinc-700">
				<CardHeader className="flex flex-row items-start justify-between pb-2">
					<div className="space-y-1">
						<CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
							Account Details
						</CardTitle>
						<CardDescription>
							Your personal information on Stay Fresh.
						</CardDescription>
					</div>
				</CardHeader>
				<CardContent className="space-y-5">
					{/* Avatar */}
					<div className="space-y-1.5">
						<Label className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
							<ImagePlus className="h-3.5 w-3.5" /> Profile Photo
						</Label>
						<div className="flex items-center gap-4">
							<div className="relative h-20 w-20 shrink-0 rounded-full overflow-hidden bg-zinc-100 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 flex items-center justify-center">
								{avatarUrl ? (
									<img
										src={avatarUrl}
										alt="Profile"
										className="h-full w-full object-cover"
										referrerPolicy="no-referrer"
									/>
								) : (
									<User className="h-8 w-8 text-zinc-400 dark:text-zinc-500" />
								)}
							</div>
							<div className="flex flex-col gap-2">
								<input
									ref={fileInputRef}
									type="file"
									accept="image/*"
									className="hidden"
									onChange={handleAvatarChange}
								/>
								<button
									type="button"
									disabled={uploading}
									onClick={() => fileInputRef.current?.click()}
									className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-700 hover:cursor-pointer disabled:opacity-50 transition-colors"
								>
									<ImagePlus className="h-4 w-4" />
									{avatarUrl ? 'Replace' : 'Upload'} photo
								</button>
								{avatarUrl && (
									<button
										type="button"
										disabled={uploading}
										onClick={handleAvatarDelete}
										className="inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1.5 rounded-lg border border-transparent text-destructive hover:bg-destructive/10 hover:cursor-pointer disabled:opacity-50 transition-colors"
									>
										<Trash2 className="h-4 w-4" />
										Remove photo
									</button>
								)}
							</div>
						</div>
					</div>

					{/* Email — always read-only */}
					<div className="space-y-1.5">
						<Label className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
							<Mail className="h-3.5 w-3.5" /> Email
						</Label>
						<p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700">
							{user?.email}
						</p>
					</div>

					<div className="grid grid-cols-2 gap-4">
						<div className="space-y-1.5">
							<Label
								htmlFor="first_name"
								className="text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5"
							>
								<User className="h-3.5 w-3.5" /> Name
							</Label>

							<p className="text-sm font-medium text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700 min-h-9">
								{fullName || <span className="text-zinc-400">—</span>}
							</p>
						</div>
					</div>
				</CardContent>
			</Card>

			<Card className="border-zinc-200 dark:border-zinc-700">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
						Preferences
					</CardTitle>
					<CardDescription>
						Customize your Stay Fresh experience.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center justify-between">
						<Label
							htmlFor="dark-mode"
							className="text-zinc-700 dark:text-zinc-300 font-medium"
						>
							Dark Mode
						</Label>
						<Switch
							id="dark-mode"
							checked={theme === 'dark'}
							onCheckedChange={(checked) =>
								setTheme(checked ? 'dark' : 'light')
							}
						/>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
