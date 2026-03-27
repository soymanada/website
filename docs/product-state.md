# SoyManada — Estado del producto (para agente de producto IA)
Fecha: 2026-03-27 | URL: soymanada.com | Stack: React + Vite + Supabase + GitHub Pages

---

## QUÉ ES

Directorio verificado de proveedores de servicios para la comunidad migrante hispanohablante. Conecta migrantes con profesionales de confianza (seguros, migración, traducciones, taxes, etc.) mediante contacto directo por WhatsApp o Instagram. Sin intermediarios, sin comisiones.

Modelo de negocio: freemium para proveedores (Bronze gratis / Silver $10 USD/mes / Gold $20 USD/mes). Los migrantes siempre acceden gratis.

---

## USUARIOS

### Tipo A: Migrante
- Busca servicios confiables en su país de destino
- Filtra por categoría, busca por texto
- Ve tarjetas de proveedores con nombre, servicio, países atendidos, descripción
- Para ver datos de contacto (WhatsApp/Instagram) debe registrarse (gate de autenticación)
- Puede dejar reseñas y ratings (mínimo 3 reseñas para que sean visibles públicamente)
- Acceso: gratis siempre

### Tipo B: Proveedor
- Profesional o negocio que atiende migrantes hispanohablantes
- Postula a través del formulario en /registro-proveedores
- Administrador revisa y activa su perfil manualmente
- Puede gestionar su perfil desde /mi-perfil (panel de proveedor)
- Acceso a features según plan: Bronze (gratis), Silver ($10/mes), Gold ($20/mes)

### Tipo C: Administrador (interno SoyManada)
- Accede a /admin
- Gestiona proveedores: verificar, activar/desactivar, editar datos, agregar nuevos
- Ve postulaciones (tabla provider_applications en Supabase, aún sin UI en AdminPanel)

---

## PÁGINAS Y FLUJOS

### / (Home)
Secciones en orden:
1. Hero — título principal, CTA "Explorar proveedores" + "Ver categorías"
2. Stats — número de miembros, años acompañando, categorías activas, proveedores verificados (valores hardcodeados por ahora)
3. ValueProps — 3 propuestas de valor (comunidad, contacto directo, organización)
4. CategoryGrid — grid de categorías con íconos SVG, filtra por "isHot"
5. HowItWorks — 3 pasos con SVGs: buscar categoría → revisar proveedor → contactar directo
6. CTASection — CTA para proveedores con perks
7. Footer — links a categorías + comunidad + legal

### /proveedores (Directorio)
- Hero con buscador de texto (busca en nombre, servicio, descripción)
- Panel de filtros lateral: categoría (botones con ícono)
- Grid de ProviderCards
- Si 0 resultados: mensaje "no encontramos" + botón limpiar filtros
- CTA al final: "¿Eres proveedor? Aparecer en el directorio" → link a /registro-proveedores
- Datos: actualmente desde providers.json (estático), en proceso de migración a Supabase

### /categoria/:slug (Categoría específica)
Categorías disponibles (10):
- seguros, migracion, traducciones, trabajo, alojamiento, idiomas, banca, salud-mental, taxes, antes-de-viajar
- "antes-de-viajar" tiene comingSoon: true → muestra estado "próximamente" con link a WhatsApp group
- Muestra: ícono SVG + título + oneLiner + contador de providers + contador de verificados
- Grid de ProviderCards filtradas por categorySlug
- Si 0 providers: empty state "Providers coming soon"

### /registro-proveedores (Postulación de proveedor)
Formulario nativo (reemplazó Google Form). Secciones:
1. Información del negocio: nombre, servicio (5 palabras), categorías (multi-check), descripción
2. Detalles: idiomas (multi-check), países (multi-check), modalidad (radio: presencial/online/ambos)
3. Contacto público: WhatsApp (requerido), Instagram (opcional), web (opcional), link verificación (requerido)
4. Datos internos: nombre contacto, email (no se publican)
5. Términos y condiciones
Submit → INSERT en tabla provider_applications (Supabase). Estado: "pending". Admin revisa y activa manualmente.
NOTA: tabla provider_applications puede no estar creada aún en Supabase (error en producción al enviar).

