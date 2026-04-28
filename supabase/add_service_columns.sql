ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS service_description text;
ALTER TABLE public.providers ADD COLUMN IF NOT EXISTS service_amount_clp   integer;

SELECT column_name, data_type
FROM information_schema.columns
WHERE table_schema = 'public' AND table_name = 'providers'
  AND column_name IN ('service_description','service_amount_clp');
