import { TAG_COLOR_KEYS, TAG_COLORS, type TagColorKey } from '@/lib/tagColors'
import { cn } from '@/lib/utils'

interface TagColorPickerProps {
	currentColor?: string | null
	onSelect: (color: TagColorKey | null) => void
}

export function TagColorPicker({
	currentColor,
	onSelect,
}: TagColorPickerProps) {
	return (
		<div className="absolute z-50 top-full mt-1 left-0 p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-lg">
			<div className="flex flex-wrap gap-1.5 w-30">
				{TAG_COLOR_KEYS.map((key) => (
					<button
						key={key}
						type="button"
						onMouseDown={(e) => {
							e.preventDefault()
							e.stopPropagation()
							onSelect(currentColor === key ? null : key)
						}}
						className={cn(
							'h-5 w-5 rounded-full cursor-pointer transition-transform hover:scale-110',
							TAG_COLORS[key].dot,
							currentColor === key &&
								'ring-2 ring-offset-1 ring-zinc-500 dark:ring-zinc-400',
						)}
						title={key}
					/>
				))}
			</div>
		</div>
	)
}
