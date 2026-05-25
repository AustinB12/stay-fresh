import {
	AlertCircle,
	Container,
	type LucideProps,
	Plus,
	Refrigerator,
	Search,
	ShoppingBasket,
	Snowflake,
} from 'lucide-react'
import { AnimatePresence } from 'motion/react'
import { memo, useCallback, useEffect, useState } from 'react'
import { toast } from 'sonner'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { fetchTagColors, setTagColor, supabase } from '@/lib/supabase'
import { getTagBadgeClass } from '@/lib/tagColors'
import { cn } from '@/lib/utils'
import type { Item } from '@/types/database'
import { useAuth } from './AuthProvider'
import { AddItemDialog } from './Items/AddItemDialog'
import { EditItemDialog } from './Items/EditItemDialog'
import { ItemCard } from './Items/ItemCard'
import { QuickAddItemDialog } from './Items/QuickAddItemDialog'

const InventoryGrid = memo(
	({
		items,
		icon: Icon,
		title,
		isSearching = false,
		tagColors,
		onEdit,
		onRemove,
		onUpdateQuantity,
		onUpdatePercentage,
	}: {
		items: Item[]
		icon: React.ForwardRefExoticComponent<
			Omit<LucideProps, 'ref'> & React.RefAttributes<SVGSVGElement>
		>
		title: string
		isSearching?: boolean
		tagColors?: Record<string, string>
		onEdit: (item: Item) => void
		onRemove: (id: string, name: string) => void
		onUpdateQuantity: (id: string, quantity: number) => void
		onUpdatePercentage: (id: string, percentage: number) => void
	}) => (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div className="flex items-center space-x-2">
					<Icon className="h-6 w-6 text-green-600" />
					<h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-50">
						{title}
					</h2>
					<Badge
						variant="secondary"
						className="bg-zinc-100 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-300 border-none"
					>
						{items.length}
					</Badge>
				</div>
			</div>
			{items.length === 0 && !isSearching ? (
				<div className="bg-zinc-50 dark:bg-zinc-800/50 border border-dashed border-zinc-200 dark:border-zinc-700 rounded-2xl py-12 flex flex-col items-center justify-center text-zinc-400 dark:text-zinc-500">
					<Icon className="h-8 w-8 mb-2 opacity-50" />
					<p>No items in {title.toLowerCase()}</p>
				</div>
			) : (
				<div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
					<AnimatePresence>
						{items.map((item) => (
							<ItemCard
								key={item.id}
								item={item}
								onEdit={onEdit}
								onRemove={onRemove}
								onUpdateQuantity={onUpdateQuantity}
								onUpdatePercentage={onUpdatePercentage}
								tagColors={tagColors}
							/>
						))}
					</AnimatePresence>
				</div>
			)}
		</div>
	),
)

