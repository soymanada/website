# AUDITORÍA — Arquitecto Dev (Claude Code)
**Proyecto:** SoyManada | **Fecha:** 2026-03-25 | **Versión:** v1.0

---

## ROL
Implementación técnica del frontend. Aplica cambios directamente en `D:/soy-manada/main`.
Sin worktrees ni branches — el usuario hace commit/push manualmente.

---

## STACK ACTUAL
- React + Vite + React Router
- GitHub Pages + dominio soymanada.com
- Supabase (auth, profiles, providers, feedback, provider_submissions)
- lucide-react (iconos UI)
- flag-icons CDN (banderas en ProviderCard)
- i18next + react-i18next (ES/EN/FR)
- react-i18next-browser-languagedetector

---

## DECISIONES TÉCNICAS TOMADAS

| Decisión | Justificación |
|---|---|
| `public/404.html` + script SPA restore | GitHub Pages no soporta SPA routing nativo |
| `CategoryIcon.jsx` con SVGs Feather inline | Sin dependencias, sin emojis inconsistentes |
| `flag-icons` via CDN | Flags reales sin npm, Windows no soporta emoji flags |
| `lucide-react` como dependencia | Iconos en StatsSection y ValueProps |
| Supabase anon key en frontend | Solo operaciones con RLS — service_role nunca en browser |
| `manualChunks` en vite.config.js | Bundle de 543KB → chunks separados por vendor |

---

## ARCHIVOS MODIFICADOS (historial relevante)

```
public/404.html                         — SPA routing fix
index.html                              — SPA restore script + OG tags + flag-icons CDN
src/utils/analytics.js                  — Events: CLICK_APPLY_PROVIDER, VIEW_CATEGORY_PAGE, CLICK_CATEGORY_CARD
src/data/categories.json                — +3 categorías: banca, salud-mental, antes-de-viajar
src/data/providers.json                 — Proveedores reales (p001–p007), sin ficticios
src/components/CategoryIcon.jsx         — SVG icons para categorías
src/components/CategoryGrid.jsx         — Usa CategoryIcon
src/components/CategoryPage.jsx         — Usa CategoryIcon + lógica "antes-de-viajar"
src/components/ProviderCard.jsx         — Banderas, PROVEEDOR_VISITADO, botón Llamar (phone)
src/components/ProviderCard.css         — Estilos banderas
src/components/Header.jsx               — navLinks unificado desktop+mobile, login en drawer
src/components/Hero.jsx                 — scrollIntoView para #categorias, fix hover btn
src/components/StatsSection.jsx         — Lucide icons, datos reales, useTranslation
src/components/ValueProps.jsx           — Lucide icons
src/components/Footer.jsx               — Dynamic categories desde JSON, trust section
src/components/Footer.css               — Columnas, trust-item layout
src/components/TrustBadge.jsx           — VerificationBadge integrado
src/components/TrustBadge.css           — .trust__left flex layout
src/components/VerificationBadge.jsx    — Componente de sello (entregado por usuario)
src/components/VerificationBadge.css    — Estilos del sello
src/components/ValueProps.css           — Gap y margin ajustados
src/styles/globals.css                  — Tipografía, breakpoints mobile
src/pages/AdminPanel.jsx                — Panel admin completo (Usuarios/Proveedores/Solicitudes)
src/pages/AdminPanel.css                — Estilos del panel
src/pages/CategoryPage.jsx              — i18n, título y oneLiner traducidos
src/lib/supabase.js                     — Cliente Supabase
src/hooks/useAuth.js                    — Auth hook con race condition fix
src/components/ProtectedRoute.jsx       — Guard por role, null-role safety
vite.config.js                          — Code splitting manual chunks
```

---

## PROVEEDORES EN PRODUCCIÓN

| ID | Nombre | Categoría | Contacto |
|---|---|---|---|
| p001 | Daniela Valenzuela | traducciones | WhatsApp |
| p002 | TripeandoVoy | seguros | WhatsApp + Web |
| p003 | Objetivo Canadá | migracion | WhatsApp |
| p004 | AV Traducciones | traducciones | WhatsApp |
| p005 | Patricia Gomez — BMO | banca | Teléfono (sin WA) |
| p006 | Terapia para migrantes | salud-mental | WhatsApp + Instagram |
| p007 | AseguraTuWH | seguros | WhatsApp + Web |

---

## BUGS ABIERTOS / PENDIENTES

| # | Problema | Estado |
|---|---|---|
| B1 | Chrome mobile muestra blanco | En investigación — probablemente bundle size |
| B2 | Caracteres UTF-8 corruptos en Supabase | Resuelto por backend, pendiente verificar |
| B3 | Filtro sticky se superpone en mobile | Fix aplicado |
| B4 | Login no visible en mobile drawer | Fix aplicado |

---

## RESTRICCIONES PERMANENTES
- NO tocar `package.json` sin justificación
- NO modificar `dist/`
- NO usar service_role key en frontend
- NO crear worktrees ni branches — trabajar en main directo
- El usuario hace commit/push manualmente

---

## SUPABASE — TABLAS CONOCIDAS

| Tabla | Políticas admin |
|---|---|
| profiles | profiles_admin_all → is_admin() |
| providers | providers_admin_all → is_admin() |
| provider_submissions | submissions_admin_all → is_admin() |
| feedback | feedback_admin_all → is_admin() |

**Admin confirmado:** manadasisoy@gmail.com (role: admin, tier: bronze)

---

## EDGE FUNCTIONS DESPLEGADAS
- `invite-user` — crea usuario con role/tier desde panel admin. Requiere JWT del admin. Responde `{ ok, user_id, email, role }`.
- `translate-provider` — trigger en INSERT/UPDATE de providers. Usa DeepL Free API para generar `_en` y `_fr`.
