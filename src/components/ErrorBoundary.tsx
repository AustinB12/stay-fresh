import { RefreshCw, TriangleAlert } from 'lucide-react'
import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/button'

interface ErrorBoundaryProps {
	children: ReactNode
}

interface ErrorBoundaryState {
	hasError: boolean
	error: Error | null
}

export class ErrorBoundary extends Component<
	ErrorBoundaryProps,
	ErrorBoundaryState
> {
	state: ErrorBoundaryState = { hasError: false, error: null }

	static getDerivedStateFromError(error: Error): ErrorBoundaryState {
		return { hasError: true, error }
	}

	componentDidCatch(error: Error, info: ErrorInfo) {
		console.error('Uncaught error:', error, info)
	}

	handleReset = () => {
		this.setState({ hasError: false, error: null })
		window.location.reload()
	}

	render() {
		if (!this.state.hasError) return this.props.children

		return (
			<div className="min-h-screen flex flex-col items-center justify-center bg-zinc-50 dark:bg-zinc-950 px-4 text-center space-y-4">
				<div className="bg-destructive/10 p-5 rounded-full">
					<TriangleAlert className="h-10 w-10 text-destructive" />
				</div>
				<div className="space-y-1">
					<h1 className="text-2xl font-black tracking-tight text-zinc-900 dark:text-zinc-50">
						Something went wrong
					</h1>
					<p className="text-zinc-500 dark:text-zinc-400 max-w-sm">
						An unexpected error occurred. Try reloading the page.
					</p>
				</div>
				<Button
					onClick={this.handleReset}
					className="bg-green-600 hover:bg-green-700 hover:cursor-pointer"
				>
					<RefreshCw className="h-4 w-4 mr-2" /> Reload
				</Button>
			</div>
		)
	}
}
