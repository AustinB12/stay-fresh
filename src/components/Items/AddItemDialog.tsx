import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { CardDescription } from '@/components/ui/card';
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
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Camera, ImagePlus, Plus } from 'lucide-react';
import { toast } from 'sonner';

interface AddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onSuccess: () => void;
}

export function AddItemDialog({
  isOpen,
  onOpenChange,
  userId,
  onSuccess,
}: AddItemDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [newItem, setNewItem] = useState({
    name: '',
    category: 'fridge' as 'fridge' | 'pantry' | 'freezer',
    quantity: 1,
    unit: 'pcs',
    expiry_date: null as string | null,
  });

  const resetForm = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setNewItem({
      name: '',
      category: 'fridge',
      quantity: 1,
      unit: 'pcs',
      expiry_date: null,
    });
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) resetForm();
  };

  const addItem = async () => {
    if (!newItem.name) return;

    try {
      const { data: inserted, error } = await (supabase as any)
        .from('items')
        .insert([{ ...newItem, user_id: userId }])
        .select('id')
        .single();
      if (error) throw error;

      if (imageFile && inserted?.id) {
        const fileExt = imageFile.name.split('.').pop();
        const filePath = `${userId}/${inserted.id}.${fileExt}`;
        const { error: uploadError } = await supabase.storage
          .from('images')
          .upload(filePath, imageFile, { upsert: true });
        if (!uploadError) {
          const {
            data: { publicUrl },
          } = supabase.storage.from('images').getPublicUrl(filePath);
          await (supabase as any)
            .from('items')
            .update({ image_url: publicUrl })
            .match({ id: inserted.id });
        }
      }

      toast.success(`${newItem.name} added to ${newItem.category}!`);
      resetForm();
      onOpenChange(false);
      onSuccess();
    } catch (error: any) {
      toast.error('Failed to add item: ' + error.message);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger
        render={
          <Button className='hover:cursor-pointer bg-green-600 hover:bg-green-700 rounded-xl px-6 h-10 shadow-lg shadow-green-600/20 active:scale-95 transition-all'>
            <Plus className='h-4 w-4 mr-2' /> Add Item
          </Button>
        }
      />
      <DialogContent className='sm:max-w-106.25'>
        <DialogHeader>
          <DialogTitle>Add New Item</DialogTitle>
          <CardDescription>Keep your inventory up to date.</CardDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4'>
          <div className='grid gap-2'>
            <Label>Item Photo</Label>
            <div className='relative w-full h-36 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center group'>
              {imagePreview ? (
                <img
                  src={imagePreview}
                  alt='Item preview'
                  className='w-full h-full object-cover'
                />
              ) : (
                <div className='flex gap-8 items-center justify-center'>
                  <button
                    type='button'
                    className='flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer'
                    onClick={() =>
                      document.getElementById('add-image-upload')?.click()
                    }
                  >
                    <ImagePlus className='h-8 w-8' />
                    <span className='text-xs'>Upload photo</span>
                  </button>
                  <button
                    type='button'
                    className='flex flex-col items-center gap-2 text-zinc-400 dark:text-zinc-500 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors cursor-pointer'
                    onClick={() =>
                      document.getElementById('add-camera-capture')?.click()
                    }
                  >
                    <Camera className='h-8 w-8' />
                    <span className='text-xs'>Take photo</span>
                  </button>
                </div>
              )}
              {imagePreview && (
                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-6'>
                  <button
                    type='button'
                    className='flex flex-col items-center gap-1 text-white hover:text-zinc-200 transition-colors cursor-pointer'
                    onClick={() =>
                      document.getElementById('add-image-upload')?.click()
                    }
                  >
                    <ImagePlus className='h-6 w-6' />
                    <span className='text-xs font-medium'>Upload</span>
                  </button>
                  <button
                    type='button'
                    className='flex flex-col items-center gap-1 text-white hover:text-zinc-200 transition-colors cursor-pointer'
                    onClick={() =>
                      document.getElementById('add-camera-capture')?.click()
                    }
                  >
                    <Camera className='h-6 w-6' />
                    <span className='text-xs font-medium'>Camera</span>
                  </button>
                </div>
              )}
            </div>
            <input
              id='add-image-upload'
              type='file'
              accept='image/*'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
            <input
              id='add-camera-capture'
              type='file'
              accept='image/*'
              capture='environment'
              className='hidden'
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) {
                  if (imagePreview) URL.revokeObjectURL(imagePreview);
                  setImageFile(file);
                  setImagePreview(URL.createObjectURL(file));
                }
              }}
            />
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='name'>Item Name</Label>
            <Input
              id='name'
              placeholder='e.g. Milk, Apples, Broccoli'
              value={newItem.name}
              onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
            />
          </div>
          <div className='grid grid-cols-2 gap-4'>
            <div className='grid gap-2'>
              <Label htmlFor='category'>Location</Label>
              <Select
                value={newItem.category}
                onValueChange={(val: any) =>
                  setNewItem({ ...newItem, category: val })
                }
              >
                <SelectTrigger id='category'>
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
              <Label htmlFor='quantity'>Quantity</Label>
              <div className='flex space-x-2'>
                <Input
                  id='quantity'
                  type='number'
                  className='w-20'
                  value={newItem.quantity}
                  onChange={(e) =>
                    setNewItem({
                      ...newItem,
                      quantity: Number(e.target.value),
                    })
                  }
                />
                <Input
                  id='unit'
                  placeholder='pcs'
                  className='grow'
                  value={newItem.unit}
                  onChange={(e) =>
                    setNewItem({ ...newItem, unit: e.target.value })
                  }
                />
              </div>
            </div>
          </div>
          <div className='grid gap-2'>
            <Label htmlFor='expiry'>Expiry Date (Optional)</Label>
            <Input
              id='expiry'
              type='date'
              value={newItem.expiry_date || ''}
              onChange={(e) =>
                setNewItem({ ...newItem, expiry_date: e.target.value || null })
              }
            />
          </div>
        </div>
        <DialogFooter className='md:justify-between'>
          <Button onClick={addItem} className='bg-green-600 hover:bg-green-700'>
            Add
          </Button>
          <Button variant='outline' onClick={() => handleOpenChange(false)}>
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
