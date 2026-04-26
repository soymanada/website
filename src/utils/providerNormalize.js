export function normalizeProvider(row) {
  if (!row) return row

  const contactSource = row.contact && typeof row.contact === 'object' ? row.contact : {}
  const contact = {
    whatsapp: contactSource.whatsapp ?? row.contact_whatsapp ?? row.whatsapp ?? null,
    instagram: contactSource.instagram ?? row.contact_instagram ?? row.instagram ?? null,
    website: contactSource.website ?? row.contact_website ?? row.website ?? null,
    phone: contactSource.phone ?? row.contact_phone ?? row.phone ?? null,
  }

  return {
    ...row,
    categorySlug:   row.categorySlug   ?? row.category_slug  ?? null,
    countries:      Array.isArray(row.countries) ? row.countries : [],
    languages:      Array.isArray(row.languages) ? row.languages : [],
    contact,
    tier:           row.tier           ?? 'bronze',
    show_whatsapp:  row.show_whatsapp  ?? false,
    whatsapp_addon: row.whatsapp_addon ?? false,
  }
}

export function normalizeProviders(rows) {
  return (rows ?? []).map(normalizeProvider)
}
