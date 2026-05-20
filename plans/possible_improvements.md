### Core Features

- **Expiry notifications** — push or email alerts when items are nearing their expiry date (e.g. 1–3 days out), using Supabase Edge Functions + a cron job
- **Shopping list** — automatically move items with quantity 0 to a shopping list, or let users manually flag items to restock
- **Barcode scanning** — scan a product barcode to auto-fill name, category, and expiry using an API like Open Food Facts
- **Recipe suggestions** — given what's currently in the fridge/pantry, suggest recipes using an LLM or recipe API

### Data & Organization

- **Custom categories** — let users define their own storage locations beyond fridge/pantry/freezer (e.g. "wine rack", "spice drawer")
- **Item notes/tags** — free-text notes or custom tags per item (e.g. "opened", "allergen", "for guests only")
- **Nutritional info** — fetch and display nutrition data per item from a food database API
- **Bulk import/export** — CSV import for seeding inventory; CSV/JSON export for backup

### Sharing & Social

- **Household sharing** — multiple users sharing a single inventory (requires a `household_id` concept in the DB schema)
- **Activity log** — a feed showing who added/removed/edited what, useful for shared households

### UX / Quality of Life

- **Mobile app / PWA** — add a web app manifest and service worker so it can be installed on a phone home screen
- **Drag-and-drop between categories** — move items between fridge/pantry/freezer by dragging
- **Sort & filter options** — sort by expiry date, name, quantity; filter by expiry status (expired, expiring soon, fresh)
- **Quick-add from history** — suggest previously added items when typing in the add dialog
- **Keyboard shortcuts** — power-user shortcuts for adding items, searching, etc.

### Analytics

- **Waste tracker** — log when items are thrown away and visualize food waste over time
- **Spending insights** — optionally track item costs and show monthly spend summaries
