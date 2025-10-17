-- Add latitude and longitude columns to products table
alter table public.products 
add column if not exists latitude decimal(10, 8),
add column if not exists longitude decimal(11, 8);

-- Create index for location queries
create index if not exists idx_products_location on public.products(latitude, longitude);
