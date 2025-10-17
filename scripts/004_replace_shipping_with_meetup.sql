-- Replace shipping_option column with meetup_location
ALTER TABLE public.products 
DROP COLUMN shipping_option,
ADD COLUMN meetup_location text;

-- Update RLS policies if needed (they remain the same)
