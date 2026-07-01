import { format } from 'date-fns'
import {
	Apple,
	Beef,
	Calendar,
	CupSoda,
	Minus,
	Plus,
	ShoppingBasket,
	SquarePen,
	Trash2,
} from 'lucide-react'
import { motion } from 'motion/react'
import { type JSX, memo, useState } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from '@/components/ui/card'
import { getTagBadgeClass } from '@/lib/tagColors'
import { cn, getExpiryStatus } from '@/lib/utils'
import type { Item } from '@/types/database'

const iconClass = 'h-10 w-10 text-zinc-300 dark:text-zinc-600'

const get_default_image = (name: string): JSX.Element => {
	const lowerName = name.toLowerCase()
	if (
		['coke', 'pepsi', 'sprite', 'soda', 'mini cokes', 'mini coke'].includes(
			lowerName,
		)
	)
		return <CupSoda className={iconClass} />
	if (['beef', 'steak', 'ground beef'].includes(lowerName))
		return <Beef className={iconClass} />
	if (['apple', 'green apple', 'red apple', 'yellow apple'].includes(lowerName))
		return <Apple className={iconClass} />
	return <ShoppingBasket className={iconClass} />
}

export const ItemCard = memo(
	({
		item,
		onEdit,
		onRemove,
		onUpdateQuantity,
		onUpdatePercentage,
		tagColors = {},
	}: {
		item: Item
		onEdit: (item: Item) => void
		onRemove: (id: string, name: string) => void
		onUpdateQuantity: (id: string, quantity: number) => void
		onUpdatePercentage: (id: string, percentage: number) => void
		tagColors?: Record<string, string>
	}) => {
		const status = getExpiryStatus(item.expiry_date)
		const [imgError, setImgError] = useState(false)
		return (
			<motion.div
				layout
				initial={{ opacity: 0, y: 10 }}
				animate={{ opacity: 1, y: 0 }}
				exit={{ opacity: 0, scale: 0.95 }}
				className="group"
			>
				<Card
					onDoubleClick={() => onEdit(item)}
					title="Double-click to edit"
					className="hover:cursor-pointer overflow-hidden bg-white/40 dark:bg-zinc-900/40 backdrop-blur-xl border border-white/30 dark:border-white/10 ring-0 shadow-lg shadow-black/5 transition-all hover:shadow-xl hover:bg-white/55 dark:hover:bg-zinc-900/55 h-full flex flex-col gap-0 py-4"
				>
					<CardHeader className="pb-2 space-y-1 relative">
						<div className="flex justify-between items-start">
							<CardTitle className="text-lg text-wrap font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-green-600 transition-colors truncate">
								{item.name}
							</CardTitle>

							<span className="text-nowrap">
								<Button
									aria-label="Edit Button"
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer"
									onClick={() => onEdit(item)}
								>
									<SquarePen className="h-4 w-4" />
								</Button>
								<Button
									aria-label="Delete Button"
									variant="ghost"
									size="icon"
									className="h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer"
									onClick={() => onRemove(item.id, item.name)}
								>
									<Trash2 className="h-4 w-4" />
								</Button>
							</span>
						</div>
						{status && (
							<Badge
								style={{
									top: '-12px',
									left: '-12px',
									rotate: '-8deg',
								}}
								variant="secondary"
								className={`${status.color} absolute text-white border-none py-0 px-2 h-5 text-[10px] uppercase font-bold`}
							>
								{status.label}
							</Badge>
						)}
					</CardHeader>
					<CardDescription className="text-right text-zinc-500 dark:text-zinc-400 px-4">
						{item.expiry_date && (
							<div className="flex items-center text-xs text-zinc-500 dark:text-zinc-400">
								<Calendar className="h-3 w-3 mr-1" />
								{format(new Date(item.expiry_date), 'MMM d')}
							</div>
						)}
					</CardDescription>
					<div className="px-0 py-2 flex justify-center">
						<div className="relative w-full h-72 overflow-hidden bg-white/30 dark:bg-zinc-800/30 flex items-center justify-center">
							{!imgError ? (
								item.image_url ? (
									<img
										src={item.image_url}
										alt={item.name}
										className="w-full h-full object-cover"
										onError={() => setImgError(true)}
									/>
								) : (
									get_default_image(item.name)
								)
							) : (
								<ShoppingBasket className="h-10 w-10 text-zinc-300 dark:text-zinc-600" />
							)}
							{item.tracking_type === 'percentage' && (
								<div className="absolute bottom-0 left-0 right-0 h-3 bg-black/10 dark:bg-white/10">
									<div
										className={`h-full transition-all ${
											(item.percentage_remaining ?? 100) >= 50
												? 'bg-green-500'
												: (item.percentage_remaining ?? 100) >= 25
													? 'bg-yellow-500'
													: 'bg-red-500'
										}`}
										style={{ width: `${item.percentage_remaining ?? 100}%` }}
									/>
								</div>
							)}
						</div>
					</div>
					{(item.tags ?? []).length > 0 && (
						<div className="flex flex-wrap gap-1 px-4 pb-1">
							{(item.tags ?? []).map((tag) => (
								<Badge
									key={tag}
									variant="outline"
									className={cn(
										'text-[10px] px-1.5 py-0 h-4 border',
										getTagBadgeClass(tagColors[tag]) ??
											'border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400',
									)}
								>
									{tag}
								</Badge>
							))}
						</div>
					)}
					<CardContent className="mt-auto pt-2 pb-2">
						{item.tracking_type === 'percentage' ? (
							<div className="flex items-center gap-2">
								<Button
									variant="outline"
									size="icon"
									className="h-10 w-16 shrink-0 hover:cursor-pointer"
									onClick={() =>
										onUpdatePercentage(
											item.id,
											Math.max(0, (item.percentage_remaining ?? 100) - 10),
										)
									}
								>
									<Minus className="h-5 w-5" />
								</Button>
								<span className="flex-1 text-sm font-medium text-center text-zinc-500 dark:text-zinc-400">
									{item.percentage_remaining ?? 100}%
								</span>
								<Button
									variant="outline"
									size="icon"
									className="h-10 w-16 shrink-0 hover:cursor-pointer"
									onClick={() =>
										onUpdatePercentage(
											item.id,
											Math.min(100, (item.percentage_remaining ?? 100) + 10),
										)
									}
								>
									<Plus className="h-5 w-5" />
								</Button>
							</div>
						) : (
							<div className="flex items-center justify-center">
								<div className="flex w-full justify-between items-center space-x-3">
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-16 hover:cursor-pointer"
										onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
									>
										<Minus className="h-5 w-5" />
									</Button>
									<span className="text-sm font-medium w-12 text-center text-nowrap">
										{item.quantity}{' '}
										<span className="text-zinc-500 text-xs ml-1">
											{item.unit}
											{item.quantity > 1 &&
											item.unit.lastIndexOf('s') !== item.unit.length - 1
												? 's'
												: ''}
										</span>
									</span>
									<Button
										variant="outline"
										size="icon"
										className="h-10 w-16 hover:cursor-pointer"
										onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
									>
										<Plus className="h-5 w-5" />
									</Button>
								</div>
							</div>
						)}
					</CardContent>
				</Card>
			</motion.div>
		)
	},
)
