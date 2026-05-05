-- El frontend sube a 'provider-avatars' pero ese bucket no existía.
-- El bucket original 'avatars' es distinto. Creamos el que usa el frontend.

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'provider-avatars',
  'provider-avatars',
  true,
  2097152,  -- 2 MB
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;
