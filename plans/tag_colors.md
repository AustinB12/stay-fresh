# Plan: Custom Tag Colours

## Overview

Let users assign a colour to any tag so that chips are visually distinct across the inventory — in `ItemCard` badges, the `TagInput` chips inside dialogs, and the filter bar in `Inventory`. Colours are **per-user, per-tag** (not per item), so changing a colour on one item propagates everywhere that tag appears.

---

## 1. Colour Palette

Rather than a free-form colour picker, expose a curated set of 11 named colours. This keeps the UX simple, guarantees contrast, and lets Tailwind classes be statically defined.

**File:** `src/lib/tagColors.ts`

```ts
export type TagColorKey =
  | 'slate'
  | 'red'
  | 'orange'
  | 'amber'
  | 'lime'
  | 'green'
  | 'teal'
  | 'sky'
  | 'blue'
  | 'violet'
  | 'pink';

export interface TagColorClasses {
  badge: string; // applied to the Badge component
  dot: string; // small swatch circle used in the picker
}

export const TAG_COLORS: Record<TagColorKey, TagColorClasses> = {
  slate: {
    badge:
      'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-900 dark:text-slate-300 dark:border-slate-700',
    dot: 'bg-slate-400',
  },
  red: {
    badge:
      'bg-red-100 text-red-700 border-red-300 dark:bg-red-950 dark:text-red-400 dark:border-red-800',
    dot: 'bg-red-500',
  },
  orange: {
    badge:
      'bg-orange-100 text-orange-700 border-orange-300 dark:bg-orange-950 dark:text-orange-400 dark:border-orange-800',
    dot: 'bg-orange-500',
  },
  amber: {
    badge:
      'bg-amber-100 text-amber-700 border-amber-300 dark:bg-amber-950 dark:text-amber-400 dark:border-amber-800',
    dot: 'bg-amber-500',
  },
  lime: {
    badge:
      'bg-lime-100 text-lime-700 border-lime-300 dark:bg-lime-950 dark:text-lime-400 dark:border-lime-800',
    dot: 'bg-lime-500',
  },
  green: {
    badge:
      'bg-green-100 text-green-700 border-green-300 dark:bg-green-950 dark:text-green-400 dark:border-green-800',
    dot: 'bg-green-500',
  },
  teal: {
    badge:
      'bg-teal-100 text-teal-700 border-teal-300 dark:bg-teal-950 dark:text-teal-400 dark:border-teal-800',
    dot: 'bg-teal-500',
  },
  sky: {
    badge:
      'bg-sky-100 text-sky-700 border-sky-300 dark:bg-sky-950 dark:text-sky-400 dark:border-sky-800',
    dot: 'bg-sky-500',
  },
  blue: {
    badge:
      'bg-blue-100 text-blue-700 border-blue-300 dark:bg-blue-950 dark:text-blue-400 dark:border-blue-800',
    dot: 'bg-blue-500',
  },
  violet: {
    badge:
      'bg-violet-100 text-violet-700 border-violet-300 dark:bg-violet-950 dark:text-violet-400 dark:border-violet-800',
    dot: 'bg-violet-500',
  },
  pink: {
    badge:
      'bg-pink-100 text-pink-700 border-pink-300 dark:bg-pink-950 dark:text-pink-400 dark:border-pink-800',
    dot: 'bg-pink-500',
  },
};

/** Returns the badge className for a given colour key, or undefined for the default style. */
export function getTagBadgeClass(
  color: string | undefined,
): string | undefined {
  return color ? TAG_COLORS[color as TagColorKey]?.badge : undefined;
}
```

> All class strings are literal — Tailwind's scanner will include them during the build without needing a safelist.

---

## 2. Database

### New table: `user_tag_colors`

Stores one row per user+tag combination. Using a separate table (rather than JSONB on `items`) means colours are global to the user and don't need to be stored redundantly on every item.

```sql
CREATE TABLE user_tag_colors (
  user_id uuid  NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tag     text  NOT NULL,
  color   text  NOT NULL,  -- one of the TagColorKey values
  PRIMARY KEY (user_id, tag)
);

ALTER TABLE user_tag_colors ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users manage their own tag colours"
  ON user_tag_colors FOR ALL
  USING  (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);
```

### Supabase helper functions

Add to `src/lib/supabase.ts`:

```ts
/** Fetch all tag → color mappings for the current user. */
export async function fetchTagColors(
  userId: string,
): Promise<Record<string, string>> {
  const { data } = await supabase
    .from('user_tag_colors')
    .select('tag, color')
    .eq('user_id', userId);
  return Object.fromEntries((data ?? []).map(({ tag, color }) => [tag, color]));
}

/** Upsert a single tag colour. Pass color = null to remove. */
export async function setTagColor(
  userId: string,
  tag: string,
  color: string | null,
): Promise<void> {
  if (color === null) {
    await supabase
      .from('user_tag_colors')
      .delete()
      .match({ user_id: userId, tag });
  } else {
    await supabase
      .from('user_tag_colors')
      .upsert({ user_id: userId, tag, color });
  }
}
```

---

## 3. New Component: `TagColorPicker`

**File:** `src/components/Items/TagColorPicker.tsx`

A small floating colour-swatch grid that appears when the user clicks a tag chip's colour dot. Implemented as a simple absolutely-positioned overlay (no additional dependency required — mirrors the existing `TagInput` dropdown pattern).

### Props

```ts
interface TagColorPickerProps {
  currentColor?: string;
  onSelect: (color: TagColorKey | null) => void;
  onClose: () => void;
}
```

