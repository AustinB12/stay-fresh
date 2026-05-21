import { useEffect, useRef, useState } from 'react';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { TAG_COLORS, TagColorKey, getTagBadgeClass } from '@/lib/tagColors';
import { TagColorPicker } from './TagColorPicker';

const SEED_TAGS = [
  'fruit',
  'vegetable',
  'dairy',
  'meat',
  'seafood',
  'grain',
  'snack',
  'beverage',
  'condiment',
  'breakfast',
  'lunch',
  'dinner',
  'dessert',
  'baking',
  'opened',
  'low stock',
  'vegan',
  'gluten-free',
  'allergen',
];

interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  /** Existing tags from the user's inventory. Falls back to seed suggestions when empty. */
  suggestions?: string[];
  tagColors?: Record<string, string>;
  onColorChange?: (tag: string, color: TagColorKey | null) => void;
}

export function TagInput({
  tags,
  onChange,
  suggestions = [],
  tagColors = {},
  onColorChange,
}: TagInputProps) {
  const [input, setInput] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const [pickerTag, setPickerTag] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close picker on outside mousedown
  useEffect(() => {
    if (!pickerTag) return;
    const handler = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setPickerTag(null);
      }
    };
    window.addEventListener('mousedown', handler);
    return () => window.removeEventListener('mousedown', handler);
  }, [pickerTag]);

  const effectiveSuggestions = suggestions.length > 0 ? suggestions : SEED_TAGS;

  const filtered = effectiveSuggestions.filter(
    (s) =>
      (input.trim() === '' ||
        s.toLowerCase().includes(input.trim().toLowerCase())) &&
      !tags.includes(s.toLowerCase()),
  );

  const addTag = (raw: string) => {
    const tag = raw.trim().toLowerCase();
    if (!tag || tags.includes(tag)) return;
    onChange([...tags, tag]);
    setInput('');
  };

  const removeTag = (tag: string) => {
    onChange(tags.filter((t) => t !== tag));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag(input);
    } else if (e.key === 'Backspace' && input === '' && tags.length > 0) {
      onChange(tags.slice(0, -1));
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <div ref={containerRef} className='relative'>
      <div
        className='flex flex-wrap gap-1.5 min-h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm cursor-text'
        onClick={() => inputRef.current?.focus()}
      >
        {tags.map((tag) => {
          const colorClass = getTagBadgeClass(tagColors[tag]);
          return (
            <Badge
              key={tag}
              variant='secondary'
              className={cn(
                'gap-1 pr-1 text-xs h-5 border',
                colorClass ?? 'border-transparent',
              )}
            >
              {onColorChange && (
                <button
                  type='button'
                  onMouseDown={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setPickerTag((prev) => (prev === tag ? null : tag));
                    setShowDropdown(false);
                  }}
                  className={cn(
                    'h-2.5 w-2.5 rounded-full shrink-0 cursor-pointer hover:scale-110 transition-transform',
                    tagColors[tag]
                      ? TAG_COLORS[tagColors[tag] as TagColorKey]?.dot
                      : 'bg-zinc-300 dark:bg-zinc-600',
                  )}
                  title='Set colour'
                />
              )}
              {tag}
              <button
                type='button'
                onClick={(e) => {
                  e.stopPropagation();
                  removeTag(tag);
                }}
                className='rounded-full hover:bg-zinc-300 dark:hover:bg-zinc-600 p-0.5 cursor-pointer'
              >
                <X className='h-2.5 w-2.5' />
              </button>
            </Badge>
          );
        })}
        <input
          ref={inputRef}
          value={input}
          onChange={(e) => {
            setInput(e.target.value);
            setShowDropdown(true);
            setPickerTag(null);
          }}
          onKeyDown={handleKeyDown}
          onFocus={() => setShowDropdown(true)}
          onBlur={() => setTimeout(() => setShowDropdown(false), 150)}
          placeholder={tags.length === 0 ? 'Add tags...' : ''}
          className='flex-1 min-w-20 bg-transparent outline-none placeholder:text-muted-foreground text-sm'
        />
      </div>
      {pickerTag && onColorChange && (
        <TagColorPicker
          currentColor={tagColors[pickerTag]}
          onSelect={(color) => {
            onColorChange(pickerTag, color);
            setPickerTag(null);
          }}
        />
      )}
      {!pickerTag && showDropdown && filtered.length > 0 && (
        <div className='absolute z-50 mt-1 w-full rounded-md border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 shadow-md max-h-40 overflow-y-auto'>
          {filtered.map((s) => (
            <button
              key={s}
              type='button'
              onMouseDown={(e) => {
                e.preventDefault();
                addTag(s);
              }}
              className='w-full text-left px-3 py-1.5 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-800 cursor-pointer flex items-center gap-2'
            >
              {tagColors[s] && (
                <span
                  className={cn(
                    'h-2 w-2 rounded-full shrink-0',
                    TAG_COLORS[tagColors[s] as TagColorKey]?.dot,
                  )}
                />
              )}
              {s}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
