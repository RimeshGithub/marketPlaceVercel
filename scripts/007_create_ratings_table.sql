-- Create ratings table
create table if not exists public.ratings (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  rating integer not null check (rating >= 1 and rating <= 5),
  comment text,
  created_at timestamp with time zone default now(),
  unique(buyer_id, product_id)
);

alter table public.ratings enable row level security;

create policy "ratings_select_all"
  on public.ratings for select
  using (true);

create policy "ratings_insert_own"
  on public.ratings for insert
  with check (auth.uid() = buyer_id);

create policy "ratings_update_own"
  on public.ratings for update
  using (auth.uid() = buyer_id);

create policy "ratings_delete_own"
  on public.ratings for delete
  using (auth.uid() = buyer_id);
