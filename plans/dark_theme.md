# Dark Mode Implementation Plan

## Overview

Add a dark mode toggle to the User Profile page that persists the user's preference. The CSS theme variables and `.dark` class are already defined in `index.css`, so the bulk of the work is wiring up the toggle and auditing hardcoded color classes.

---

## Step 1 — Theme Context

Create a `ThemeProvider` context to manage and expose the current theme.

- Create `src/components/ThemeProvider.tsx`
- State: `theme: 'light' | 'dark'`, initialized from `localStorage` (key: `'theme'`), falling back to `'light'`
- On mount and on change: apply/remove the `.dark` class on `document.documentElement` and persist to `localStorage`
- Export a `useTheme()` hook that returns `{ theme, setTheme }`
- Wrap the app in `<ThemeProvider>` inside `main.tsx`

---

## Step 2 — Toggle on the User Profile Page

Add the toggle control to `UserProfile.tsx` inside a new "Preferences" card, below the Account Details card.

- Use `useTheme()` to read and set the theme
- UI: a labelled row — "Dark Mode" label on the left, a `Switch` component (from `@/components/ui/switch`) on the right
- Toggling the switch calls `setTheme(checked ? 'dark' : 'light')`

---

## Step 3 — Audit Hardcoded Color Classes

The components use hardcoded Tailwind `zinc-*` and `white` classes that won't respond to the `.dark` class automatically. Each needs a `dark:` variant counterpart.

### Key substitutions

| Current class     | Add dark variant       |
| ----------------- | ---------------------- |
| `bg-white`        | `dark:bg-zinc-900`     |
| `bg-zinc-50`      | `dark:bg-zinc-800`     |
| `bg-zinc-100`     | `dark:bg-zinc-800`     |
| `border-zinc-100` | `dark:border-zinc-700` |
| `border-zinc-200` | `dark:border-zinc-700` |
| `text-zinc-900`   | `dark:text-zinc-50`    |
| `text-zinc-500`   | `dark:text-zinc-400`   |
| `text-zinc-400`   | `dark:text-zinc-500`   |
| `text-zinc-300`   | `dark:text-zinc-600`   |

### Files to audit

- `src/App.tsx` — `<nav>`, `<footer>`, logo area, backdrop blur nav
- `src/components/Inventory.tsx` — `ItemCard`, `InventoryGrid`, `EmptyState`, search input, tab bar, dialogs
- `src/components/UserProfile.tsx` — cards, read-only field backgrounds
- `src/components/Login.tsx` — page background, card

---

## Step 4 — Nav Bar Backdrop

The nav uses `bg-white/80 backdrop-blur-md`. In dark mode this should become `dark:bg-zinc-900/80` so the blur effect still works correctly against a dark background.

---

## Implementation Order

1. `ThemeProvider` + `useTheme` hook
2. Wrap `main.tsx`
3. Add toggle to `UserProfile.tsx`
4. Audit and patch `App.tsx`
5. Audit and patch `Inventory.tsx`
6. Audit and patch `Login.tsx`
7. Audit and patch `UserProfile.tsx`
