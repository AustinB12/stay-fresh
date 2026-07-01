import { useEffect, useRef } from 'react'
import { toast } from 'sonner'

/**
 * Watches the browser's online/offline status and surfaces toasts when it
 * changes. Renders nothing.
 */
export function OfflineIndicator() {
	const offlineToastId = useRef<string | number | null>(null)

	useEffect(() => {
		const handleOffline = () => {
			offlineToastId.current = toast.error("You're offline", {
				description: 'Changes may not be saved until you reconnect.',
				duration: Number.POSITIVE_INFINITY,
			})
		}

		const handleOnline = () => {
			if (offlineToastId.current !== null) {
				toast.dismiss(offlineToastId.current)
				offlineToastId.current = null
			}
			toast.success('Back online')
		}

		window.addEventListener('offline', handleOffline)
		window.addEventListener('online', handleOnline)

		// Surface the current state on mount if already offline.
		if (!navigator.onLine) handleOffline()

		return () => {
			window.removeEventListener('offline', handleOffline)
			window.removeEventListener('online', handleOnline)
		}
	}, [])

	return null
}
