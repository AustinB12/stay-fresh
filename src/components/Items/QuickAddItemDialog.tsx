import { useState, useCallback } from 'react';
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
import { Camera, ImagePlus, Plus, ScanBarcode } from 'lucide-react';
import { toast } from 'sonner';

interface QuickAddItemDialogProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  userId: string | undefined;
  onSuccess: () => void;
}

interface Inventory_Item {
  name: string;
  category: 'fridge' | 'pantry' | 'freezer';
  quantity: number;
  unit: string;
  expiry_date: string | null;
}

type Quick_Add_Templates =
  | 'Marmita'
  | 'Mini Cokes'
  | 'Honey Bunches of Oats'
  | 'Jimmy Dean Biscuits';

export function QuickAddItemDialog({
  isOpen,
  onOpenChange,
  userId,
  onSuccess,
}: QuickAddItemDialogProps) {
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [selectedTemplate, setSelectedTemplate] =
    useState<Quick_Add_Templates | null>(null);

  const resetForm = () => {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
    setSelectedTemplate(null);
  };

  const handleOpenChange = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      resetForm();
    }
  };

  const addItem = async () => {
    let newItem: Inventory_Item = {
      name: 'New Item',
      category: 'pantry',
      quantity: 1,
      unit: 'unit',
      expiry_date: null,
    };

    switch (selectedTemplate) {
      case 'Marmita':
        newItem = {
          name: 'Marmita',
          category: 'freezer',
          quantity: 1,
          unit: 'box',
          expiry_date: new Date(
            Date.now() + 21 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 3 weeks from now
        };
        break;
      case 'Mini Cokes':
        newItem = {
          name: 'Mini Cokes',
          category: 'fridge',
          quantity: 10,
          unit: 'cans',
          expiry_date: null,
        };
        break;
      case 'Honey Bunches of Oats':
        newItem = {
          name: 'Honey Bunches of Oats',
          category: 'pantry',
          quantity: 1,
          unit: 'box',
          expiry_date: new Date(
            Date.now() + 21 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 3 weeks from now
        };
        break;
      case 'Jimmy Dean Biscuits':
        newItem = {
          name: 'Jimmy Dean Biscuits',
          category: 'freezer',
          quantity: 1,
          unit: '',
          expiry_date: new Date(
            Date.now() + 28 * 24 * 60 * 60 * 1000,
          ).toISOString(), // 4 weeks from now
        };
        break;
    }

    try {
      // If we have a URL preview (from barcode scan) but no file, include it in the insert
      const insertData: Record<string, any> = { ...newItem, user_id: userId };
      if (!imageFile && imagePreview && imagePreview.startsWith('http')) {
        insertData.image_url = imagePreview;
      }

      const { data: inserted, error } = await (supabase as any)
        .from('items')
        .insert([insertData])
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
            <Plus className='h-4 w-4 mr-2' /> Quick Add
          </Button>
        }
      />
      <DialogContent className='sm:max-w-lg'>
        <DialogHeader>
          <DialogTitle>Quick Add New Item</DialogTitle>
          <CardDescription>
            {selectedTemplate
              ? `Adding ${selectedTemplate}`
              : 'Choose a template to add'}
          </CardDescription>
        </DialogHeader>
        <div className='grid gap-4 py-4 grid-cols-2'>
          <Button
            onClick={() => setSelectedTemplate('Marmita')}
            size='lg'
            className='hover:cursor-pointer'
            variant={selectedTemplate === 'Marmita' ? 'default' : 'outline'}
          >
            Marmita
          </Button>
          <Button
            onClick={() => setSelectedTemplate('Mini Cokes')}
            size='lg'
            className='hover:cursor-pointer'
            variant={selectedTemplate === 'Mini Cokes' ? 'default' : 'outline'}
          >
            Mini Cokes
          </Button>
          <Button
            onClick={() => setSelectedTemplate('Honey Bunches of Oats')}
            size='lg'
            className='hover:cursor-pointer'
            variant={
              selectedTemplate === 'Honey Bunches of Oats'
                ? 'default'
                : 'outline'
            }
          >
            Honey Bunches of Oats
          </Button>
          <Button
            onClick={() => setSelectedTemplate('Jimmy Dean Biscuits')}
            size='lg'
            className='hover:cursor-pointer'
            variant={
              selectedTemplate === 'Jimmy Dean Biscuits' ? 'default' : 'outline'
            }
          >
            Jimmy Dean Biscuits
          </Button>
        </div>
        <DialogFooter className='md:justify-between'>
          <Button
            onClick={addItem}
            className='bg-green-600 hover:bg-green-700 hover:cursor-pointer'
          >
            Add
          </Button>
          <Button
            className='hover:cursor-pointer'
            variant={'outline'}
            onClick={() => handleOpenChange(false)}
          >
            Cancel
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
