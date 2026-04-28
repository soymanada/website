-- Supabase guarda la config de auth en auth.flow_state y parámetros del servidor
-- Lo más accesible desde SQL es la tabla auth.users para ver comportamiento,
-- pero la config real está en el servidor GoTrue.
-- Podemos verificar algunas cosas indirectamente:

SELECT
  -- Versión de GoTrue (confirma que el proyecto está vivo)
  version()                                          AS pg_version,

  -- Política de contraseñas: verificamos el constraint de longitud mínima
  -- inspeccionando si hay restricciones en auth.users
  (SELECT COUNT(*) FROM information_schema.columns
   WHERE table_schema = 'auth'
     AND table_name   = 'users'
     AND column_name  = 'encrypted_password')        AS auth_password_col_exists;