### /login
- Tabs: Ingresar / Registrarse
- Auth vía Supabase (email + password)
- Redirección post-login según rol: proveedor → /mi-perfil, migrante → /proveedores
- También: link a "Olvidé mi contraseña" → /reset-password

### /reset-password
- Formulario de recuperación de contraseña
- Usa token de Supabase via email

### /mi-perfil (Panel del proveedor) — requiere auth + rol proveedor
Tabs:
1. Mi Perfil — editar nombre, servicio, descripción, países, idiomas, WhatsApp, Instagram, links especiales (Gold)
2. Recomendaciones — AutoRecommendations: suggestions generadas por IA (feature parcialmente implementado)
3. Estadísticas — (feature en desarrollo)
4. Mi Plan — tabla comparativa de 3 tiers con precios, botón upgrade

Tiers:
- Bronze: gratis, perfil básico, badge verificado manual
- Silver: $10 USD/mes ($9.500 CLP), badge prioritario, métricas básicas
- Gold: $20 USD/mes ($19.000 CLP), calendario Calendly, link de pago Wise, email directo, descripción larga, top 3 garantizado (no implementado aún), analytics (no implementado aún)

### /admin (Panel de administrador) — requiere auth + rol admin
Funcionalidades:
- Lista todos los proveedores desde Supabase
- Por cada proveedor: botón Verificar/Desverificar (toggle verified), botón Activar/Desactivar (toggle active)
- Formulario para agregar nuevo proveedor manualmente (nombre, servicio, categoría, WhatsApp, países, idiomas, Instagram, web)
- Los proveedores con active: false no aparecen en el directorio
- Los proveedores con verified: true muestran badge "VERIFICADO por Manada"
- FALTANTE: vista de postulaciones (provider_applications) — aún no tiene UI en AdminPanel

### /planes (Pricing)
- Tabla comparativa de 3 planes con features por fila
- Precios: Bronze gratis / Silver $10 USD / Gold $20 USD
- CTA: "Enviar mi solicitud" → link a /registro-proveedores
- Nota al pie con equivalencias en CLP

---

## COMPONENTES CLAVE

### ProviderCard
- Muestra: nombre proveedor, subtítulo de servicio, flags de países atendidos, descripción, rating (si ≥3 reseñas)
- Badge "VERIFICADO por Manada" (círculo morado + checkmark) si verified: true
- Huella de pata como marca de agua en esquina superior derecha (sutil, 7% opacidad)
- Gate de contacto: si usuario no logueado → muestra "Regístrate para ver contacto" en lugar de botones
- Si logueado: botones WhatsApp (verde), teléfono, Instagram según disponibilidad
- Botón "Evaluar proveedor" (reseña) si logueado — deshabilitado si ya dejó reseña

### VerificationBadge
- Variante "pill": inline en cards (círculo morado + ✓ + texto "VERIFICADO por Manada")
- Variante "seal": protagonista en secciones de trust (no usado actualmente en producción)

### Header
- Logo: pata SVG + "SoyManada" (cuando idioma ≠ ES, aparece sub-texto con nombre comercial del idioma)
- Nav: links a todas las categorías (horizontal en desktop, drawer en mobile)
- Botones: "Soy proveedor" → /registro-proveedores, "Ingresar" → /login
- Si autenticado: avatar con inicial del usuario (link a /mi-perfil o /proveedores según rol)
- Language switcher: ES / EN / FR

### Footer
- 3 columnas: brand + tagline, categorías (dinámicas desde categories.json), comunidad
- Links: Soy proveedor, Planes y precios, Grupo WhatsApp
- Copyright + disclaimer legal

---

## INTERNACIONALIZACIÓN (i18n)

- 3 idiomas: ES (español — base), EN (inglés), FR-CA (francés canadiense)
- Librería: react-i18next, archivos en /public/locales/{es,en,fr-CA}/translation.json
- Nombre de marca por idioma: ES → SoyManada, EN → MyPack, FR → MonTroupeau
- Categorías traducidas: nombres y oneliners en los 3 idiomas
- RegistroProveedoresPage: formulario solo en español (sin i18n en campos del form)
- AdminPanel: sin i18n (solo español)

---