### Layout

- 11 circular swatches arranged in a 2-row grid inside a rounded card.
- The active colour gets a ring outline.
- A "None" option (grey with an ×) clears the colour.
- Clicking outside closes it (via `onBlur` / a backdrop or `mousedown` listener).

---

## 4. Updates to `TagInput`

**File:** `src/components/Items/TagInput.tsx`

### New props

```ts
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[];
  tagColors?: Record<string, string>; // tag → color key
  onColorChange?: (tag: string, color: string | null) => void;
}
```

### Chip rendering changes

Each chip gains a small coloured dot on its left edge. Clicking the dot opens `TagColorPicker` for that tag. The chip's background and text colours come from `getTagBadgeClass(tagColors?.[tag])`.

```tsx
{
  tags.map((tag) => {
    const colorClass = getTagBadgeClass(tagColors?.[tag]);
    return (
      <Badge
        key={tag}
        variant='secondary'
        className={cn('gap-1 pr-1 text-xs h-5 border', colorClass)}
      >
        {onColorChange && (
          <button
            type='button'
            className={cn(
              'h-2.5 w-2.5 rounded-full flex-shrink-0 cursor-pointer',
              tagColors?.[tag]
                ? TAG_COLORS[tagColors[tag] as TagColorKey]?.dot
                : 'bg-zinc-300 dark:bg-zinc-600',
            )}
            onClick={(e) => {
              e.stopPropagation();
              openPicker(tag);
            }}
          />
        )}
        {tag}
        <button type='button' onClick={() => removeTag(tag)}>
          <X className='h-2.5 w-2.5' />
        </button>
      </Badge>
    );
  });
}
```

### Dropdown suggestion changes

Each suggestion in the autocomplete dropdown also shows its coloured dot (if it has one) so users can recognise tags by colour before adding them.

---

## 5. Updates to `ItemCard`

**File:** `src/components/Items/ItemCard.tsx`

### New prop

```ts
tagColors?: Record<string, string>;
```

Apply the colour class to each badge:

```tsx
{
  (item.tags ?? []).map((tag) => (
    <Badge
      key={tag}
      variant='outline'
      className={cn(
        'text-[10px] px-1.5 py-0 h-4 border',
        getTagBadgeClass(tagColors?.[tag]) ??
          'border-zinc-300 dark:border-zinc-600 text-zinc-500 dark:text-zinc-400',
      )}
    >
      {tag}
    </Badge>
  ));
}
```

`tagColors` is passed from `Inventory → InventoryGrid → ItemCard`.

---

## 6. Updates to `Inventory`

**File:** `src/components/Inventory.tsx`

### State

```ts
const [tagColors, setTagColors] = useState<Record<string, string>>({});
```

### Fetching

Load tag colours alongside items:

```ts
const fetchItems = useCallback(async () => {
  // existing items fetch ...
  if (user) {
    const colors = await fetchTagColors(user.id);
    setTagColors(colors);
  }
}, [user]);
```

### Saving a colour change

```ts
const handleTagColorChange = useCallback(
  async (tag: string, color: string | null) => {
    // Optimistic update
    setTagColors((prev) => {
      const next = { ...prev };
      if (color === null) delete next[tag];
      else next[tag] = color;
      return next;
    });
    await setTagColor(user!.id, tag, color);
  },
  [user],
);
```

### Passing props down

- `tagColors` and `handleTagColorChange` are passed to `AddItemDialog`, `EditItemDialog`, `InventoryGrid` (→ `ItemCard`), and the filter bar badge chips.
- `InventoryGrid` gains a `tagColors` prop forwarded to each `ItemCard`.

### Filter bar

The filter bar chips also use `getTagBadgeClass` so active/inactive colours are consistent:

```tsx
<Badge
  key={tag}
  className={cn(
    'cursor-pointer select-none transition-opacity',
    activeTags.includes(tag)
      ? (getTagBadgeClass(tagColors[tag]) ??
          'bg-zinc-800 text-white dark:bg-zinc-100 dark:text-zinc-900')
      : (getTagBadgeClass(tagColors[tag]) ??
          'border border-zinc-300 dark:border-zinc-600 text-zinc-500'),
    !activeTags.includes(tag) && 'opacity-60',
  )}
  onClick={() => toggleTag(tag)}
>
  {tag}
</Badge>
```

---

## 7. Implementation Order

1. Create `src/lib/tagColors.ts` with the palette constant and `getTagBadgeClass` helper.
2. Run the `CREATE TABLE user_tag_colors` migration and enable RLS in Supabase.
3. Add `fetchTagColors` and `setTagColor` to `src/lib/supabase.ts`.
4. Build `TagColorPicker.tsx`.
5. Update `TagInput.tsx` with colour props and dot button.
6. Update `ItemCard.tsx` with `tagColors` prop.
7. Update `InventoryGrid` to forward `tagColors`.
8. Update `Inventory.tsx`: fetch colours, manage state, wire `handleTagColorChange`, update filter bar.
9. Pass `tagColors` / `onColorChange` into `AddItemDialog` and `EditItemDialog`.

---

## 8. Out of Scope

- **Colour-based sorting** — sorting items so coloured tags appear first.
- **Bulk recolour** — changing a colour name (e.g. "fruit" → "produce") across all items.
- **Per-item colour overrides** — a single item having a different colour for a shared tag.
- **Custom hex input** — typing an arbitrary hex value instead of choosing from the palette.
