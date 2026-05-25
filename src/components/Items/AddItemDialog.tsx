import { Camera, ImagePlus, Plus, ScanBarcode } from 'lucide-react'
import { useCallback, useState } from 'react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { CardDescription } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
	DialogTrigger,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from '@/components/ui/select'
import { lookupBarcode } from '@/lib/openFoodFacts'
import { supabase } from '@/lib/supabase'
import { BarcodeScanner } from './BarcodeScanner'
import { TagInput } from './TagInput'

interface AddItemDialogProps {
	isOpen: boolean
	onOpenChange: (open: boolean) => void
	userId: string | undefined
	onSuccess: () => void
	userTags?: string[]
	tagColors?: Record<string, string>
	onTagColorChange?: (tag: string, color: string | null) => void
}

export function AddItemDialog({
	isOpen,
	onOpenChange,
	userId,
	onSuccess,
	userTags = [],
	tagColors = {},
	onTagColorChange,
}: AddItemDialogProps) {
	const [imageFile, setImageFile] = useState<File | null>(null)
	const [imagePreview, setImagePreview] = useState<string | null>(null)
	const [isScannerOpen, setIsScannerOpen] = useState(false)
	const [newItem, setNewItem] = useState({
		name: '',
		category: 'fridge' as 'fridge' | 'pantry' | 'freezer',
		quantity: 1,
		unit: 'pcs',
		expiry_date: null as string | null,
		tags: [] as string[],
		tracking_type: 'quantity' as 'quantity' | 'percentage',
		percentage_remaining: 100,
	})

	const resetForm = () => {
		if (imagePreview) URL.revokeObjectURL(imagePreview)
		setImageFile(null)
		setImagePreview(null)
		setNewItem({
			name: '',
			category: 'fridge',
			quantity: 1,
			unit: 'pcs',
			expiry_date: null,
			tags: [],
			tracking_type: 'quantity',
			percentage_remaining: 100,
		})
	}

	const handleOpenChange = (open: boolean) => {
		onOpenChange(open)
		if (!open) {
			setIsScannerOpen(false)
			resetForm()
		}
	}

	const handleBarcodeDetected = useCallback(async (barcode: string) => {
		setIsScannerOpen(false)
		const product = await lookupBarcode(barcode)
		if (product) {
			setNewItem((prev) => ({
				...prev,
				name: product.name,
				category: product.category,
			}))
			if (product.imageUrl) {
				setImageFile(null)
				setImagePreview(product.imageUrl)
			}
			toast.success(`Product found: ${product.name}`)
		} else {
			toast.error('Product not found — try entering details manually.')
		}
	}, [])

	const addItem = async () => {
		if (!newItem.name) return

		try {
			// If we have a URL preview (from barcode scan) but no file, include it in the insert
			const insertData: Record<string, any> = { ...newItem, user_id: userId }
			if (!imageFile && imagePreview && imagePreview.startsWith('http')) {
				insertData.image_url = imagePreview
			}

			const { data: inserted, error } = await (supabase as any)
				.from('items')
				.insert([insertData])
				.select('id')
				.single()
			if (error) throw error

			if (imageFile && inserted?.id) {
				const fileExt = imageFile.name.split('.').pop()
				const filePath = `${userId}/${inserted.id}.${fileExt}`
				const { error: uploadError } = await supabase.storage
					.from('images')
					.upload(filePath, imageFile, { upsert: true })
				if (!uploadError) {
					const {
						data: { publicUrl },
					} = supabase.storage.from('images').getPublicUrl(filePath)
					await (supabase as any)
						.from('items')
						.update({ image_url: publicUrl })
						.match({ id: inserted.id })
				}
			}

			toast.success(`${newItem.name} added to ${newItem.category}!`)
			resetForm()
			onOpenChange(false)
			onSuccess()
		} catch (error: any) {
			toast.error('Failed to add item: ' + error.message)
		}
	}

	return (
		<Dialog open={isOpen} onOpenChange={handleOpenChange}>
			<DialogTrigger
				render={
					<Button className="hover:cursor-pointer bg-green-600 hover:bg-green-700 rounded-xl px-6 h-10 shadow-lg shadow-green-600/20 active:scale-95 transition-all">
						<Plus className="h-4 w-4 mr-2" /> Add Item
					</Button>
				}
			/>
			<DialogContent className="sm:max-w-106.25">
				<DialogHeader>
					<DialogTitle>Add New Item</DialogTitle>
					<CardDescription>Keep your inventory up to date.</CardDescription>
				</DialogHeader>
				<div className="grid gap-4 py-4">
					<div className="grid gap-2">
						<Label>Item Photo</Label>
						<div className="relative w-full h-72 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group">
							{imagePreview ? (
								<img
									src={imagePreview}
									alt="Item preview"
									className="w-full h-full object-cover"
								/>
							) : (
								<div className="flex gap-8 items-center justify-center">
									<button
										type="button"
										className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
										onClick={() =>
											document.getElementById('add-image-upload')?.click()
										}
									>
										<ImagePlus className="h-8 w-8" />
										<span className="text-xs">Upload photo</span>
									</button>
									<button
										type="button"
										className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
										onClick={() =>
											document.getElementById('add-camera-capture')?.click()
										}
									>
										<Camera className="h-8 w-8" />
										<span className="text-xs">Take photo</span>
									</button>
									<button
										type="button"
										className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
										onClick={() => setIsScannerOpen(true)}
									>
										<ScanBarcode className="h-8 w-8" />
										<span className="text-xs">Scan barcode</span>
									</button>
								</div>
							)}
							{imagePreview && (
								<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
									<button
										type="button"
										className="flex flex-col items-center gap-1 text-white hover:text-zinc-200 transition-colors cursor-pointer"
										onClick={() =>
											document.getElementById('add-image-upload')?.click()
										}
									>
										<ImagePlus className="h-6 w-6" />
										<span className="text-xs font-medium">Upload</span>
									</button>
									<button
										type="button"
										className="flex flex-col items-center gap-1 text-white hover:text-zinc-200 transition-colors cursor-pointer"
										onClick={() =>
											document.getElementById('add-camera-capture')?.click()
										}
									>
										<Camera className="h-6 w-6" />
										<span className="text-xs font-medium">Camera</span>
									</button>
								</div>
							)}
						</div>
						<input
							id="add-image-upload"
							type="file"
							accept="image/*"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) {
									if (imagePreview) URL.revokeObjectURL(imagePreview)
									setImageFile(file)
									setImagePreview(URL.createObjectURL(file))
								}
							}}
						/>
						<input
							id="add-camera-capture"
							type="file"
							accept="image/*"
							capture="environment"
							className="hidden"
							onChange={(e) => {
								const file = e.target.files?.[0]
								if (file) {
									if (imagePreview) URL.revokeObjectURL(imagePreview)
									setImageFile(file)
									setImagePreview(URL.createObjectURL(file))
								}
							}}
						/>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="name">Item Name</Label>
						<Input
							id="name"
							placeholder="e.g. Milk, Apples, Broccoli"
							value={newItem.name}
							onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
						/>
					</div>
					<div className="grid grid-cols-2 gap-4">
						<div className="grid gap-2">
							<Label htmlFor="category">Location</Label>
							<Select
								value={newItem.category}
								onValueChange={(val: any) =>
									setNewItem({ ...newItem, category: val })
								}
							>
								<SelectTrigger id="category">
									<SelectValue />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="fridge">Fridge</SelectItem>
									<SelectItem value="pantry">Pantry</SelectItem>
									<SelectItem value="freezer">Freezer</SelectItem>
								</SelectContent>
							</Select>
						</div>
						<div className="grid gap-2">
							<div className="flex items-center justify-between gap-1">
								<Label>Tracking</Label>
								<div className="flex rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs">
									<button
										type="button"
										className={`px-3 py-1 font-medium transition-colors ${
											newItem.tracking_type === 'quantity'
												? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
												: 'bg-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
										}`}
										onClick={() =>
											setNewItem({ ...newItem, tracking_type: 'quantity' })
										}
									>
										Quantity
									</button>
									<button
										type="button"
										className={`px-3 py-1 font-medium transition-colors ${
											newItem.tracking_type === 'percentage'
												? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
												: 'bg-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
										}`}
										onClick={() =>
											setNewItem({ ...newItem, tracking_type: 'percentage' })
										}
									>
										% Remaining
									</button>
								</div>
							</div>
							{newItem.tracking_type === 'quantity' ? (
								<div className="flex space-x-2">
									<Input
										id="quantity"
										type="number"
										className="w-20"
										value={newItem.quantity}
										onChange={(e) =>
											setNewItem({
												...newItem,
												quantity: Number(e.target.value),
											})
										}
									/>
									<Input
										id="unit"
										placeholder="pcs"
										className="grow"
										value={newItem.unit}
										onChange={(e) =>
											setNewItem({ ...newItem, unit: e.target.value })
										}
									/>
								</div>
							) : (
								<div className="space-y-2">
									<input
										type="range"
										min={0}
										max={100}
										step={5}
										value={newItem.percentage_remaining}
										onChange={(e) =>
											setNewItem({
												...newItem,
												percentage_remaining: Number(e.target.value),
											})
										}
										className="w-full accent-green-600"
									/>
									<p className="text-sm text-center font-medium text-zinc-700 dark:text-zinc-300">
										{newItem.percentage_remaining}% remaining
									</p>
								</div>
							)}
						</div>
					</div>
					<div className="grid gap-2">
						<Label htmlFor="expiry">Expiry Date (Optional)</Label>
						<Input
							id="expiry"
							type="date"
							value={newItem.expiry_date || ''}
							onChange={(e) =>
								setNewItem({ ...newItem, expiry_date: e.target.value || null })
							}
						/>
					</div>
					<div className="grid gap-2">
						<Label>Tags (Optional)</Label>
						<TagInput
							tags={newItem.tags}
							onChange={(tags) => setNewItem({ ...newItem, tags })}
							suggestions={userTags}
							tagColors={tagColors}
							onColorChange={onTagColorChange}
						/>
					</div>
				</div>
				<DialogFooter className="md:justify-between">
					<Button onClick={addItem} className="bg-green-600 hover:bg-green-700">
						Add
					</Button>
					<Button variant="outline" onClick={() => handleOpenChange(false)}>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
			<BarcodeScanner
				isOpen={isScannerOpen}
				onClose={() => setIsScannerOpen(false)}
				onDetected={handleBarcodeDetected}
			/>
		</Dialog>
	)
}
