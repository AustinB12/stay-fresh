import { type ClassValue, clsx } from 'clsx'
import { addDays, isPast, isToday } from 'date-fns'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
	return twMerge(clsx(inputs))
}

export const getExpiryStatus = (date: string | null) => {
	if (!date) return null
	const expiry = new Date(date)
	if (isPast(expiry) && !isToday(expiry))
		return { label: 'Expired', color: 'bg-destructive' }
	if (isToday(expiry)) return { label: 'Expires Today', color: 'bg-orange-500' }
	if (isPast(addDays(new Date(), -3)) && expiry < addDays(new Date(), 3))
		return { label: 'Expiring Soon', color: 'bg-yellow-500' }
	return null
}
