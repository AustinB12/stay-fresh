import { Camera, ImagePlus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { CardDescription } from '@/components/ui/card'
import {
	Dialog,
	DialogContent,
	DialogFooter,
	DialogHeader,
	DialogTitle,
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
import { TagInput } from './TagInput'

export function EditItemDialog({
	isEditDialogOpen,
	setIsEditDialogOpen,
	editingItem,
	setEditingItem,
	pendingImagePreview,
	setPendingImagePreview,
	setPendingImageFile,
	editItem,
	userTags = [] as string[],
	tagColors = {} as Record<string, string>,
	onTagColorChange,
}) {
	return (
		<Dialog
			open={isEditDialogOpen}
			onOpenChange={(open) => {
				setIsEditDialogOpen(open)
				if (!open) {
					if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview)
					setPendingImageFile(null)
					setPendingImagePreview(null)
				}
			}}
		>
			<DialogContent className="sm:max-w-106.25 md:max-w-3xl">
				<DialogHeader>
					<DialogTitle>Edit Item</DialogTitle>
					<CardDescription>Update the details for this item.</CardDescription>
				</DialogHeader>
				{editingItem && (
					<div className="grid gap-4 py-4">
						<div className="grid gap-2">
							<Label>Item Photo</Label>
							<div className="relative w-full h-72 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group">
								{pendingImagePreview || editingItem.image_url ? (
									<img
										src={
											(pendingImagePreview || editingItem.image_url) as string
										}
										alt={editingItem.name}
										className="w-full h-full object-cover"
									/>
								) : (
									<div className="flex gap-8 items-center justify-center">
										<button
											type="button"
											className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
											onClick={() =>
												document.getElementById('edit-image-upload')?.click()
											}
										>
											<ImagePlus className="h-8 w-8" />
											<span className="text-xs">Upload photo</span>
										</button>
										<button
											type="button"
											className="flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer"
											onClick={() =>
												document.getElementById('edit-camera-capture')?.click()
											}
										>
											<Camera className="h-8 w-8" />
											<span className="text-xs">Take photo</span>
										</button>
									</div>
								)}
								{(pendingImagePreview || editingItem.image_url) && (
									<div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6">
										<button
											type="button"
											className="flex flex-col items-center gap-1 text-white hover:text-zinc-200 transition-colors cursor-pointer"
											onClick={() =>
												document.getElementById('edit-image-upload')?.click()
											}
										>
											<ImagePlus className="h-6 w-6" />
											<span className="text-xs font-medium">Upload</span>
										</button>
										<button
											type="button"
											className="flex flex-col items-center gap-1 text-white hover:text-zinc-200 transition-colors cursor-pointer"
											onClick={() =>
												document.getElementById('edit-camera-capture')?.click()
											}
										>
											<Camera className="h-6 w-6" />
											<span className="text-xs font-medium">Camera</span>
										</button>
									</div>
								)}
							</div>
							<input
								id="edit-image-upload"
								type="file"
								accept="image/*"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0]
									if (file) {
										if (pendingImagePreview)
											URL.revokeObjectURL(pendingImagePreview)
										setPendingImageFile(file)
										setPendingImagePreview(URL.createObjectURL(file))
									}
								}}
							/>
							<input
								id="edit-camera-capture"
								type="file"
								accept="image/*"
								capture="environment"
								className="hidden"
								onChange={(e) => {
									const file = e.target.files?.[0]
									if (file) {
										if (pendingImagePreview)
											URL.revokeObjectURL(pendingImagePreview)
										setPendingImageFile(file)
										setPendingImagePreview(URL.createObjectURL(file))
									}
								}}
							/>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-name">Item Name</Label>
							<Input
								id="edit-name"
								placeholder="e.g. Milk, Apples, Broccoli"
								value={editingItem.name}
								onChange={(e) =>
									setEditingItem({ ...editingItem, name: e.target.value })
								}
							/>
						</div>
						<div className="grid grid-cols-5 gap-4">
							<div className="grid gap-2 col-span-2">
								<Label htmlFor="edit-category">Location</Label>
								<Select
									value={editingItem.category}
									onValueChange={(val: any) =>
										setEditingItem({ ...editingItem, category: val })
									}
								>
									<SelectTrigger id="edit-category">
										<SelectValue />
									</SelectTrigger>
									<SelectContent>
										<SelectItem value="fridge">Fridge</SelectItem>
										<SelectItem value="pantry">Pantry</SelectItem>
										<SelectItem value="freezer">Freezer</SelectItem>
									</SelectContent>
								</Select>
							</div>
							<div className="grid gap-2 col-span-3">
								<div className="flex items-center justify-between gap-1">
									<Label>Tracking</Label>
									<div className="flex rounded-md border border-zinc-200 dark:border-zinc-700 overflow-hidden text-xs">
										<button
											type="button"
											className={`px-3 py-1 font-medium transition-colors ${
												editingItem.tracking_type === 'percentage'
													? 'bg-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
													: 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
											}`}
											onClick={() =>
												setEditingItem({
													...editingItem,
													tracking_type: 'quantity',
												})
											}
										>
											Quantity
										</button>
										<button
											type="button"
											className={`px-3 py-1 font-medium transition-colors ${
												editingItem.tracking_type === 'percentage'
													? 'bg-zinc-900 dark:bg-zinc-50 text-white dark:text-zinc-900'
													: 'bg-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
											}`}
											onClick={() =>
												setEditingItem({
													...editingItem,
													tracking_type: 'percentage',
												})
											}
										>
											% Left
										</button>
									</div>
								</div>
								{editingItem.tracking_type === 'percentage' ? (
									<div className="space-y-2">
										<input
											type="range"
											min={0}
											max={100}
											step={5}
											value={editingItem.percentage_remaining ?? 100}
											onChange={(e) =>
												setEditingItem({
													...editingItem,
													percentage_remaining: Number(e.target.value),
												})
											}
											className="w-full accent-green-600"
										/>
										<p className="text-sm text-center font-medium text-zinc-700 dark:text-zinc-300">
											{editingItem.percentage_remaining ?? 100}% remaining
										</p>
									</div>
								) : (
									<div className="flex space-x-2">
										<Input
											id="edit-quantity"
											type="number"
											className="w-20"
											value={editingItem.quantity}
											onChange={(e) =>
												setEditingItem({
													...editingItem,
													quantity: Number(e.target.value),
												})
											}
										/>
										<Input
											id="edit-unit"
											placeholder="pcs"
											className="grow"
											value={editingItem.unit}
											onChange={(e) =>
												setEditingItem({ ...editingItem, unit: e.target.value })
											}
										/>
									</div>
								)}
							</div>
						</div>
						<div className="grid gap-2">
							<Label htmlFor="edit-expiry">Expiration Date (Optional)</Label>
							<Input
								id="edit-expiry"
								type="date"
								className="dark:scheme-dark"
								value={editingItem.expiry_date ?? ''}
								onChange={(e) =>
									setEditingItem({
										...editingItem,
										expiry_date: e.target.value,
									})
								}
							/>
						</div>
						<div className="grid gap-2">
							<Label>Tags (Optional)</Label>
							<TagInput
								tags={editingItem.tags ?? []}
								onChange={(tags) => setEditingItem({ ...editingItem, tags })}
								suggestions={userTags}
								tagColors={tagColors}
								onColorChange={onTagColorChange}
							/>
						</div>
					</div>
				)}
				<DialogFooter className="md:justify-between">
					<Button
						onClick={editItem}
						className="bg-green-600 hover:bg-green-700 hover:cursor-pointer"
					>
						Save Changes
					</Button>
					<Button
						variant="outline"
						className="hover:cursor-pointer"
						onClick={() => {
							if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview)
							setPendingImageFile(null)
							setPendingImagePreview(null)
							setIsEditDialogOpen(false)
						}}
					>
						Cancel
					</Button>
				</DialogFooter>
			</DialogContent>
		</Dialog>
	)
}
