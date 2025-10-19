-- Create wishlist table
create table if not exists public.wishlist (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

alter table public.wishlist enable row level security;

create policy "wishlist_select_own"
  on public.wishlist for select
  using (auth.uid() = user_id);

create policy "wishlist_insert_own"
  on public.wishlist for insert
  with check (auth.uid() = user_id);

create policy "wishlist_delete_own"
  on public.wishlist for delete
  using (auth.uid() = user_id);
