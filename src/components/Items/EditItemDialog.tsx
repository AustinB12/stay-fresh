import { CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Camera, ImagePlus } from 'lucide-react';

export function EditItemDialog({
  isEditDialogOpen,
  setIsEditDialogOpen,
  editingItem,
  setEditingItem,
  pendingImagePreview,
  setPendingImagePreview,
  setPendingImageFile,
  editItem,
}) {
  return (
    <Dialog
      open={isEditDialogOpen}
      onOpenChange={(open) => {
        setIsEditDialogOpen(open);
        if (!open) {
          if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
          setPendingImageFile(null);
          setPendingImagePreview(null);
        }
      }}
    >
      <DialogContent className='sm:max-w-106.25'>
        <DialogHeader>
          <DialogTitle>Edit Item</DialogTitle>
          <CardDescription>Update the details for this item.</CardDescription>
        </DialogHeader>
        {editingItem && (
          <div className='grid gap-4 py-4'>
            <div className='grid gap-2'>
              <Label>Item Photo</Label>
              <div
                className='relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center cursor-pointer group'
                onClick={() =>
                  document.getElementById('edit-image-upload')?.click()
                }
              >
                {pendingImagePreview || editingItem.image_url ? (
                  <img
                    src={(pendingImagePreview || editingItem.image_url)!}
                    alt={editingItem.name}
                    className='w-full h-full object-cover'
                  />
                ) : (
                  <div className='flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500'>
                    <ImagePlus className='h-8 w-8' />
                    <span className='text-xs'>Click to add a photo</span>
                  </div>
                )}
                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center'>
                  <div className='flex flex-col items-center gap-1 text-white'>
                    <Camera className='h-6 w-6' />
                    <span className='text-xs font-medium'>Change photo</span>
                  </div>
                </div>
              </div>
              <input
                id='edit-image-upload'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    if (pendingImagePreview)
                      URL.revokeObjectURL(pendingImagePreview);
                    setPendingImageFile(file);
                    setPendingImagePreview(URL.createObjectURL(file));
                  }
                }}
              />
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-name'>Item Name</Label>
              <Input
                id='edit-name'
                placeholder='e.g. Milk, Apples, Broccoli'
                value={editingItem.name}
                onChange={(e) =>
                  setEditingItem({ ...editingItem, name: e.target.value })
                }
              />
            </div>
            <div className='grid grid-cols-2 gap-4'>
              <div className='grid gap-2'>
                <Label htmlFor='edit-category'>Location</Label>
                <Select
                  value={editingItem.category}
                  onValueChange={(val: any) =>
                    setEditingItem({ ...editingItem, category: val })
                  }
                >
                  <SelectTrigger id='edit-category'>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='fridge'>Fridge</SelectItem>
                    <SelectItem value='pantry'>Pantry</SelectItem>
                    <SelectItem value='freezer'>Freezer</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className='grid gap-2'>
                <Label htmlFor='edit-quantity'>Quantity</Label>
                <div className='flex space-x-2'>
                  <Input
                    id='edit-quantity'
                    type='number'
                    className='w-20'
                    value={editingItem.quantity}
                    onChange={(e) =>
                      setEditingItem({
                        ...editingItem,
                        quantity: Number(e.target.value),
                      })
                    }
                  />
                  <Input
                    id='edit-unit'
                    placeholder='pcs'
                    className='grow'
                    value={editingItem.unit}
                    onChange={(e) =>
                      setEditingItem({ ...editingItem, unit: e.target.value })
                    }
                  />
                </div>
              </div>
            </div>
            <div className='grid gap-2'>
              <Label htmlFor='edit-expiry'>Expiration Date (Optional)</Label>
              <Input
                id='edit-expiry'
                type='date'
                value={editingItem.expiry_date ?? ''}
                onChange={(e) =>
                  setEditingItem({
                    ...editingItem,
                    expiry_date: e.target.value,
                  })
                }
              />
            </div>
          </div>
        )}
        <DialogFooter className='md:justify-between'>
          <Button
            onClick={editItem}
            className='bg-green-600 hover:bg-green-700 hover:cursor-pointer'
          >
            Save Changes
          </Button>
          <Button
            variant='outline'
            className='hover:cursor-pointer'
            onClick={() => {
              if (pendingImagePreview) URL.revokeObjectURL(pendingImagePreview);
              setPendingImageFile(null);
              setPendingImagePreview(null);
              setIsEditDialogOpen(false);
            }}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
