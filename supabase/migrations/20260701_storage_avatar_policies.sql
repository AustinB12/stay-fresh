-- Storage RLS policies for the avatars/ folder within the images bucket.
-- The images bucket already exists (used for item photos). These policies
-- allow authenticated users to manage only their own avatar file.

-- Read: anyone authenticated can read any avatar (needed to display
-- other members' avatars in HouseholdManager).
create policy "Authenticated users can read avatars"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'images'
    and name like 'avatars/%'
  );

-- Upload / replace: a user may only write to avatars/{their own user id}.*
create policy "Users can upload their own avatar"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'images'
    and name like 'avatars/%'
    and (storage.filename(name) like concat(auth.uid()::text, '.%'))
  );

create policy "Users can update their own avatar"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'images'
    and name like 'avatars/%'
    and (storage.filename(name) like concat(auth.uid()::text, '.%'))
  );

create policy "Users can delete their own avatar"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'images'
    and name like 'avatars/%'
    and (storage.filename(name) like concat(auth.uid()::text, '.%'))
  );