export default function Inventory() {
	const { user } = useAuth()
	const [items, setItems] = useState<Item[]>([])
	const [loading, setLoading] = useState(true)
	const [searchTerm, setSearchTerm] = useState('')
	const [activeTags, setActiveTags] = useState<string[]>([])
	const [tagColors, setTagColors] = useState<Record<string, string>>({})
	const [isAddDialogOpen, setIsAddDialogOpen] = useState(false)
	const [isQuickAddDialogOpen, setIsQuickAddDialogOpen] = useState(false)
	const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
	const [editingItem, setEditingItem] = useState<Item | null>(null)
	const [pendingImageFile, setPendingImageFile] = useState<File | null>(null)
	const [pendingImagePreview, setPendingImagePreview] = useState<string | null>(
		null,
	)
	const fetchItems = useCallback(async () => {
		try {
			setLoading(true)
			const [itemsResult, colors] = await Promise.all([
				supabase
					.from('items')
					.select('*')
					.order('expiry_date', { ascending: true, nullsFirst: false }),
				fetchTagColors(user?.id ?? ''),
			])
			if (itemsResult.error) throw itemsResult.error
			setItems(itemsResult.data || [])
			setTagColors(colors)
		} catch (error: any) {
			toast.error(`Failed to load inventory: ${error.message}`)
		} finally {
			setLoading(false)
		}
	}, [user])

	useEffect(() => {
		if (user) {
			fetchItems()
		}
	}, [user, fetchItems])

	const removeItem = useCallback(
		async (id: string, name: string) => {
			try {
				const { error } = await supabase.from('items').delete().match({ id })
				if (error) throw error
				toast.success(`${name} removed`)
				fetchItems()
			} catch (error: any) {
				toast.error(`Failed to remove item: ${error.message}`)
			}
		},
		[fetchItems],
	)

	const editItem = async () => {
		if (!editingItem) return
		const {
			id,
			name,
			category,
			quantity,
			unit,
			expiry_date,
			tags,
			tracking_type,
			percentage_remaining,
		} = editingItem
		try {
			let image_url = editingItem.image_url ?? null
			if (pendingImageFile) {
				const fileExt = pendingImageFile.name.split('.').pop()
				const filePath = `${user?.id}/${id}.${fileExt}`
				console.log('Uploading image to path:', filePath)
				console.log('Image extension: ', fileExt)
				const { error: uploadError } = await supabase.storage
					.from('images')
					.upload(filePath, pendingImageFile, { upsert: true })
				if (uploadError) console.warn('Image upload error:', uploadError)
				if (uploadError) throw uploadError
				const {
					data: { publicUrl },
				} = supabase.storage.from('images').getPublicUrl(filePath)
				image_url = publicUrl
			}
			console.log('image_url: ', image_url)
			const { error } = await (supabase as any)
				.from('items')
				.update({
					name,
					category,
					quantity,
					unit,
					expiry_date: expiry_date || null,
					image_url,
					tags: tags ?? [],
					tracking_type,
					percentage_remaining:
						tracking_type === 'percentage' ? percentage_remaining : null,
				})
				.match({ id })
			if (error) throw error
			toast.success(`${name} updated!`)
			if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview)
			setPendingImageFile(null)
			setPendingImagePreview(null)
			setIsEditDialogOpen(false)
			setEditingItem(null)
			fetchItems()
		} catch (error: any) {
			toast.error(`Failed to update item: ${error.message}`)
		}
	}

	const handleTagColorChange = useCallback(
		async (tag: string, color: string | null) => {
			setTagColors((prev) => {
				const next = { ...prev }
				if (color === null) delete next[tag]
				else next[tag] = color
				return next
			})
			await setTagColor(user?.id || '', tag, color)
		},
		[user],
	)

	const openEditDialog = useCallback((item: Item) => {
		setEditingItem({ ...item })
		setPendingImageFile(null)
		setPendingImagePreview(null)
		setIsEditDialogOpen(true)
	}, [])

	const updateQuantity = useCallback(
		async (id: string, newQuantity: number) => {
			if (newQuantity < 0) return

			let previousQuantity: number | undefined
			setItems((prev) => {
				previousQuantity = prev.find((i) => i.id === id)?.quantity
				return prev.map((i) =>
					i.id === id ? { ...i, quantity: newQuantity } : i,
				)
			})

			try {
				const { error } = await (supabase as any)
					.from('items')
					.update({ quantity: newQuantity })
					.match({ id })

				if (error) throw error
			} catch (error: any) {
				if (previousQuantity !== undefined) {
					setItems((prev) =>
						prev.map((i) =>
							i.id === id ? { ...i, quantity: previousQuantity as number } : i,
						),
					)
				}
				toast.error(`Failed to update quantity: ${error.message}`)
			}
		},
		[],
	)

	const updatePercentage = useCallback(
		async (id: string, newPercentage: number) => {
			let previousPercentage: number | null | undefined
			setItems((prev) => {
				previousPercentage = prev.find((i) => i.id === id)?.percentage_remaining
				return prev.map((i) =>
					i.id === id ? { ...i, percentage_remaining: newPercentage } : i,
				)
			})

			try {
				const { error } = await (supabase as any)
					.from('items')
					.update({ percentage_remaining: newPercentage })
					.match({ id })

				if (error) throw error
			} catch (error: any) {
				if (previousPercentage !== undefined) {
					setItems((prev) =>
						prev.map((i) =>
							i.id === id
								? { ...i, percentage_remaining: previousPercentage ?? null }
								: i,
						),
					)
				}
				toast.error(`Failed to update percentage: ${error.message}`)
			}
		},
		[],
	)

	const filteredItems = items.filter((item) =>
		item.name.toLowerCase().includes(searchTerm.toLowerCase()),
	)

	const allTags = [...new Set(items.flatMap((item) => item.tags ?? []))].sort()

	const tagFilteredItems =
		activeTags.length === 0
			? filteredItems
			: filteredItems.filter((item) =>
					activeTags.some((tag) => (item.tags ?? []).includes(tag)),
				)

	const fridgeItems = tagFilteredItems.filter(
		(item) => item.category === 'fridge',
	)
	const pantryItems = tagFilteredItems.filter(
		(item) => item.category === 'pantry',
	)
	const freezerItems = tagFilteredItems.filter(
		(item) => item.category === 'freezer',
	)

	const EmptyState = () => (
		<div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
			<div className="bg-zinc-100 dark:bg-zinc-800 p-6 rounded-full">
				<ShoppingBasket className="h-12 w-12 text-zinc-400" />
			</div>
			<div className="space-y-2">
				<h3 className="text-xl font-semibold text-zinc-900 dark:text-zinc-50">
					Your inventory is empty
				</h3>
				<p className="text-zinc-500 dark:text-zinc-400 max-w-xs mx-auto">
					Start by adding items you have in your fridge, pantry, or freezer.
				</p>
			</div>
			<Button
				onClick={() => setIsAddDialogOpen(true)}
				className="bg-green-600 hover:bg-green-700 hover:cursor-pointer"
			>
				<Plus className="h-4 w-4 mr-2" /> Add Your First Item
			</Button>
		</div>
	)

	return (
		<div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 space-y-8">
			<header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
				<div className="flex flex-wrap items-center gap-3">
					<div className="relative grow w-full md:grow-0">
						<Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400" />
						<Input
							placeholder="Search items..."
							className="pl-9 w-full md:w-64 bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 rounded-xl focus-visible:ring-green-600"
							value={searchTerm}
							onChange={(e) => setSearchTerm(e.target.value)}
						/>
					</div>
					<AddItemDialog
						isOpen={isAddDialogOpen}
						onOpenChange={setIsAddDialogOpen}
						userId={user?.id}
						onSuccess={fetchItems}
						userTags={allTags}
						tagColors={tagColors}
						onTagColorChange={handleTagColorChange}
					/>
					<QuickAddItemDialog
						isOpen={isQuickAddDialogOpen}
						onOpenChange={setIsQuickAddDialogOpen}
						userId={user?.id}
						onSuccess={fetchItems}
					/>
					<EditItemDialog
						isEditDialogOpen={isEditDialogOpen}
						setIsEditDialogOpen={setIsEditDialogOpen}
						editingItem={editingItem}
						setEditingItem={setEditingItem}
						pendingImagePreview={pendingImagePreview}
						setPendingImagePreview={setPendingImagePreview}
						setPendingImageFile={setPendingImageFile}
						editItem={editItem}
						userTags={allTags}
						tagColors={tagColors}
						onTagColorChange={handleTagColorChange}
					/>
				</div>
			</header>

			{loading && filteredItems.length < 1 ? (
				<div className="flex items-center justify-center py-20">
					<div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600" />
				</div>
			) : filteredItems.length === 0 && searchTerm === '' ? (
				<EmptyState />
			) : (
				<div className="space-y-4">
					{allTags.length > 0 && (
						<div className="flex flex-wrap items-center gap-2">
							<span className="text-xs font-medium text-zinc-500 dark:text-zinc-400">
								Filter by tag:
							</span>
							{allTags.map((tag) => (
								<Badge
									key={tag}
									variant={activeTags.includes(tag) ? 'default' : 'outline'}
									className={cn(
										'cursor-pointer select-none transition-opacity',
										getTagBadgeClass(tagColors[tag]) ??
											(activeTags.includes(tag)
												? ''
												: 'border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400'),
										!activeTags.includes(tag) && 'opacity-70',
									)}
									onClick={() =>
										setActiveTags((prev) =>
											prev.includes(tag)
												? prev.filter((t) => t !== tag)
												: [...prev, tag],
										)
									}
								>
									{tag}
								</Badge>
							))}
							{activeTags.length > 0 && (
								<Button
									variant="ghost"
									size="sm"
									className="h-6 px-2 text-xs text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
									onClick={() => setActiveTags([])}
								>
									Clear
								</Button>
							)}
						</div>
					)}
					<Tabs defaultValue="all" className="space-y-8 flex-col">
						<TabsList className="bg-zinc-100 dark:bg-zinc-800 p-1 rounded-2xl flex w-full md:w-fit overflow-x-auto no-scrollbar">
							<TabsTrigger
								value="all"
								className="rounded-xl px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
							>
								All Items
							</TabsTrigger>
							<TabsTrigger
								value="fridge"
								className="rounded-xl px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
							>
								Fridge
							</TabsTrigger>
							<TabsTrigger
								value="pantry"
								className="rounded-xl px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
							>
								Pantry
							</TabsTrigger>
							<TabsTrigger
								value="freezer"
								className="rounded-xl px-3 data-[state=active]:bg-white dark:data-[state=active]:bg-zinc-700 data-[state=active]:shadow-sm"
							>
								Freezer
							</TabsTrigger>
						</TabsList>

						<TabsContent value="all" className="space-y-6">
							<InventoryGrid
								isSearching={searchTerm !== ''}
								items={fridgeItems}
								icon={Refrigerator}
								title="Fridge"
								tagColors={tagColors}
								onEdit={openEditDialog}
								onRemove={removeItem}
								onUpdateQuantity={updateQuantity}
								onUpdatePercentage={updatePercentage}
							/>
							<div className="h-px bg-zinc-100 dark:bg-zinc-800" />
							<InventoryGrid
								isSearching={searchTerm !== ''}
								items={pantryItems}
								icon={Container}
								title="Pantry"
								tagColors={tagColors}
								onEdit={openEditDialog}
								onRemove={removeItem}
								onUpdateQuantity={updateQuantity}
								onUpdatePercentage={updatePercentage}
							/>
							<div className="h-px bg-zinc-100 dark:bg-zinc-800" />
							<InventoryGrid
								isSearching={searchTerm !== ''}
								items={freezerItems}
								icon={Snowflake}
								title="Freezer"
								tagColors={tagColors}
								onEdit={openEditDialog}
								onRemove={removeItem}
								onUpdateQuantity={updateQuantity}
								onUpdatePercentage={updatePercentage}
							/>
						</TabsContent>

						<TabsContent value="fridge">
							<InventoryGrid
								isSearching={searchTerm !== ''}
								items={fridgeItems}
								icon={Refrigerator}
								title="Fridge"
								tagColors={tagColors}
								onEdit={openEditDialog}
								onRemove={removeItem}
								onUpdateQuantity={updateQuantity}
								onUpdatePercentage={updatePercentage}
							/>
						</TabsContent>

						<TabsContent value="pantry">
							<InventoryGrid
								isSearching={searchTerm !== ''}
								items={pantryItems}
								icon={Container}
								title="Pantry"
								tagColors={tagColors}
								onEdit={openEditDialog}
								onRemove={removeItem}
								onUpdateQuantity={updateQuantity}
								onUpdatePercentage={updatePercentage}
							/>
						</TabsContent>

						<TabsContent value="freezer">
							<InventoryGrid
								isSearching={searchTerm !== ''}
								items={freezerItems}
								icon={Snowflake}
								title="Freezer"
								tagColors={tagColors}
								onEdit={openEditDialog}
								onRemove={removeItem}
								onUpdateQuantity={updateQuantity}
								onUpdatePercentage={updatePercentage}
							/>
						</TabsContent>
					</Tabs>
				</div>
			)}

			{filteredItems.length === 0 && searchTerm !== '' && (
				<div className="flex flex-col items-center justify-center py-20 text-center text-zinc-500">
					<AlertCircle className="h-10 w-10 mb-2 opacity-20" />
					<p>No items found matching "{searchTerm}"</p>
					<Button
						variant="link"
						onClick={() => setSearchTerm('')}
						className="text-green-600"
					>
						Clear search
					</Button>
				</div>
			)}
		</div>
	)
}
