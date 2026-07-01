-- Enable Supabase Realtime for the items table so that household members see
-- each other's changes (inserts, updates, deletes) live, without refreshing.
--
-- Run this once against your Supabase project. Row Level Security still applies
-- to realtime, so members only receive events for households they belong to.

alter publication supabase_realtime add table public.items;

-- Default replica identity (primary key) already includes the id in DELETE
-- payloads, which is all the client needs. Uncomment the line below only if you
-- want the full previous row sent on updates/deletes.
-- alter table public.items replica identity full;
