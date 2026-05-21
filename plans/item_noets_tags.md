# Plan: Custom Tags for Inventory Items

## Overview

Allow users to attach one or more free-text tags to any inventory item (e.g. "fruit", "vegetable", "breakfast", "opened", "allergen"). Tags are user-scoped, reusable across items, and can be used to filter the inventory view.

---

## 1. Database Changes

### Add `tags` column to the `items` table

The simplest approach is a `text[]` (PostgreSQL array) column directly on `items`. This avoids a join table while still supporting multi-value tags and array operators for filtering.

```sql
ALTER TABLE items
  ADD COLUMN tags text[] NOT NULL DEFAULT '{}';
```

No separate `tags` table is needed — autocomplete suggestions are derived by querying the distinct values across all `tags` arrays for the current user:

```sql
SELECT DISTINCT unnest(tags) AS tag
FROM items
WHERE user_id = $1
ORDER BY tag;
```

---

## 2. TypeScript Type Updates

### `src/types/database.ts`

Add `tags` to `Row`, `Insert`, and `Update` shapes:

```ts
Row: {
  // ...existing fields
  tags: string[];
};
Insert: {
  // ...existing fields
  tags?: string[];
};
Update: {
  // ...existing fields
  tags?: string[];
};
```

The derived `Item` type will automatically pick up the new field.

---

## 3. New Component: `TagInput`

**File:** `src/components/Items/TagInput.tsx`

A controlled component used inside both `AddItemDialog` and `EditItemDialog`.

### Props

```ts
interface TagInputProps {
  tags: string[];
  onChange: (tags: string[]) => void;
  suggestions?: string[]; // existing tags from the user's inventory
}
```

### Behaviour

- Renders current tags as small removable `<Badge>` chips inline.
- A text `<Input>` sits at the end of the chip list.
- Typing shows a filtered dropdown of `suggestions` that match the current input (case-insensitive).
- **Enter** or **comma** confirms the typed tag and clears the input.
- **Backspace** on an empty input removes the last tag.
- Duplicate tags (same string, case-insensitive) are silently ignored.
- Tags are trimmed and lower-cased on save so "Fruit" and "fruit" are the same tag.

### Visual design

Matches the existing `Badge` + `Input` style used elsewhere. Use `variant="secondary"` badges with an `×` button on each chip.

---

## 4. Fetch Existing Tag Suggestions

### `src/lib/supabase.ts` (or inline in `Inventory.tsx`)

Add a helper that returns the distinct tags already used by the current user:

```ts
export async function fetchUserTags(userId: string): Promise<string[]> {
  const { data } = await supabase.rpc('get_user_tags', { p_user_id: userId });
  return (data ?? []) as string[];
}
```

Create the corresponding Supabase database function:

```sql
CREATE OR REPLACE FUNCTION get_user_tags(p_user_id uuid)
RETURNS TABLE(tag text) LANGUAGE sql STABLE AS $$
  SELECT DISTINCT unnest(tags) AS tag
  FROM items
  WHERE user_id = p_user_id
  ORDER BY tag;
$$;
```

Alternatively, this can be done client-side by deriving distinct tags from the already-fetched items array to avoid an extra network call.

---

## 5. Dialog Updates

### `AddItemDialog.tsx`

- Add `tags: [] as string[]` to the `newItem` state.
- Fetch `userTags` (suggestions) when the dialog opens.
- Render `<TagInput tags={newItem.tags} onChange={...} suggestions={userTags} />` below the expiry date field.
- Include `tags` in the Supabase `insert` payload.

### `EditItemDialog.tsx`

- Add `tags` to the `editingItem` state (initialised from the existing item's `tags` array).
- Same `<TagInput>` integration as above.
- Include `tags` in the Supabase `update` payload.

---

## 6. ItemCard Tag Display

### `src/components/Items/ItemCard.tsx`

Render tags as small badges at the bottom of the card, above the quantity controls, only when the item has at least one tag:

```tsx
{
  item.tags.length > 0 && (
    <div className='flex flex-wrap gap-1 px-4 pb-2'>
      {item.tags.map((tag) => (
        <Badge
          key={tag}
          variant='outline'
          className='text-[10px] px-1.5 py-0 h-4'
        >
          {tag}
        </Badge>
      ))}
    </div>
  );
}
```

---

## 7. Tag Filtering in Inventory

### `src/components/Inventory.tsx`

Add a collapsible or always-visible tag filter bar below the existing category tabs.

**State:**

```ts
const [activeTags, setActiveTags] = useState<string[]>([]);
```

**Tag bar UI:**

- Derive `allTags` from the current items list (deduplicated, sorted).
- Render each tag as a toggleable `<Badge>` chip. Active tags are highlighted (e.g. `variant="default"` vs `variant="outline"`).
- Clicking a tag toggles it in `activeTags`.
- A "Clear" button appears when any tags are active.

**Filtering logic (OR semantics):**
An item passes the tag filter if it has _at least one_ of the active tags, which is the most natural behaviour for broad categories like "fruit" or "breakfast".

```ts
const tagFilteredItems =
  activeTags.length === 0
    ? items
    : items.filter((item) => activeTags.some((tag) => item.tags.includes(tag)));
```

Apply this filter after the existing category/search filter.

---

## 8. Suggested Tags (Pre-populated Examples)

No hardcoded tags are required, but the UI could seed a short list of common suggestions the first time a user opens the tag input, making it faster to get started:

- Food type: `fruit`, `vegetable`, `dairy`, `meat`, `seafood`, `grain`, `snack`, `beverage`, `condiment`
- Meal context: `breakfast`, `lunch`, `dinner`, `dessert`, `baking`
- Status: `opened`, `low stock`
- Dietary: `vegan`, `gluten-free`, `allergen`

These would only appear as autocomplete suggestions if the user has no existing tags yet, giving them a starting point without forcing any structure.

---

## 9. Implementation Order

1. Run the `ALTER TABLE` migration in Supabase.
2. Add the `get_user_tags` database function (or implement client-side derivation).
3. Update `src/types/database.ts`.
4. Build and test `TagInput.tsx` in isolation.
5. Integrate `TagInput` into `AddItemDialog` and `EditItemDialog`.
6. Update `ItemCard` to display tags.
7. Add tag filtering to `Inventory`.

---

## 10. Out of Scope (Future Considerations)

- **Tag renaming** — bulk-rename a tag across all items (requires a custom RPC or client-side update loop).
- **Tag colours** — let users assign a colour to a tag for visual distinction.
- **AND vs OR toggle** — a small toggle to switch between "items matching ALL selected tags" and "items matching ANY selected tag".
- **Tag-based sorting** — sort inventory so items with a specific tag appear first.
