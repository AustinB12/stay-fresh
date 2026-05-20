import { useState, memo, JSX } from 'react';
import { Item } from '@/types/database';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Plus,
  Minus,
  SquarePen,
  Trash2,
  Calendar,
  ShoppingBasket,
  CupSoda,
  Beef,
  Apple,
} from 'lucide-react';
import { format } from 'date-fns';
import { motion } from 'motion/react';
import { getExpiryStatus } from '@/lib/utils';

const iconClass = 'h-10 w-10 text-zinc-300 dark:text-zinc-600';

const get_default_image = (name: string): JSX.Element => {
  const lowerName = name.toLowerCase();
  if (['coke', 'pepsi', 'sprite', 'soda'].includes(lowerName))
    return <CupSoda className={iconClass} />;
  if (['beef', 'steak', 'ground beef'].includes(lowerName))
    return <Beef className={iconClass} />;
  if (['apple', 'green apple', 'red apple', 'yellow apple'].includes(lowerName))
    return <Apple className={iconClass} />;
  return <ShoppingBasket className={iconClass} />;
};

export const ItemCard = memo(
  ({
    item,
    onEdit,
    onRemove,
    onUpdateQuantity,
  }: {
    item: Item;
    onEdit: (item: Item) => void;
    onRemove: (id: string, name: string) => void;
    onUpdateQuantity: (id: string, quantity: number) => void;
  }) => {
    const status = getExpiryStatus(item.expiry_date);
    const [imgError, setImgError] = useState(false);
    return (
      <motion.div
        layout
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className='group'
      >
        <Card
          onDoubleClick={() => onEdit(item)}
          className='hover:cursor-pointer overflow-hidden border-zinc-200 dark:border-zinc-700 transition-all hover:shadow-md h-full flex flex-col gap-0 py-4 px-4'
        >
          <CardHeader className='pb-2 space-y-1 relative'>
            <div className='flex justify-between items-center'>
              <CardTitle className='text-lg font-semibold text-zinc-900 dark:text-zinc-50 group-hover:text-green-600 transition-colors truncate'>
                {item.name}
              </CardTitle>

              <span>
                <Button
                  aria-label='Edit Button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer'
                  onClick={() => onEdit(item)}
                >
                  <SquarePen className='h-4 w-4' />
                </Button>
                <Button
                  aria-label='Delete Button'
                  variant='ghost'
                  size='icon'
                  className='h-8 w-8 text-zinc-400 dark:text-zinc-500 hover:text-destructive hover:bg-destructive/10 hover:cursor-pointer'
                  onClick={() => onRemove(item.id, item.name)}
                >
                  <Trash2 className='h-4 w-4' />
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
                variant='secondary'
                className={`${status.color} absolute text-white border-none py-0 px-2 h-5 text-[10px] uppercase font-bold`}
              >
                {status.label}
              </Badge>
            )}
          </CardHeader>
          <CardDescription className='text-right text-zinc-500 dark:text-zinc-400 px-4'>
            {item.expiry_date && (
              <div className='flex items-center text-xs text-zinc-500 dark:text-zinc-400'>
                <Calendar className='h-3 w-3 mr-1' />
                {format(new Date(item.expiry_date), 'MMM d')}
              </div>
            )}
          </CardDescription>
          <div className='px-4 py-2 flex justify-center'>
            <div className='w-full h-64 rounded-xl overflow-hidden bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center'>
              {!imgError ? (
                item.image_url ? (
                  <img
                    src={item.image_url}
                    alt={item.name}
                    className='w-full h-full object-cover'
                    onError={() => setImgError(true)}
                  />
                ) : (
                  get_default_image(item.name)
                )
              ) : (
                <ShoppingBasket className='h-10 w-10 text-zinc-300 dark:text-zinc-600' />
              )}
            </div>
          </div>
          <CardContent className='mt-auto pt-2 pb-2'>
            <div className='flex items-center justify-center'>
              <div className='flex w-full justify-between items-center space-x-3'>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-10 w-16 hover:cursor-pointer'
                  onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                >
                  <Minus className='h-5 w-5' />
                </Button>
                <span className='text-sm font-medium w-12 text-center'>
                  {item.quantity}{' '}
                  <span className='text-zinc-500 text-xs ml-1'>
                    {item.unit}
                    {item.quantity > 1 && item.unit !== 'pcs' ? 's' : ''}
                  </span>
                </span>
                <Button
                  variant='outline'
                  size='icon'
                  className='h-10 w-16 hover:cursor-pointer'
                  onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                >
                  <Plus className='h-5 w-5' />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    );
  },
);
