# Plan: Households

## Overview

Allow users to belong to one or more households. Each household has a shared inventory — items are scoped to a household rather than an individual user. When a user first opens the app (after logging in), they are prompted to either create a new household or join an existing one via an invite code. A dedicated management page lets users view their households, invite others, leave a household, or switch their active household.

---

## Database Changes (Supabase)

### 1. `households` table

```sql
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  invite_code text not null unique default substring(replace(gen_random_uuid()::text, '-', ''), 1, 8),
  created_by  uuid not null references auth.users(id) on delete set null,
  created_at  timestamptz not null default now()
);

-- RLS: any authenticated user can read a household they are a member of
alter table public.households enable row level security;

create policy "Members can read their household"
  on public.households for select
  using (
    exists (
      select 1 from public.household_members
      where household_members.household_id = households.id
        and household_members.user_id = auth.uid()
    )
  );

create policy "Creator can update their household"
  on public.households for update
  using (created_by = auth.uid());
```

### 2. `household_members` join table

```sql
create table public.household_members (
  id           uuid primary key default gen_random_uuid(),
  household_id uuid not null references public.households(id) on delete cascade,
  user_id      uuid not null references auth.users(id) on delete cascade,
  role         text not null default 'member' check (role in ('owner', 'member')),
  joined_at    timestamptz not null default now(),
  unique (household_id, user_id)
);

alter table public.household_members enable row level security;

create policy "Members can read their own memberships"
  on public.household_members for select
  using (user_id = auth.uid());

create policy "Members can delete their own membership (leave)"
  on public.household_members for delete
  using (user_id = auth.uid());

create policy "Owners can delete any membership in their household"
  on public.household_members for delete
  using (
    exists (
      select 1 from public.household_members hm
      where hm.household_id = household_members.household_id
        and hm.user_id = auth.uid()
        and hm.role = 'owner'
    )
  );

-- Allow any authenticated user to insert their own membership row (joining via invite code)
create policy "Users can join a household"
  on public.household_members for insert
  with check (user_id = auth.uid());
```

### 3. Add `household_id` to `items`

```sql
alter table public.items
  add column household_id uuid references public.households(id) on delete cascade;

-- Backfill existing rows if needed (set to null or a default household)
-- Update NOT NULL constraint after backfill:
alter table public.items alter column household_id set not null;
```

Update the `items` RLS policy to scope reads/writes to household membership instead of (or in addition to) `user_id`:

```sql
-- Drop old user-scoped policy, add household-scoped policy
drop policy if exists "Users can manage their own items" on public.items;

create policy "Household members can read items"
  on public.items for select
  using (
    exists (
      select 1 from public.household_members
      where household_members.household_id = items.household_id
        and household_members.user_id = auth.uid()
    )
  );

create policy "Household members can insert items"
  on public.items for insert
  with check (
    exists (
      select 1 from public.household_members
      where household_members.household_id = items.household_id
        and household_members.user_id = auth.uid()
    )
  );

create policy "Household members can update items"
  on public.items for update
  using (
    exists (
      select 1 from public.household_members
      where household_members.household_id = items.household_id
        and household_members.user_id = auth.uid()
    )
  );

create policy "Household members can delete items"
  on public.items for delete
  using (
    exists (
      select 1 from public.household_members
      where household_members.household_id = items.household_id
        and household_members.user_id = auth.uid()
    )
  );
```

---

## TypeScript Types (`src/types/database.ts`)

Add the two new tables and update `Item`:

```ts
households: {
  Row: {
    id: string
    name: string
    invite_code: string
    created_by: string
    created_at: string
  }
  Insert: {
    id?: string
    name: string
    invite_code?: string
    created_by: string
    created_at?: string
  }
  Update: {
    id?: string
    name?: string
    invite_code?: string
    created_by?: string
    created_at?: string
  }
}

household_members: {
  Row: {
    id: string
    household_id: string
    user_id: string
    role: 'owner' | 'member'
    joined_at: string
  }
  Insert: {
    id?: string
    household_id: string
    user_id: string
    role?: 'owner' | 'member'
    joined_at?: string
  }
  Update: {
    id?: string
    household_id?: string
    user_id?: string
    role?: 'owner' | 'member'
    joined_at?: string
  }
}
```

Add convenience exports:

```ts
export type Household = Database['public']['Tables']['households']['Row']
export type HouseholdMember = Database['public']['Tables']['household_members']['Row']
```

Update `Item` to include `household_id: string`.

---

## New Context: `HouseholdProvider` (`src/contexts/HouseholdProvider.tsx`)

Wrap the app in a context that tracks the user's households and their currently active household. This keeps household state out of individual components.

