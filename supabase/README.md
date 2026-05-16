# Supabase Setup

Run `migrations/001_private_galleries.sql` in the Supabase SQL editor.

After creating your first Supabase Auth admin user, add it to `admin_users`:

```sql
insert into public.admin_users (user_id)
values ('YOUR_AUTH_USER_ID');
```

Storage bucket:

```txt
client-galleries
```

Private file layout:

```txt
client-galleries/{gallery_slug}/originals/
client-galleries/{gallery_slug}/thumbs/
```

PINs must be hashed server-side before inserting into `clients.pin_hash`.
