# Barcode Scanning Plan

## Goal

Add a "Scan Barcode" option to the **Add Item** dialog that uses the device camera to read a product barcode, looks up the product on the Open Food Facts API, and pre-fills the form fields (name, category, image).

---

## Library Choice

Use **`@zxing/browser`** for in-browser barcode decoding via the device camera.

- Actively maintained, TypeScript-native
- Supports all common 1D barcode formats (EAN-13, EAN-8, UPC-A, UPC-E) used on food products
- Works via `MediaDevices.getUserMedia` — no native app required
- Install: `npm install @zxing/browser @zxing/library`

---

## Product Data API

Use the **Open Food Facts** API — free, no API key required, good global coverage.

```
GET https://world.openfoodfacts.org/api/v0/product/{barcode}.json
```

Relevant response fields to map to the item form:

| OFF field                 | Item field          | Notes                                    |
| ------------------------- | ------------------- | ---------------------------------------- |
| `product.product_name`    | `name`              | Fall back to `product.product_name_en`   |
| `product.categories_tags` | `category`          | Map to fridge/pantry/freezer (see below) |
| `product.image_front_url` | `image_url`         | Use as the item photo                    |
| `product.quantity`        | `unit` / `quantity` | e.g. "500g" — parse if possible          |

### Category Mapping Logic

Open Food Facts categories are hierarchical strings like `"en:beverages"`, `"en:frozen-foods"`, `"en:dairy"`. Map them to app categories:

- **freezer** — tags containing: `frozen`, `ice-cream`
- **fridge** — tags containing: `dairy`, `meat`, `fish`, `seafood`, `fresh`, `chilled`, `deli`, `eggs`, `beverages` (many drinks are refrigerated)
- **pantry** — everything else (default fallback)

---

## UX Flow

1. User opens **Add Item** dialog.
2. A **Scan Barcode** button appears alongside the existing "Upload photo" and "Take photo" buttons.
3. Clicking it opens a **`BarcodeScannerDialog`** — a modal with a live camera viewfinder.
4. When a barcode is detected, the scanner stops and a loading state begins.
5. The app calls the Open Food Facts API with the scanned barcode.
6. **If product found:** close the scanner, pre-fill the Add Item form (name, category, image URL), and show a success toast.
7. **If not found:** show an inline error in the scanner modal ("Product not found — try entering details manually") and allow re-scanning or dismissal.
8. **Camera permission denied:** show a clear error message instead of the viewfinder.

The user can always edit the pre-filled fields before saving.

---

## New Files

### `src/components/Items/BarcodeScanner.tsx`

A self-contained component that:

- Accepts `onDetected(barcode: string): void` and `onClose(): void` props
- Renders a `<video>` element and starts `BrowserMultiFormatReader` from `@zxing/browser` on mount
- Stops the reader on unmount (cleanup)
- Handles `NotAllowedError` (camera permission denied) gracefully

### `src/lib/openFoodFacts.ts`

A thin fetch wrapper:

```ts
export interface OFFProduct {
  name: string;
  category: 'fridge' | 'pantry' | 'freezer';
  imageUrl: string | null;
}

export async function lookupBarcode(
  barcode: string,
): Promise<OFFProduct | null>;
```

- Fetches from Open Food Facts
- Maps the response fields using the category logic above
- Returns `null` if `status === 0` (product not found) or on network error

---

## Changes to Existing Files

### `src/components/Items/AddItemDialog.tsx`

- Add a **Scan Barcode** button in the photo section alongside "Upload photo" and "Take photo"
- Add state: `isScannerOpen: boolean`
- Add handler `handleBarcodeDetected(barcode: string)`:
  1. Close the scanner modal
  2. Call `lookupBarcode(barcode)`
  3. If found, call `setNewItem(...)` to pre-fill name, category; set `imagePreview` to the product image URL
  4. Show a toast: `"Product found: {name}"` or `"Product not found"`
- Render `<BarcodeScannerDialog>` conditionally when `isScannerOpen`

---

## Implementation Steps

1. **Install dependencies**

   ```
   npm install @zxing/browser @zxing/library
   ```

2. **Create `src/lib/openFoodFacts.ts`** — fetch + mapping logic

3. **Create `src/components/Items/BarcodeScanner.tsx`** — camera viewfinder component

4. **Update `src/components/Items/AddItemDialog.tsx`** — add the scan button and wire up the handler

5. **Test on mobile** — barcode scanning requires a real camera; test on a phone via the Render deployment or local network

---

## Edge Cases & Considerations

- **HTTPS required** — `getUserMedia` only works on secure origins. The Render deployment is already HTTPS; local dev on `localhost` is also allowed by browsers.
- **Product image is a URL, not a file** — the existing upload flow sends a `File` to Supabase Storage. For barcode-sourced images, store the OFF URL directly in `image_url` instead of uploading. This means `imageFile` stays `null` and the insert skips the upload step (which it already handles correctly).
- **Barcode not on OFF** — many store-brand or regional products won't be found. The form should remain fully editable so the user can fill it in manually.
- **Rate limiting** — Open Food Facts is a public API with no key, but requests should be made only on a confirmed scan, not continuously.
