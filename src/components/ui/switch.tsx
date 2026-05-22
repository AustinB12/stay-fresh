import { Switch as SwitchPrimitive } from '@base-ui/react/switch'
import { cn } from '@/lib/utils'

function Switch({
	className,
	checked,
	onCheckedChange,
	disabled,
	id,
}: {
	className?: string
	checked?: boolean
	onCheckedChange?: (checked: boolean) => void
	disabled?: boolean
	id?: string
}) {
	return (
		<SwitchPrimitive.Root
			id={id}
			checked={checked}
			onCheckedChange={onCheckedChange}
			disabled={disabled}
			className={cn(
				'relative inline-flex h-6 w-11 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors',
				'bg-zinc-200 data-checked:bg-green-600',
				'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-600 focus-visible:ring-offset-2',
				'disabled:cursor-not-allowed disabled:opacity-50',
				'dark:bg-zinc-700 dark:data-checked:bg-green-600',
				className,
			)}
		>
			<SwitchPrimitive.Thumb
				className={cn(
					'pointer-events-none block h-5 w-5 rounded-full bg-white shadow-sm ring-0 transition-transform',
					'translate-x-0 data-checked:translate-x-5',
				)}
			/>
		</SwitchPrimitive.Root>
	)
}

export { Switch }
