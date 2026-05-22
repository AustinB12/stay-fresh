import { Mail, Save, SquarePen, User, X } from 'lucide-react'
import { useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { useTheme } from '@/contexts/ThemeProvider'
import { supabase } from '@/lib/supabase'
import { useAuth } from './AuthProvider'

export default function UserProfile() {
	const { user } = useAuth()
	const { theme, setTheme } = useTheme()

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
								{user?.user_metadata.full_name || (
									<span className="text-zinc-400">—</span>
								)}
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
