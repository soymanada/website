# ✦ SoyManada — v2 "Iris & Ivory"

> El directorio de confianza para la comunidad migrante.  
> ADN visual: Iris Purple + Warm Ivory · Playfair Display + Plus Jakarta Sans

---

## 🚀 Instalación y ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Correr en local
npm run dev
# → http://localhost:5173/soy-manada/

# 3. Build
npm run build

# 4. Deploy a GitHub Pages
npm run deploy
```

> En `vite.config.js`, cambia `base: '/soy-manada/'` por tu nombre real de repositorio.  
> Si usas dominio propio, usa `base: '/'`.

---

## ✏️ Editar contenido

### Categorías → `src/data/categories.json`
```json
{ "slug": "nueva", "name": "Nueva cat.", "oneLiner": "Descripción.", "icon": "🔧", "order": 7 }
```

### Proveedores → `src/data/providers.json`
```json
{
  "id": "p013",
  "name": "Nombre",
  "categorySlug": "seguros",
  "service": "Tipo de servicio",
  "description": "Descripción.",
  "countries": ["Chile"],
  "languages": ["Español"],
  "verified": true,
  "contact": { "whatsapp": "56912345678", "instagram": "usuario", "website": null },
  "disclaimerTag": null
}
```

### Paleta → `src/styles/globals.css` (variables CSS `:root`)
```css
--iris-500: #7B4DC8;   /* Primary purple */
--ivory:    #FAF8F4;   /* Background */
```

### Textos → edita directamente en los `.jsx` de `src/components/` y `src/pages/`

---

## 📊 Analítica

Descomenta en `index.html` + `src/utils/analytics.js`:
- **Plausible** (recomendado, privacy-first)
- **Google Analytics 4**

Eventos listos: `click_whatsapp`, `click_instagram`, `click_category_card`, `view_category_page`, `click_apply_provider`, `scroll_50/75/100`

---

## 🔁 Cómo seguir iterando

**Producto inmediato**
1. Conectar el formulario de proveedores a Google Forms / Typeform real
2. Filtro por país dentro de categoría (dropdown simple, solo JS)
3. Buscador de texto libre sobre nombre/servicio

**Visual**
- Agregar foto real en hero (reemplazar card mock)
- Scroll-triggered animations con IntersectionObserver
- Dark mode (tokens CSS ya listos para ello)

**Técnico**
- Migrar datos a Notion API o Airtable para edición sin código
- Astro para SSG si el SEO se vuelve prioridad
- i18n (inglés, portugués)
