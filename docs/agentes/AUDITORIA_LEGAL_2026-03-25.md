# AUDITORÍA — Agente Legal
**Proyecto:** SoyManada | **Fecha:** 2026-03-25 | **Versión:** v1.0 (PLANTILLA — agente pendiente de crear)

---

## ROL (propuesto)
Asesoría legal del proyecto SoyManada. Cubre aspectos de privacidad, términos de uso, responsabilidad por contenido de terceros, cumplimiento normativo en Canadá y otros países donde opera la comunidad.

---

## CONTEXTO LEGAL RELEVANTE

### Naturaleza del producto
- SoyManada es un **directorio de referencia**, no un prestador de servicios
- Conecta migrantes con proveedores verificados por la comunidad
- No intermedia en transacciones económicas
- Opera bajo dominio canadiense (.com) con audiencia en múltiples jurisdicciones

### Disclaimer actual en producción
> "SoyManada es un directorio de referencia. No presta servicios legales, migratorios ni financieros. Siempre evalúa a tu proveedor antes de contratar."

---

## TEMAS PENDIENTES DE RESOLUCIÓN LEGAL

| Tema | Urgencia | Notas |
|---|---|---|
| Página `/privacidad` | ALTA | Requerida por GDPR/PIPEDA si hay usuarios registrados |
| Página `/terminos` | ALTA | Define responsabilidad por contenido de proveedores |
| Política de datos de proveedores | ALTA | WhatsApp, Instagram y teléfonos personales publicados |
| Responsabilidad por recomendaciones | MEDIA | ¿Qué pasa si un proveedor causa daño a un usuario? |
| Cookies y tracking (GA4) | MEDIA | GDPR requiere consentimiento explícito en Europa |
| Jurisdicción aplicable | MEDIA | ¿Ley canadiense? ¿Chilena? ¿Ambas? |
| Derechos de los proveedores | MEDIA | Derecho a ser removido del directorio |
| Uso de nombre/logo de BMO | BAJA | Patricia Gomez aparece como representante BMO |

---

## PREGUNTAS CLAVE PARA EL AGENTE LEGAL

1. ¿Necesitamos consentimiento explícito para publicar los datos de contacto de los proveedores que completaron el formulario?
2. ¿El disclaimer actual es suficiente para limitar responsabilidad?
3. ¿Qué debe incluir mínimamente una política de privacidad para cumplir con PIPEDA (Canadá)?
4. ¿Hay restricciones para mencionar instituciones financieras (BMO) en directorios?
5. ¿Se requiere registro legal de la marca "SoyManada" o "Manada a Canadá"?

---

## ARCHIVOS A CREAR (cuando el agente esté activo)

```
public/privacidad.html  o  src/pages/PrivacidadPage.jsx
public/terminos.html    o  src/pages/TerminosPage.jsx
```

Rutas sugeridas: `/privacidad` y `/terminos`
Enlace desde: Footer.jsx (sección LEGAL o en copyright line)

---

## NOTAS PARA LA CREACIÓN DEL AGENTE

- Contexto: SoyManada opera para comunidad hispanohablante migrante
- Jurisdicciones primarias: Canadá (PIPEDA), Chile (Ley 19.628), UE (GDPR para usuarios europeos)
- El agente debe conocer el stack técnico básico para saber qué datos se recopilan (GA4, Supabase auth, formulario Google Forms)
- Prioridad inicial: redactar páginas de privacidad y términos en español