## BASE DE DATOS (Supabase)

### Tablas activas:
- providers: id, name, service, description, category_slug, countries[], languages[], contact{whatsapp,instagram,phone,website,calendar_link,redirect_email,payment_link}, verified, active, tier, translations{en{...},fr-CA{...}}
- reviews: id, provider_id (TEXT), user_id (UUID), rating (1-5), comment, created_at
- events: provider_id, event_type (view | contact_click), created_at

### Tablas pendientes de creación:
- provider_applications: formulario de postulación (SQL en /supabase/create_provider_applications.sql)

### Datos actuales:
- Proveedores: datos en providers.json (estático) + algunos en Supabase. En proceso de migración completa a Supabase.
- provider_id en reviews es TEXT (se corrigió de UUID → TEXT via migración SQL)

### RLS (Row Level Security):
- providers: lectura pública si active: true. Escritura solo autenticados.
- reviews: lectura pública si ≥3 por proveedor. Escritura solo autenticados.
- provider_applications: insert público (formulario). Lectura solo autenticados.

---

## FEATURES IMPLEMENTADOS ✓

- Directorio público con búsqueda y filtros por categoría
- Sistema de verificación manual de proveedores
- Gate de autenticación para ver contactos
- Sistema de reseñas con rating (1-5 patas) y umbral de visibilidad
- Panel de proveedor con editor de perfil
- Panel de administrador con toggle verificado + toggle activo
- Tabla de precios comparativa en /planes y dentro del panel proveedor
- Formulario nativo de postulación (reemplaza Google Form)
- Multilenguaje ES/EN/FR
- Nombre de marca por idioma en logo
- Categorías: 10 slugs con íconos SVG propios
- Huella de pata como identidad visual en toda la marca

---

## FEATURES ANUNCIADOS PERO NO IMPLEMENTADOS ✗

- "Top 3 garantizado" (Gold): mencionado en pricing, no hay lógica de ordering
- Analytics de perfil (Gold): mencionado, no hay UI ni datos
- AutoRecommendations: componente existe pero lógica de IA no completa
- Vista de postulaciones en AdminPanel: tabla en Supabase pero sin UI para revisión
- Estadísticas tab en panel de proveedor: tab existe, sin datos reales
- Contacto por teléfono directo: field existe en schema, raramente usado por proveedores
- Traducción del formulario de postulación a EN/FR

---

## INCONSISTENCIAS CONOCIDAS

- Stats en home (miembros, años, categorías) son valores hardcodeados, no dinámicos
- "Miles de migrantes" en copy pero contador muestra números bajos reales
- providers.json (estático) y tabla providers (Supabase) coexisten → duplicación de datos
- AdminPanel no tiene vista de postulaciones aunque ya se reciben en Supabase
- Formulario de postulación puede fallar si tabla provider_applications no está creada en Supabase
- Categoría "antes-de-viajar" marcada como comingSoon pero aparece en nav y footer
- AutoRecommendations en panel de proveedor: muestra estado vacío sin explicación clara
- No hay flujo de pago implementado para Silver/Gold (solo descripción de planes)
- No hay emails transaccionales (confirmación de postulación, bienvenida al activar proveedor)

---

## FLUJO CRÍTICO DE ACTIVACIÓN DE PROVEEDOR (actual)

1. Proveedor llena formulario en /registro-proveedores
2. Datos van a tabla provider_applications con status: "pending"
3. Admin ve en Supabase (sin UI dedicada) → copia datos manualmente al AdminPanel
4. Admin agrega proveedor vía formulario en /admin con active: false
5. Admin revisa, activa con botón "Activar"
6. Proveedor aparece en directorio
PROBLEMA: pasos 3-4 son manuales y propensos a error. No hay notificación al proveedor.

---

## MÉTRICAS ACTUALES (aproximadas)

- Proveedores en directorio: ~2-5 activos
- Categorías con providers: traducciones, salud-mental, posiblemente seguros
- Categorías vacías: taxes, antes-de-viajar, alojamiento, idiomas, trabajo (probablemente)
- Usuarios registrados: desconocido (no visible en UI)
- Reseñas: pocas (umbral de 3 no se ha alcanzado en mayoría de categorías)
