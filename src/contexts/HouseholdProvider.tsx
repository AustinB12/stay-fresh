import type * as React from 'react'
import {
	createContext,
	useCallback,
	useContext,
	useEffect,
	useState,
} from 'react'
import { useAuth } from '@/components/AuthProvider'
import { supabase } from '@/lib/supabase'
import type { Household, HouseholdMember, Profile } from '@/types/database'

const ACTIVE_HOUSEHOLD_KEY = 'stay-fresh:activeHouseholdId'

interface HouseholdContextType {
	households: Household[]
	activeHousehold: Household | null
	members: HouseholdMember[]
	memberProfiles: Record<string, Profile>
	loading: boolean
	setActiveHousehold: (household: Household) => void
	createHousehold: (name: string) => Promise<Household>
	joinHousehold: (inviteCode: string) => Promise<Household>
	leaveHousehold: (householdId: string) => Promise<void>
	regenerateInviteCode: (householdId: string) => Promise<string>
	removeMember: (memberId: string) => Promise<void>
	refresh: () => Promise<void>
}

const HouseholdContext = createContext<HouseholdContextType | undefined>(
	undefined,
)

function generateInviteCode(): string {
	return Array.from(crypto.getRandomValues(new Uint8Array(8)))
		.map((b) => (b % 36).toString(36))
		.join('')
}

