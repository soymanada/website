# AUDITORÍA — UX SoyManada
**Proyecto:** SoyManada | **Fecha:** 2026-03-25 | **Versión:** v1.0

---

## ROL
Diseño de experiencia de usuario, flujos de navegación, jerarquía visual y feedback de usabilidad. Valida cambios de UI antes de que lleguen al dev.

---

## DECISIONES UX TOMADAS

| Decisión | Justificación |
|---|---|
| Emojis → SVG icons en StatsSection y ValueProps | Rendering inconsistente entre plataformas |
| VerificationBadge como pill eyebrow (no seal flotante) | Seal circular sobre título rompía jerarquía visual |
| Banderas CSS (flag-icons) en ProviderCard | Emoji flags no funcionan en Windows |
| ScrollIntoView para #categorias en Hero | `/#categorias` con BrowserRouter no hace scroll |
| Login visible en drawer mobile | Usuarios mobile no podían acceder a su cuenta |
| Footer trust section centrada | Alineación izquierda rompía simetría en fondo oscuro |

---

## COMPONENTES AUDITADOS

| Componente | Estado UX |
|---|---|
| Hero | ✅ Botones alineados, hover corregido |
| StatsSection | ✅ Lucide icons, datos reales |
| CategoryGrid | ✅ SVG icons, sin emojis |
| ProviderCard | ✅ Banderas reales, botón Llamar para banca |
| ValueProps | ✅ Lucide icons, gap corregido |
| TrustBadge | ✅ Layout flex, badge integrado |
| Footer | ✅ Categorías dinámicas, trust centrado |
| Header | ✅ Nav unificado desktop+mobile |
| CategoryPage | ✅ "Antes de viajar" con CTA WhatsApp |

---

## BUGS UX ABIERTOS

| Bug | Pantalla | Estado |
|---|---|---|
| Filtro sticky superpone cards en mobile | ProvidersPage | ✅ Fix aplicado |
| Site blanco en Chrome mobile | Home | 🔄 En investigación |
| Caracteres corruptos en Admin Panel | AdminPanel | Resuelto por backend |

---

## PENDIENTES UX

- Revisar flujo completo de onboarding proveedor (registro → perfil editable)
- Definir estado vacío cuando una categoría no tiene proveedores
- Validar legibilidad de ProviderCard en dark mode (si se implementa)
- Revisar comportamiento del interstitial de 1.5s (decisión aplazada)
