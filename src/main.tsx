import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'
import { AuthProvider } from '@/components/AuthProvider'
import { ErrorBoundary } from '@/components/ErrorBoundary'
import { OfflineIndicator } from '@/components/OfflineIndicator'
import { Toaster } from '@/components/ui/sonner'
import { HouseholdProvider } from '@/contexts/HouseholdProvider'
import { ThemeProvider } from '@/contexts/ThemeProvider'

createRoot(document.getElementById('root') as HTMLElement).render(
	<StrictMode>
		<ErrorBoundary>
			<ThemeProvider>
				<AuthProvider>
					<HouseholdProvider>
						<App />
						<OfflineIndicator />
						<Toaster position="top-right" />
					</HouseholdProvider>
				</AuthProvider>
			</ThemeProvider>
		</ErrorBoundary>
	</StrictMode>,
)
