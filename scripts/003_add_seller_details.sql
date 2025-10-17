-- Add seller contact details and payment method columns to products table
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_phone text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS seller_email text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS payment_methods text[] DEFAULT '{}';
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bank_name text;
ALTER TABLE public.products ADD COLUMN IF NOT EXISTS bank_account_number text;

-- Update RLS policy to allow sellers to see all their products (including sold ones)
DROP POLICY IF EXISTS "products_select_all" ON public.products;

CREATE POLICY "products_select_all"
  ON public.products FOR SELECT
  USING (status = 'active' OR auth.uid() = seller_id);
