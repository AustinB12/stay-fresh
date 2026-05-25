# Percentage Used Tracker — Feature Plan

## Overview

Allow users to choose between two tracking modes when adding or editing an inventory item:

- **Quantity** (existing behavior) — track a numeric count with a unit (e.g., "3 pcs", "2 bags")
- **Percentage Remaining** (new) — track how full/full the item is on a 0–100% scale (e.g., a bag of chips that is 75% full)

The mode is stored per-item so each item independently uses whichever tracking type makes sense for it.

---

## 1. Database Changes

### New columns on the `items` table

| Column | Type | Default | Notes |
|---|---|---|---|
| `tracking_type` | `'quantity' \| 'percentage'` | `'quantity'` | Determines which tracking mode is active |
| `percentage_remaining` | `integer \| null` | `null` | 0–100; only meaningful when `tracking_type = 'percentage'` |

### Migration SQL

```sql
ALTER TABLE items
  ADD COLUMN tracking_type text NOT NULL DEFAULT 'quantity'
    CHECK (tracking_type IN ('quantity', 'percentage')),
  ADD COLUMN percentage_remaining integer
    CHECK (percentage_remaining IS NULL OR (percentage_remaining >= 0 AND percentage_remaining <= 100));
```

> Existing rows will default to `tracking_type = 'quantity'` and `percentage_remaining = null`, preserving all current behavior.

---

## 2. Type Updates (`src/types/database.ts`)

Add `tracking_type` and `percentage_remaining` to the `Row`, `Insert`, and `Update` interfaces for the `items` table.

```ts
// Row
tracking_type: 'quantity' | 'percentage'
percentage_remaining: number | null

// Insert
tracking_type?: 'quantity' | 'percentage'
percentage_remaining?: number | null

// Update
tracking_type?: 'quantity' | 'percentage'
percentage_remaining?: number | null
```

---

## 3. Add Item Dialog (`src/components/Items/AddItemDialog.tsx`)

### State changes

Add `tracking_type` and `percentage_remaining` to `newItem` state:

```ts
const [newItem, setNewItem] = useState({
  // ...existing fields
  tracking_type: 'quantity' as 'quantity' | 'percentage',
  percentage_remaining: 100,
})
```

### UI changes — replace the Quantity section

The current "Quantity" grid cell becomes a two-part section:

1. **Mode toggle** — a pair of small toggle buttons ("Quantity" / "Percentage") placed as a label-row above the input.
2. **Conditional inputs**:
   - When `tracking_type === 'quantity'`: show existing `<Input type="number">` + unit `<Input>` (unchanged).
   - When `tracking_type === 'percentage'`: show a `<Slider>` (0–100) with a live readout label (e.g., "75% remaining"), replacing both the number and unit inputs. A standard HTML range input or a Radix/shadcn `Slider` component can be used.

### Reset

`resetForm()` resets `tracking_type` back to `'quantity'` and `percentage_remaining` to `100`.

---

## 4. Edit Item Dialog (`src/components/Items/EditItemDialog.tsx`)

Mirror the same changes as AddItemDialog:

- The mode toggle reads from / writes to `editingItem.tracking_type`.
- The conditional inputs read from / write to `editingItem.quantity` + `editingItem.unit` (quantity mode) or `editingItem.percentage_remaining` (percentage mode).
- Switching modes does **not** clear the other mode's value, so toggling back and forth is non-destructive.

---

## 5. Item Card (`src/components/Items/ItemCard.tsx`)

### Quantity mode (unchanged)

The existing `+` / `−` buttons and `{quantity} {unit}` display remain exactly as they are.

### Percentage mode

Replace the quantity row with:

- A **labelled progress bar** showing how full the item is (e.g., a colored `<div>` with dynamic width % inside a container).
  - Color coding: green ≥ 50 %, yellow 25–49 %, red < 25 %.
- Two **adjustment buttons** flanking the bar:
  - `−10%` decreases `percentage_remaining` by 10 (min 0).
  - `+10%` increases `percentage_remaining` by 10 (max 100).
- A small text label showing the exact value (e.g., `"75% remaining"`).

The `onUpdateQuantity` prop is reused conceptually, but a new `onUpdatePercentage` prop (or an extended version of the existing prop) will be needed to update `percentage_remaining` in Supabase.

---

## 6. Inventory Component (`src/components/Inventory.tsx`)

- Add an `onUpdatePercentage(id: string, percentage: number)` handler (similar to `onUpdateQuantity`) that calls Supabase to update `percentage_remaining`.
- Pass `onUpdatePercentage` down to `<ItemCard>`.
- No changes to filtering/sorting logic are required unless a "sort by fullness" option is desired (out of scope for this plan).

---

## 7. Component Breakdown Summary

| File | Change type | Summary |
|---|---|---|
| `src/types/database.ts` | Edit | Add two new fields to all three interface sections |
| `src/components/Items/AddItemDialog.tsx` | Edit | Add mode toggle + conditional quantity/percentage inputs |
| `src/components/Items/EditItemDialog.tsx` | Edit | Same toggle + inputs as AddItemDialog |
| `src/components/Items/ItemCard.tsx` | Edit | Conditional percentage bar + adjustment buttons |
| `src/components/Inventory.tsx` | Edit | Add `onUpdatePercentage` handler and pass to ItemCard |
| Database migration | New SQL | Add `tracking_type` + `percentage_remaining` columns |

---

## 8. Edge Cases & Considerations

- **Existing items** — all default to `tracking_type = 'quantity'`; no data loss.
- **Barcode scan auto-fill** — auto-filled items default to quantity mode; user can switch in the dialog before saving.
- **Percentage clamping** — decrement/increment must be clamped to [0, 100].
- **Display in percentage mode** — the unit field is irrelevant and should not be shown or stored as a meaningful value; set it to `''` (empty string) or a sentinel value like `'%'` on save.
- **Low-stock warnings** — consider treating `percentage_remaining < 25` as a "low" status analogous to quantity = 1 for any future low-stock notifications.
