-- Create profiles table (extends auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- Create products table
create table if not exists public.products (
  id uuid primary key default gen_random_uuid(),
  seller_id uuid not null references public.profiles(id) on delete cascade,
  title text not null,
  description text not null,
  price decimal(10, 2) not null,
  category text not null,
  condition text not null,
  shipping_option text not null,
  images text[] not null default '{}',
  status text not null default 'active',
  created_at timestamp with time zone default now(),
  updated_at timestamp with time zone default now()
);

alter table public.products enable row level security;

create policy "products_select_all"
  on public.products for select
  using (status = 'active');

create policy "products_insert_own"
  on public.products for insert
  with check (auth.uid() = seller_id);

create policy "products_update_own"
  on public.products for update
  using (auth.uid() = seller_id);

create policy "products_delete_own"
  on public.products for delete
  using (auth.uid() = seller_id);

-- Create cart table
create table if not exists public.cart_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null default 1,
  created_at timestamp with time zone default now(),
  unique(user_id, product_id)
);

alter table public.cart_items enable row level security;

create policy "cart_items_select_own"
  on public.cart_items for select
  using (auth.uid() = user_id);

create policy "cart_items_insert_own"
  on public.cart_items for insert
  with check (auth.uid() = user_id);

create policy "cart_items_update_own"
  on public.cart_items for update
  using (auth.uid() = user_id);

create policy "cart_items_delete_own"
  on public.cart_items for delete
  using (auth.uid() = user_id);

-- Create orders table
create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  buyer_id uuid not null references public.profiles(id) on delete cascade,
  seller_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid not null references public.products(id) on delete cascade,
  quantity integer not null,
  total_price decimal(10, 2) not null,
  status text not null default 'pending',
  shipping_address text not null,
  created_at timestamp with time zone default now()
);

alter table public.orders enable row level security;

create policy "orders_select_own"
  on public.orders for select
  using (auth.uid() = buyer_id or auth.uid() = seller_id);

create policy "orders_insert_buyer"
  on public.orders for insert
  with check (auth.uid() = buyer_id);

create policy "orders_update_seller"
  on public.orders for update
  using (auth.uid() = seller_id);

-- Create messages table
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  sender_id uuid not null references public.profiles(id) on delete cascade,
  receiver_id uuid not null references public.profiles(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  content text not null,
  read boolean not null default false,
  created_at timestamp with time zone default now()
);

alter table public.messages enable row level security;

create policy "messages_select_own"
  on public.messages for select
  using (auth.uid() = sender_id or auth.uid() = receiver_id);

create policy "messages_insert_own"
  on public.messages for insert
  with check (auth.uid() = sender_id);

create policy "messages_update_receiver"
  on public.messages for update
  using (auth.uid() = receiver_id);