export function HouseholdProvider({ children }: { children: React.ReactNode }) {
	const { user } = useAuth()
	const [households, setHouseholds] = useState<Household[]>([])
	const [activeHousehold, setActiveHouseholdState] = useState<Household | null>(
		null,
	)
	const [members, setMembers] = useState<HouseholdMember[]>([])
	const [memberProfiles, setMemberProfiles] = useState<Record<string, Profile>>(
		{},
	)
	const [loading, setLoading] = useState(true)

	const setActiveHousehold = useCallback((household: Household) => {
		setActiveHouseholdState(household)
		localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, household.id)
	}, [])

	const loadHouseholds = useCallback(async () => {
		if (!user) {
			setHouseholds([])
			setActiveHouseholdState(null)
			setLoading(false)
			return
		}
		setLoading(true)
		try {
			const { data: memberships, error: membershipError } = await supabase
				.from('household_members')
				.select('household_id')
				.eq('user_id', user.id)
			if (membershipError) throw membershipError

			const householdIds = (memberships ?? []).map((m) => m.household_id)
			if (householdIds.length === 0) {
				setHouseholds([])
				setActiveHouseholdState(null)
				return
			}

			const { data: householdRows, error: householdError } = await supabase
				.from('households')
				.select('*')
				.in('id', householdIds)
				.order('created_at', { ascending: true })
			if (householdError) throw householdError

			const rows = householdRows ?? []
			setHouseholds(rows)

			const storedId = localStorage.getItem(ACTIVE_HOUSEHOLD_KEY)
			const next = rows.find((h) => h.id === storedId) ?? rows[0] ?? null
			setActiveHouseholdState(next)
			if (next) localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, next.id)
		} finally {
			setLoading(false)
		}
	}, [user])

	useEffect(() => {
		loadHouseholds()
	}, [loadHouseholds])

	// Load members of the active household
	useEffect(() => {
		if (!activeHousehold) {
			setMembers([])
			setMemberProfiles({})
			return
		}
		let cancelled = false
		;(async () => {
			const { data } = await supabase
				.from('household_members')
				.select('*')
				.eq('household_id', activeHousehold.id)
				.order('joined_at', { ascending: true })
			if (cancelled) return
			const memberRows = data ?? []
			setMembers(memberRows)

			const userIds = memberRows.map((m) => m.user_id)
			if (userIds.length === 0) {
				setMemberProfiles({})
				return
			}
			const { data: profiles } = await supabase
				.from('profiles')
				.select('*')
				.in('id', userIds)
			if (cancelled) return
			setMemberProfiles(
				Object.fromEntries((profiles ?? []).map((p) => [p.id, p])),
			)
		})()
		return () => {
			cancelled = true
		}
	}, [activeHousehold])

	const createHousehold = useCallback(
		async (name: string): Promise<Household> => {
			if (!user) throw new Error('You must be signed in to create a household.')

			const { data: household, error } = await supabase
				.from('households')
				.insert({
					name: name.trim(),
					invite_code: generateInviteCode(),
					created_by: user.id,
				})
				.select('*')
				.single()
			if (error) throw error

			const { error: memberError } = await supabase
				.from('household_members')
				.insert({
					household_id: household.id,
					user_id: user.id,
					role: 'owner',
				})
			if (memberError) throw memberError

			setHouseholds((prev) => [...prev, household])
			setActiveHousehold(household)
			return household
		},
		[user, setActiveHousehold],
	)

	const joinHousehold = useCallback(
		async (inviteCode: string): Promise<Household> => {
			if (!user) throw new Error('You must be signed in to join a household.')

			const { data: household, error } = await supabase
				.from('households')
				.select('*')
				.eq('invite_code', inviteCode.trim().toLowerCase())
				.maybeSingle()
			if (error) throw error
			if (!household)
				throw new Error('No household found for that invite code.')

			if (households.some((h) => h.id === household.id)) {
				setActiveHousehold(household)
				return household
			}

			const { error: memberError } = await supabase
				.from('household_members')
				.insert({
					household_id: household.id,
					user_id: user.id,
					role: 'member',
				})
			if (memberError) throw memberError

			setHouseholds((prev) => [...prev, household])
			setActiveHousehold(household)
			return household
		},
		[user, households, setActiveHousehold],
	)

	const leaveHousehold = useCallback(
		async (householdId: string): Promise<void> => {
			if (!user) return

			const { error } = await supabase
				.from('household_members')
				.delete()
				.match({ household_id: householdId, user_id: user.id })
			if (error) throw error

			const remaining = households.filter((h) => h.id !== householdId)
			setHouseholds(remaining)
			if (activeHousehold?.id === householdId) {
				const next = remaining[0] ?? null
				setActiveHouseholdState(next)
				if (next) localStorage.setItem(ACTIVE_HOUSEHOLD_KEY, next.id)
				else localStorage.removeItem(ACTIVE_HOUSEHOLD_KEY)
			}
		},
		[user, households, activeHousehold],
	)

	const regenerateInviteCode = useCallback(
		async (householdId: string): Promise<string> => {
			const newCode = generateInviteCode()
			const { data, error } = await supabase
				.from('households')
				.update({ invite_code: newCode })
				.match({ id: householdId })
				.select('*')
				.single()
			if (error) throw error

			setHouseholds((prev) =>
				prev.map((h) => (h.id === householdId ? data : h)),
			)
			setActiveHouseholdState((prev) =>
				prev && prev.id === householdId ? data : prev,
			)
			return data.invite_code
		},
		[],
	)

	const removeMember = useCallback(async (memberId: string): Promise<void> => {
		const { error } = await supabase
			.from('household_members')
			.delete()
			.match({ id: memberId })
		if (error) throw error
		setMembers((prev) => prev.filter((m) => m.id !== memberId))
	}, [])

	return (
		<HouseholdContext.Provider
			value={{
				households,
				activeHousehold,
				members,
				memberProfiles,
				loading,
				setActiveHousehold,
				createHousehold,
				joinHousehold,
				leaveHousehold,
				regenerateInviteCode,
				removeMember,
				refresh: loadHouseholds,
			}}
		>
			{children}
		</HouseholdContext.Provider>
	)
}

export function useHousehold(): HouseholdContextType {
	const context = useContext(HouseholdContext)
	if (!context) {
		throw new Error('useHousehold must be used within a HouseholdProvider')
	}
	return context
}
