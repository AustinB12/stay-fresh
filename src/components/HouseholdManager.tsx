import {
	Check,
	Copy,
	Crown,
	Home,
	LogOut,
	Plus,
	RefreshCw,
	User as UserIcon,
	UserMinus,
} from 'lucide-react'
import { useMemo, useState } from 'react'
import { toast } from 'sonner'
import { useAuth } from '@/components/AuthProvider'
import { Badge } from '@/components/ui/badge'
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

export default function HouseholdManager() {
	const { user } = useAuth()
	const {
		households,
		activeHousehold,
		members,
		memberProfiles,
		setActiveHousehold,
		createHousehold,
		leaveHousehold,
		regenerateInviteCode,
		removeMember,
	} = useHousehold()

	const [newName, setNewName] = useState('')
	const [creating, setCreating] = useState(false)
	const [copied, setCopied] = useState(false)
	const [regenerating, setRegenerating] = useState(false)

	const currentMembership = useMemo(
		() => members.find((m) => m.user_id === user?.id),
		[members, user],
	)
	const isOwner = currentMembership?.role === 'owner'
	const ownerCount = members.filter((m) => m.role === 'owner').length

	const handleCreate = async () => {
		if (!newName.trim()) return
		setCreating(true)
		try {
			await createHousehold(newName)
			toast.success(`Household "${newName.trim()}" created!`)
			setNewName('')
		} catch (error: any) {
			toast.error(`Failed to create household: ${error.message}`)
		} finally {
			setCreating(false)
		}
	}

	const handleLeave = async (householdId: string, name: string) => {
		try {
			await leaveHousehold(householdId)
			toast.success(`Left "${name}".`)
		} catch (error: any) {
			toast.error(`Failed to leave household: ${error.message}`)
		}
	}

	const handleCopyCode = async () => {
		if (!activeHousehold) return
		await navigator.clipboard.writeText(activeHousehold.invite_code)
		setCopied(true)
		toast.success('Invite code copied!')
		setTimeout(() => setCopied(false), 2000)
	}

	const handleRegenerate = async () => {
		if (!activeHousehold) return
		setRegenerating(true)
		try {
			await regenerateInviteCode(activeHousehold.id)
			toast.success('Invite code regenerated.')
		} catch (error: any) {
			toast.error(`Failed to regenerate code: ${error.message}`)
		} finally {
			setRegenerating(false)
		}
	}

	const handleRemoveMember = async (memberId: string) => {
		try {
			await removeMember(memberId)
			toast.success('Member removed.')
		} catch (error: any) {
			toast.error(`Failed to remove member: ${error.message}`)
		}
	}

	return (
		<div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
			<header className="space-y-1">
				<h1 className="text-3xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
					MY <span className="text-green-600">HOUSEHOLDS</span>
				</h1>
				<p className="text-zinc-500 dark:text-zinc-400 font-medium">
					Manage your households, members, and invite codes.
				</p>
			</header>

			{/* Your households */}
			<Card className="border-zinc-200 dark:border-zinc-700">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
						Your Households
					</CardTitle>
					<CardDescription>
						Switch between households or leave one you no longer use.
					</CardDescription>
				</CardHeader>
				<CardContent className="space-y-2">
					{households.map((household) => {
						const isActive = household.id === activeHousehold?.id
						const isSoleOwner = isActive && isOwner && ownerCount === 1
						return (
							<div
								key={household.id}
								className={`flex items-center justify-between gap-3 rounded-lg border px-3 py-2.5 ${
									isActive
										? 'border-green-600 bg-green-50 dark:bg-green-950/30'
										: 'border-zinc-200 dark:border-zinc-700'
								}`}
							>
								<div className="flex items-center gap-2 min-w-0">
									<Home className="h-4 w-4 shrink-0 text-green-600" />
									<span className="font-medium text-zinc-900 dark:text-zinc-50 truncate">
										{household.name}
									</span>
									{isActive && (
										<Badge className="bg-green-600 text-white border-none">
											Active
										</Badge>
									)}
								</div>
								<div className="flex items-center gap-2 shrink-0">
									{!isActive && (
										<Button
											size="sm"
											variant="outline"
											className="hover:cursor-pointer"
											onClick={() => setActiveHousehold(household)}
										>
											Switch
										</Button>
									)}
									<Button
										size="sm"
										variant="ghost"
										className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer disabled:opacity-40"
										disabled={isSoleOwner}
										title={
											isSoleOwner
												? 'You are the only owner. Promote another member or delete the household first.'
												: 'Leave household'
										}
										onClick={() => handleLeave(household.id, household.name)}
									>
										<LogOut className="h-4 w-4" />
									</Button>
								</div>
							</div>
						)
					})}
				</CardContent>
			</Card>

			{/* Active household details */}
			{activeHousehold && (
				<Card className="border-zinc-200 dark:border-zinc-700">
					<CardHeader className="pb-2">
						<CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
							{activeHousehold.name}
						</CardTitle>
						<CardDescription>Invite people and manage members.</CardDescription>
					</CardHeader>
					<CardContent className="space-y-5">
						<div className="space-y-1.5">
							<Label className="text-zinc-500 dark:text-zinc-400">
								Invite code
							</Label>
							<div className="flex items-center gap-2">
								<code className="flex-1 text-sm font-mono font-semibold text-zinc-900 dark:text-zinc-50 bg-zinc-50 dark:bg-zinc-800 rounded-lg px-3 py-2 border border-zinc-200 dark:border-zinc-700 tracking-widest">
									{activeHousehold.invite_code}
								</code>
								<Button
									size="icon"
									variant="outline"
									className="hover:cursor-pointer"
									onClick={handleCopyCode}
									title="Copy invite code"
								>
									{copied ? (
										<Check className="h-4 w-4 text-green-600" />
									) : (
										<Copy className="h-4 w-4" />
									)}
								</Button>
								{isOwner && (
									<Button
										size="icon"
										variant="outline"
										className="hover:cursor-pointer"
										onClick={handleRegenerate}
										disabled={regenerating}
										title="Regenerate invite code"
									>
										<RefreshCw
											className={`h-4 w-4 ${regenerating ? 'animate-spin' : ''}`}
										/>
									</Button>
								)}
							</div>
						</div>

						<div className="space-y-2">
							<Label className="text-zinc-500 dark:text-zinc-400">
								Members ({members.length})
							</Label>
							<div className="space-y-2">
								{members.map((member) => {
									const isSelf = member.user_id === user?.id
									const profile = memberProfiles[member.user_id]
									const displayName =
										profile?.full_name ||
										profile?.email ||
										`${member.user_id.slice(0, 8)}…`
									return (
										<div
											key={member.id}
											className="flex items-center justify-between gap-3 rounded-lg border border-zinc-200 dark:border-zinc-700 px-3 py-2"
										>
											<div className="flex items-center gap-2.5 min-w-0">
												<span className="relative h-8 w-8 shrink-0 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden flex items-center justify-center">
													{profile?.avatar_url ? (
														<img
															src={profile.avatar_url}
															alt={displayName}
															className="h-full w-full object-cover"
															referrerPolicy="no-referrer"
														/>
													) : (
														<UserIcon className="h-4 w-4 text-zinc-400 dark:text-zinc-500" />
													)}
												</span>
												<div className="flex flex-col min-w-0">
													<span className="text-sm font-medium text-zinc-900 dark:text-zinc-50 truncate">
														{isSelf ? 'You' : displayName}
													</span>
													{profile?.email && profile.full_name && (
														<span className="text-xs text-zinc-500 dark:text-zinc-400 truncate">
															{profile.email}
														</span>
													)}
												</div>
												{member.role === 'owner' && (
													<Badge
														variant="secondary"
														className="gap-1 bg-amber-100 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-none"
													>
														<Crown className="h-3 w-3" /> Owner
													</Badge>
												)}
											</div>
											{isOwner && !isSelf && (
												<Button
													size="sm"
													variant="ghost"
													className="text-destructive hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer"
													onClick={() => handleRemoveMember(member.id)}
													title="Remove member"
												>
													<UserMinus className="h-4 w-4" />
												</Button>
											)}
										</div>
									)
								})}
							</div>
						</div>
					</CardContent>
				</Card>
			)}

			{/* Create another household */}
			<Card className="border-zinc-200 dark:border-zinc-700">
				<CardHeader className="pb-2">
					<CardTitle className="text-lg font-semibold text-zinc-900 dark:text-zinc-50">
						Create Another Household
					</CardTitle>
					<CardDescription>
						Keep separate inventories for different places.
					</CardDescription>
				</CardHeader>
				<CardContent>
					<div className="flex items-center gap-2">
						<Input
							placeholder="Household name"
							value={newName}
							onChange={(e) => setNewName(e.target.value)}
							onKeyDown={(e) => e.key === 'Enter' && handleCreate()}
						/>
						<Button
							onClick={handleCreate}
							disabled={creating || !newName.trim()}
							className="bg-green-600 hover:bg-green-700 hover:cursor-pointer shrink-0"
						>
							<Plus className="h-4 w-4 mr-2" />
							{creating ? 'Creating…' : 'Create'}
						</Button>
					</div>
				</CardContent>
			</Card>
		</div>
	)
}
