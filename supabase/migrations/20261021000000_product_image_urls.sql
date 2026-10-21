ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS image_urls jsonb NOT NULL DEFAULT '[]'::jsonb;

UPDATE public.products
SET image_urls = jsonb_build_array(image_url)
WHERE image_url IS NOT NULL
  AND image_url <> ''
  AND (image_urls IS NULL OR image_urls = '[]'::jsonb);