```ts
interface HouseholdContextType {
  households: Household[]           // all households the user belongs to
  activeHousehold: Household | null // the one currently selected
  members: HouseholdMember[]        // members of the active household
  loading: boolean
  setActiveHousehold: (h: Household) => void
  createHousehold: (name: string) => Promise<Household>
  joinHousehold: (inviteCode: string) => Promise<Household>
  leaveHousehold: (householdId: string) => Promise<void>
  regenerateInviteCode: (householdId: string) => Promise<string>
  removeMember: (memberId: string) => Promise<void>
}
```

**Behaviour:**
- On mount, fetch all `household_members` rows for the current user, then fetch the corresponding `households`.
- Persist the active household ID to `localStorage` so it survives page refreshes (`stay-fresh:activeHouseholdId`).
- If the user has no households, set `activeHousehold` to `null` — this triggers the onboarding screen.

---

## Onboarding Screen (`src/components/HouseholdOnboarding.tsx`)

Shown automatically in `App.tsx` when `activeHousehold === null && !loading`.

Two cards side by side (or stacked on mobile):

### Create a Household
- Text input: "Household name" (e.g. "Smith Family Fridge")
- Button: "Create" → calls `createHousehold(name)`, then navigates to inventory

### Join a Household
- Text input: "Invite code"  
- Button: "Join" → calls `joinHousehold(code)`, shows a toast on invalid code, navigates to inventory on success

---

## Household Management Page (`src/components/HouseholdManager.tsx`)

Accessible from the nav (new "Households" menu item or a `view` state in `App.tsx`, consistent with how `UserProfile` is shown today).

### Sections

**1. Your Households**
- List of all households the user belongs to, with a "Switch" button on each.
- The active household is highlighted.
- "Leave" button on each (disabled/hidden if the user is the sole owner — they must delete or transfer ownership first).

**2. Active Household Details**
- Editable household name (owners only).
- Invite code displayed with a "Copy" button and a "Regenerate" button (owners only). Regenerating invalidates the old code.
- Member list: avatar/email, role badge (`owner` / `member`), and a "Remove" button visible to owners.

**3. Create Another Household**
- Inline form: name input + "Create" button.

---

## Changes to `App.tsx`

- Add `view` state option: `'inventory' | 'profile' | 'households'`.
- Wrap children with `<HouseholdProvider>`.
- After auth check but before rendering `<Inventory>`, check `activeHousehold`. If `null`, render `<HouseholdOnboarding>` instead.
- Add a "Households" nav item in the top bar.

```tsx
// Simplified flow in App.tsx
if (!user) return <Login />
if (householdLoading) return <LoadingSpinner />
if (!activeHousehold) return <HouseholdOnboarding />

// normal app with nav + view switching
```

---

## Changes to `Inventory.tsx`

- Accept (or read from context) the `activeHousehold`.
- Filter the Supabase query by `household_id`:

```ts
supabase
  .from('items')
  .select('*')
  .eq('household_id', activeHousehold.id)
  .order('expiry_date', { ascending: true, nullsFirst: false })
```

- Pass `household_id` when inserting new items in `AddItemDialog` and `QuickAddItemDialog`.

---

## Changes to `AddItemDialog.tsx` / `QuickAddItemDialog.tsx`

- Accept a `householdId: string` prop (passed down from `Inventory`).
- Include `household_id: householdId` in every insert payload.

---

## Implementation Order

1. **Database** — create `households` and `household_members` tables, migrate `items` to add `household_id`, update all RLS policies.
2. **Types** — update `src/types/database.ts`.
3. **HouseholdProvider** — implement context with create/join/leave/switch logic.
4. **HouseholdOnboarding** — build the first-run UI.
5. **App.tsx** — wire provider, add onboarding gate, add nav item.
6. **Inventory + dialogs** — scope queries and inserts to `activeHousehold.id`.
7. **HouseholdManager** — build the management page.

---

## Edge Cases & Considerations

- **Sole owner leaving**: Prevent leaving if the user is the only owner. Show a message asking them to promote another member or delete the household first.
- **Household deletion**: Out of scope for v1, but worth noting — deleting a household would cascade-delete all its items via the FK.
- **Invite code brute-force**: The 8-character alphanumeric code is low-security by design (no sensitive data is exposed by joining the wrong household). For tighter control, consider expiring invite codes or a request/approve flow in a future iteration.
- **Switching households**: Switching updates `activeHousehold` in context and persists to `localStorage`. The inventory re-fetches automatically because it depends on `activeHousehold.id`.
- **Real-time updates**: If Supabase Realtime is enabled on `items`, the subscription filter will need to include `household_id=eq.{activeHousehold.id}` to avoid receiving other households' events.
- **`user_tag_colors`**: Tag colors are currently per-user. Consider whether they should become per-household in a future pass.
