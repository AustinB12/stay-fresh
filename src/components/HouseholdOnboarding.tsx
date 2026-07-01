import { Home, LogIn, Plus } from 'lucide-react'
import { motion } from 'motion/react'
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
import { useHousehold } from '@/contexts/HouseholdProvider'

export default function HouseholdOnboarding() {
	const { createHousehold, joinHousehold } = useHousehold()
	const [name, setName] = useState('')
	const [inviteCode, setInviteCode] = useState('')
	const [creating, setCreating] = useState(false)
	const [joining, setJoining] = useState(false)

	const handleCreate = async () => {
		if (!name.trim()) return
		setCreating(true)
		try {
			await createHousehold(name)
			toast.success(`Household "${name.trim()}" created!`)
		} catch (error: any) {
			toast.error(`Failed to create household: ${error.message}`)
		} finally {
			setCreating(false)
		}
	}

	const handleJoin = async () => {
		if (!inviteCode.trim()) return
		setJoining(true)
		try {
			const household = await joinHousehold(inviteCode)
			toast.success(`Joined "${household.name}"!`)
		} catch (error: any) {
			toast.error(error.message ?? 'Failed to join household.')
		} finally {
			setJoining(false)
		}
	}

	return (
		<div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
			<motion.div
				initial={{ opacity: 0, y: 12 }}
				animate={{ opacity: 1, y: 0 }}
				className="w-full max-w-3xl space-y-8"
			>
				<header className="text-center space-y-2">
					<h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
						Welcome to <span className="text-green-600">Stay Fresh</span>
					</h1>
					<p className="text-zinc-500 dark:text-zinc-400 font-medium">
						Create your own household or join an existing one to get started.
					</p>
				</header>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{/* Create */}
					<Card className="border-zinc-200 dark:border-zinc-700">
						<CardHeader className="space-y-1">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
								<Plus className="h-5 w-5 text-green-600" /> Create a Household
							</CardTitle>
							<CardDescription>
								Start fresh with a new shared inventory.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="household-name">Household name</Label>
								<Input
									id="household-name"
									placeholder="Smith Family Fridge"
									value={name}
									onChange={(e) => setName(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
								/>
							</div>
							<Button
								onClick={handleCreate}
								disabled={creating || !name.trim()}
								className="w-full bg-green-600 hover:bg-green-700 hover:cursor-pointer"
							>
								<Plus className="h-4 w-4 mr-2" />
								{creating ? 'Creating…' : 'Create'}
							</Button>
						</CardContent>
					</Card>

					{/* Join */}
					<Card className="border-zinc-200 dark:border-zinc-700">
						<CardHeader className="space-y-1">
							<CardTitle className="flex items-center gap-2 text-lg font-semibold text-zinc-900 dark:text-zinc-50">
								<LogIn className="h-5 w-5 text-green-600" /> Join a Household
							</CardTitle>
							<CardDescription>
								Enter an invite code shared with you.
							</CardDescription>
						</CardHeader>
						<CardContent className="space-y-4">
							<div className="space-y-1.5">
								<Label htmlFor="invite-code">Invite code</Label>
								<Input
									id="invite-code"
									placeholder="e.g. 3f8a1c2b"
									value={inviteCode}
									onChange={(e) => setInviteCode(e.target.value)}
									onKeyDown={(e) => e.key === 'Enter' && handleJoin()}
								/>
							</div>
							<Button
								onClick={handleJoin}
								disabled={joining || !inviteCode.trim()}
								variant="outline"
								className="w-full hover:cursor-pointer"
							>
								<Home className="h-4 w-4 mr-2" />
								{joining ? 'Joining…' : 'Join'}
							</Button>
						</CardContent>
					</Card>
				</div>
			</motion.div>
		</div>
	)
}
