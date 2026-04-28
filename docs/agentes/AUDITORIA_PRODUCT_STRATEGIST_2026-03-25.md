# AUDITORÍA — Product Strategist
**Proyecto:** SoyManada | **Fecha:** 2026-03-25 | **Versión:** v1.0

---

## ROL
Define la visión del producto, prioriza features, toma decisiones sobre qué construir y en qué orden. Árbitro final entre demanda comunitaria y capacidad técnica.

---

## DECISIONES DE PRODUCTO TOMADAS

| Decisión | Fecha | Razón |
|---|---|---|
| Lanzar con datos reales mínimos (1 proveedor) | Mar 2026 | Mejor MVP honesto que directorio falso |
| Aplazar perfil individual `/proveedor/:id` | Mar 2026 | Requiere 10+ proveedores para justificarse |
| Aplazar SEO dinámico | Mar 2026 | Sin tráfico orgánico hoy, se construye en sprint 2 |
| Aplazar páginas legales | Mar 2026 | Sin señal de bloqueo para el lanzamiento |
| Mantener Supabase como backend | Mar 2026 | Free tier suficiente, PostgreSQL reversible |

---

## ROADMAP SPRINT CERO (estado)

### ✅ Resuelto
- SPA routing (404.html)
- Analytics eventos corregidos
- 3 categorías nuevas (banca, salud-mental, antes-de-viajar)
- Datos reales en providers.json
- Sistema de íconos SVG
- Banderas de países en ProviderCard
- Panel de administración /admin
- i18n ES/EN/FR

### ⏸ Aplazado post-lanzamiento
- SEO dinámico por página
- sitemap.xml
- Perfil individual `/proveedor/:id`
- Campos testimonial/benefit en ProviderCard
- Páginas legales (/privacidad, /terminos)

### 🔄 En curso
- Incorporar nuevos proveedores del formulario
- Traducción automática via DeepL Edge Function
- Panel admin funcional

---

## MÉTRICAS DE REFERENCIA (Mar 2026)
- Comunidad: +500 miembros activos en WhatsApp
- Años activos: 2 (desde nov 2024)
- Categorías: 9
- Proveedores verificados: 7

---

## PENDIENTES DE DECISIÓN

| Pregunta | Urgencia |
|---|---|
| ¿Open signup o invite-only para nuevos proveedores? | ALTA |
| ¿Cuándo habilitar perfil individual de proveedor? | MEDIA |
| ¿Implementar sistema de reviews/feedback visible? | MEDIA |
| ¿Monetización tier Silver/Gold — qué incluye cada uno? | MEDIA |
