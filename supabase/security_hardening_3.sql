-- ═══════════════════════════════════════════════════════════════
-- SoyManada · Security Hardening — Parte 3
-- Cierre de las 3 alertas del advisor
-- ═══════════════════════════════════════════════════════════════


-- ────────────────────────────────────────────────────────────────
-- A.  provider_applications — limpiar política INSERT duplicada
-- ────────────────────────────────────────────────────────────────
-- Existen "Public can submit applications" e "insert_public",
-- ambas idénticas (roles=public, WITH CHECK true).
-- Se elimina insert_public; queda solo la nombrada.

DROP POLICY IF EXISTS "insert_public" ON public.provider_applications;


-- ────────────────────────────────────────────────────────────────
-- B.  Bucket avatars — quitar SELECT policy de listado
-- ────────────────────────────────────────────────────────────────
-- El bucket es PUBLIC → los archivos son accesibles por URL directa
-- sin ninguna RLS policy. La policy "Public avatar read" solo sirve
-- para permitir storage.list(), exponiendo todos los paths.
-- Al quitarla, las URLs públicas siguen funcionando igual.

DROP POLICY IF EXISTS "Public avatar read" ON storage.objects;


-- ────────────────────────────────────────────────────────────────
-- C.  SECURITY DEFINER functions — revocar EXECUTE donde no aplica
-- ────────────────────────────────────────────────────────────────

-- C.1  Funciones de trigger / event_trigger
--      PostgREST no las expone via RPC (no retornan tipo llamable),
--      pero el advisor las marca igualmente. Revocamos para silenciar
--      la alerta y aplicar defensa en profundidad.
--      Los triggers siguen disparándose: se ejecutan en contexto
--      de trigger, no como llamada directa de roles de cliente.

REVOKE EXECUTE ON FUNCTION public.check_pilot_opinion_limit()      FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_first_login()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_message()             FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user()                FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.link_provider_on_signup()        FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_notify_admin()           FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.trigger_translate_provider()     FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.rls_auto_enable()                FROM PUBLIC, anon, authenticated;

-- C.2  get_user_id_by_email — email enumeration (crítico)
--      AdminPanel.jsx la llama con usuario autenticado → mantener
--      para authenticated. Revocar de anon y PUBLIC.

REVOKE EXECUTE ON FUNCTION public.get_user_id_by_email(text)       FROM PUBLIC, anon;

-- C.3  send_or_reply_message — prevenir spam desde anon
--      Solo usuarios autenticados deben enviar mensajes.

REVOKE EXECUTE ON FUNCTION public.send_or_reply_message(uuid, text, text)  FROM PUBLIC, anon;

-- C.4  is_admin — llamable por anon via RPC (retorna false, bajo riesgo)
--      Antes de revocar de anon hay que arreglar events_admin_all
--      que aplica a {public} y llama is_admin() en su USING clause.
--      Si anon no tuviera EXECUTE, esa evaluación lanzaría error.
--      Fix: mover events_admin_all a rol authenticated únicamente.

DROP POLICY IF EXISTS "events_admin_all" ON public.events;
CREATE POLICY "events_admin_all"
  ON public.events
  FOR ALL
  TO authenticated
  USING    (is_admin())
  WITH CHECK (is_admin());

-- Ahora sí se puede revocar de anon y PUBLIC.
REVOKE EXECUTE ON FUNCTION public.is_admin()                       FROM PUBLIC, anon;


-- ────────────────────────────────────────────────────────────────
-- Verificación
-- ────────────────────────────────────────────────────────────────
SELECT
  -- A: solo 1 INSERT policy en provider_applications
  (SELECT count(*) FROM pg_policies
   WHERE schemaname = 'public'
     AND tablename  = 'provider_applications'
     AND cmd        = 'INSERT')                          AS app_insert_policies,  -- debe ser 2 (hay "Public can submit applications" + ninguna más)

  -- B: "Public avatar read" eliminada
  NOT EXISTS (
    SELECT 1 FROM pg_policies
    WHERE schemaname = 'storage'
      AND tablename  = 'objects'
      AND policyname = 'Public avatar read'
  )                                                      AS avatar_listing_closed,

  -- C: funciones críticas ya no tienen anon en ACL
  (SELECT proacl FROM pg_proc
   WHERE proname = 'get_user_id_by_email'
     AND pronamespace = 'public'::regnamespace)          AS get_uid_acl,

  (SELECT proacl FROM pg_proc
   WHERE proname = 'is_admin'
     AND pronamespace = 'public'::regnamespace)          AS is_admin_acl,

  (SELECT proacl FROM pg_proc
   WHERE proname = 'send_or_reply_message'
     AND pronamespace = 'public'::regnamespace)          AS send_msg_acl;
