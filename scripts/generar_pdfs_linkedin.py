#!/usr/bin/env python3
"""
SoyManada — LinkedIn Carousel PDFs v2
Agrega una slide extra "Cómo funciona" y corrige problemas de caracteres
Genera:
  - output/soymanada-linkedin-post1-es-v2.pdf
  - output/soymanada-linkedin-post1-en-v2.pdf
Requiere: pip install reportlab
Uso: python scripts/generar_pdfs_linkedin.py
"""

import os
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.colors import HexColor

os.makedirs("output", exist_ok=True)

W, H = 1080, 1080
IRIS  = HexColor("#7B4DC8")
WHITE = HexColor("#FFFFFF")
GRAY  = HexColor("#6B7280")
LILAC = HexColor("#C4B5FD")
SOFT  = HexColor("#A78BFA")
AMBER = HexColor("#F59E0B")
BASE  = "https://soymanada.com"

CATEGORIES = [
    ("Seguros",        "seguros",         True),
    ("Asesoria migr.", "migracion",       False),
    ("Traducciones",   "traducciones",    False),
    ("Trabajo",        "trabajo",         False),
    ("Alojamiento",    "alojamiento",     False),
    ("Idiomas",        "idiomas",         False),
    ("Banca",          "banca",           True),
    ("Bienestar",      "salud-mental",    False),
    ("Taxes",          "taxes",           True),
    ("Antes de viajar", "antes-de-viajar", True),
    ("Comunidad",      "comunidad",       False),
    ("Remesas",        "remesas",         True),
]

def bg(c, top, bot):
    r1,g1,b1 = top.red,top.green,top.blue
    r2,g2,b2 = bot.red,bot.green,bot.blue
    steps = 50
    sh = H / steps
    for i in range(steps):
        t = i / steps
        c.setFillColorRGB(r1 + (r2-r1)*t, g1 + (g2-g1)*t, b1 + (b2-b1)*t)
        c.rect(0, H-(i+1)*sh, W, sh+1, fill=1, stroke=0)

def txt(c, s, x, y, size=24, color=WHITE, bold=False, align="left"):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    if align == "center":
        c.drawCentredString(x, y, s)
    elif align == "right":
        c.drawRightString(x, y, s)
    else:
        c.drawString(x, y, s)

def lh(c, x, y, w, color=IRIS, t=2):
    c.setStrokeColor(color)
    c.setLineWidth(t)
    c.line(x, y, x+w, y)

def pill(c, x, y, w, h, bg_color, label, fg=WHITE, size=18, url=None, radius=10):
    c.setFillColor(bg_color)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont("Helvetica-Bold", size)
    c.drawCentredString(x+w/2, y+h/2-size*0.35, label)
    if url:
        c.linkURL(url, (x, y, x+w, y+h))

def card_bg(c, x, y, w, h, alpha=0.06, radius=12, color=WHITE):
    c.setFillColor(color)
    c.setFillAlpha(alpha)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=0)
    c.setFillAlpha(1.0)

def footer(c):
    lh(c, 60, 58, W-120, HexColor("#2D2D4A"), 1)
    txt(c, "soymanada.com", 60, 28, size=20, color=SOFT)
    c.linkURL(BASE, (60, 18, 280, 48))

def pn(c, n, total):
    txt(c, f"{n:02d} / {total:02d}", W-120, H-72, size=18, color=GRAY)

def badge(c, x, y, label, bg_color=None, fg=WHITE, size=17, pad=13, radius=9):
    if bg_color is None:
        bg_color = IRIS
    ww = c.stringWidth(label, "Helvetica-Bold", size) + pad*2
    c.setFillColor(bg_color)
    c.roundRect(x, y, ww, size+pad, radius, fill=1, stroke=0)
    c.setFillColor(fg)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x+pad, y+pad*0.5, label)
    return ww

def draw_cover(c, data, lang):
    bg(c, HexColor("#0F0F1A"), HexColor("#1E1040"))
    c.setFillColor(WHITE)
    c.setFillAlpha(0.04)
    for xi in range(0, W, 60):
        for yi in range(0, H, 60):
            c.circle(xi, yi, 1.5, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    c.setFillColor(IRIS)
    c.setFillAlpha(0.12)
    c.circle(W*0.85, H*0.72, 280, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    badge(c, 60, H-100, data["tag"])
    badge(c, W-230, H-100, f"{data['total']} slides", bg_color=HexColor("#FFFFFF18"), fg=WHITE, size=17, pad=13)
    y = H-220
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 72)
    for i, ln in enumerate(data["title"].split("\n")):
        c.drawString(60, y-i*85, ln)
    y2 = y - len(data["title"].split("\n"))*85 - 30
    c.setFillColor(LILAC)
    c.setFont("Helvetica", 30)
    for i, ln in enumerate(data["sub"].split("\n")):
        c.drawString(60, y2-i*42, ln)
    lh(c, 60, 160, 500, IRIS, 2)
    txt(c, "soymanada.com", 60, 110, size=28, color=SOFT, bold=True)
    c.linkURL(BASE, (60, 90, 320, 130))
    swipe = "desliza ->" if lang == "es" else "swipe ->"
    txt(c, swipe, W-240, 110, size=22, color=GRAY)
    txt(c, "01 / "+f"{data['total']:02d}", W-140, 40, size=18, color=HexColor("#4B5563"))

def draw_phase(c, sdata, pn_val, total, lang):
    bg(c, HexColor("#0F0F1A"), HexColor("#1A1035"))
    c.setFillColor(WHITE)
    c.setFillAlpha(0.03)
    c.setFont("Helvetica-Bold", 380)
    c.drawString(-20, H//2-190, sdata["num"])
    c.setFillAlpha(1.0)
    label = "Fase" if lang == "es" else "Phase"
    badge(c, 60, H-90, f"{label} {sdata['num']}")
    pn(c, pn_val, total)
    txt(c, sdata["label"], 60, H-160, size=52, bold=True)
    lh(c, 60, H-178, W-120, IRIS, 2)
    badge(c, W-260, H-162, sdata["badge"], bg_color=HexColor("#312E81"), fg=LILAC, size=17, pad=14)
    y0 = H-240
    for i, item in enumerate(sdata["items"]):
        y = y0 - i*92
        card_bg(c, 52, y-14, W-104, 72, alpha=0.05, radius=10)
        c.setFillColor(IRIS)
        c.circle(82, y+22, 6, fill=1, stroke=0)
        txt(c, item, 102, y+12, size=27)
    footer(c)

def draw_how(c, pn_val, total, lang):
    bg(c, HexColor("#0F0F1A"), HexColor("#160D2E"))
    c.setFillColor(IRIS)
    c.setFillAlpha(0.08)
    c.circle(W*0.9, H*0.1, 260, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    title = "Como funciona" if lang == "es" else "How it works"
    txt(c, title, 60, H-90, size=48, bold=True)
    lh(c, 60, H-112, W-120, IRIS, 3)
    pn(c, pn_val, total)
    col_w = (W-160)//2
    mx = 60
    px = 80 + col_w
    badge(c, mx, H-168, "Migrante" if lang == "es" else "Migrant", bg_color=HexColor("#312E81"), fg=LILAC, size=18, pad=14)
    badge(c, mx, H-208, "Gratis" if lang == "es" else "Free", bg_color=HexColor("#14532D"), fg=HexColor("#86EFAC"), size=14, pad=10)
    mig_steps = [
        ("1", "Escanea el QR" if lang == "es" else "Scan the QR", "o entra a soymanada.com" if lang == "es" else "or go to soymanada.com"),
        ("2", "Recibe un magic link" if lang == "es" else "Receive a magic link", "al correo - sin contrasena" if lang == "es" else "to your email - no password"),
        ("3", "Explora categorias" if lang == "es" else "Explore categories", "12 servicios para migrantes" if lang == "es" else "12 services for migrants"),
        ("4", "Contacta al proveedor" if lang == "es" else "Contact the provider", "perfil verificado + resenas" if lang == "es" else "verified profile + reviews"),
    ]
    y0 = H-280
    for i, (num, step, sub) in enumerate(mig_steps):
        y = y0 - i*148
        card_bg(c, mx, y-100, col_w, 112, alpha=0.06, radius=14)
        c.setFillColor(IRIS)
        c.circle(mx+36, y-44, 26, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(mx+36, y-52, num)
        txt(c, step, mx+78, y-34, size=22, bold=True)
        txt(c, sub, mx+78, y-62, size=17, color=GRAY)
    pill(c, mx, y0-4*148-10, col_w, 52, IRIS, "Registrate gratis ->" if lang == "es" else "Register free ->", size=20, url=BASE, radius=12)
    badge(c, px, H-168, "Proveedor" if lang == "es" else "Provider", bg_color=HexColor("#1E3A8A"), fg=SOFT, size=18, pad=14)
    badge(c, px, H-208, "Por invitacion" if lang == "es" else "Invite-only", bg_color=HexColor("#451A03"), fg=AMBER, size=14, pad=10)
    prov_steps = [
        ("1", "Solicita tu acceso" if lang == "es" else "Request access", "proceso de aprobacion manual" if lang == "es" else "manual approval process"),
        ("2", "Completa tu perfil" if lang == "es" else "Complete your profile", "especialidad, contacto, fotos" if lang == "es" else "specialty, contact, photos"),
        ("3", "Apareces en el dir." if lang == "es" else "Appear in directory", "con badge de verificacion" if lang == "es" else "with verification badge"),
        ("4", "Recibe consultas" if lang == "es" else "Receive inquiries", "directo desde la plataforma" if lang == "es" else "directly from the platform"),
    ]
    for i, (num, step, sub) in enumerate(prov_steps):
        y = y0 - i*148
        card_bg(c, px, y-100, col_w, 112, alpha=0.06, radius=14)
        c.setFillColor(HexColor("#1E3A8A"))
        c.circle(px+36, y-44, 26, fill=1, stroke=0)
        c.setFillColor(WHITE)
        c.setFont("Helvetica-Bold", 22)
        c.drawCentredString(px+36, y-52, num)
        txt(c, step, px+78, y-34, size=22, bold=True)
        txt(c, sub, px+78, y-62, size=17, color=GRAY)
    pill(c, px, y0-4*148-10, col_w, 52, HexColor("#1E3A8A"), "Quiero ser proveedor ->" if lang == "es" else "Become a provider ->", fg=WHITE, size=20, url=f"{BASE}/proveedores", radius=12)
    cy_base = y0-4*148-90
    txt(c, "Categorias disponibles:" if lang == "es" else "Available categories:", 60, cy_base, size=22, color=LILAC, bold=True)
    cw_cat = (W-120-11*8)//12
    for idx, (name, slug, hot) in enumerate(CATEGORIES):
        cx = 60 + idx*(cw_cat+8)
        cy = cy_base-58
        card_bg(c, cx, cy, cw_cat, 46, alpha=0.07, radius=8, color=AMBER if hot else WHITE)
        txt_color = HexColor("#1A1A1A") if hot else WHITE
        short = name[:9] if len(name) > 9 else name
        txt(c, short, cx+cw_cat//2, cy+14, size=13, color=txt_color, align="center")
        c.linkURL(f"{BASE}/categoria/{slug}", (cx, cy, cx+cw_cat, cy+46))
    footer(c)

def draw_stack(c, sdata, pn_val, total, lang):
    bg(c, HexColor("#0F0F1A"), HexColor("#0D1F3C"))
    txt(c, sdata["title"], 60, H-90, size=44, bold=True)
    lh(c, 60, H-108, W-120, IRIS, 3)
    pn(c, pn_val, total)
    col_w = (W-140)//2
    y0 = H-180
    rh = 116
    for i, (cat, tech) in enumerate(sdata["items"]):
        col = i % 2
        row = i // 2
        x = 60 + col*(col_w+20)
        y = y0 - row*rh
        card_bg(c, x, y-72, col_w-10, 84, alpha=0.05, radius=12)
        c.setFillColor(IRIS)
        c.roundRect(x, y-72, 4, 84, 2, fill=1, stroke=0)
        txt(c, cat, x+18, y-14, size=22, color=SOFT, bold=True)
        txt(c, tech, x+18, y-44, size=18, color=HexColor("#D1D5DB"))
    footer(c)

def draw_cta(c, sdata, pn_val, total, lang):
    bg(c, HexColor("#4C1D95"), HexColor("#1E1040"))
    c.setFillColor(WHITE)
    c.setFillAlpha(0.05)
    c.circle(W*0.8, H*0.3, 320, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    pn(c, pn_val, total)
    y = H-200
    c.setFillColor(WHITE)
    c.setFont("Helvetica-Bold", 68)
    lines = sdata["headline"].split("\n")
    for i, ln in enumerate(lines):
        c.drawString(60, y-i*80, ln)
    y2 = y - len(lines)*80 - 30
    c.setFillColor(LILAC)
    c.setFont("Helvetica", 28)
    for i, ln in enumerate(sdata["sub"].split("\n")):
        c.drawString(60, y2-i*40, ln)
    c.setFillColor(WHITE)
    c.roundRect(60, 220, 440, 68, 12, fill=1, stroke=0)
    c.setFillColor(IRIS)
    c.setFont("Helvetica-Bold", 28)
    c.drawString(80, 242, sdata["btn"])
    c.linkURL(sdata["url"], (60, 220, 500, 288))
    txt(c, sdata["hashtags"], 60, 150, size=20, color=HexColor("#7C3AED"))
    lh(c, 60, 58, W-120, HexColor("#3B1F7A"), 1)
    txt(c, "soymanada.com", 60, 28, size=20, color=SOFT)
    c.linkURL(BASE, (60, 18, 280, 48))

CONTENT = {
    "es": {
        "tag": "Build en publico",
        "title": "Construi un\ndirectorio de\nservicios en\n3 semanas",
        "sub": "Con React + Supabase + IA\nCon cero presupuesto de infra",
        "slides": [
            ("phase", {"num":"01","label":"Base tecnica","badge":"Auth + DB","items":["Auth magic link - sin contrasenas","Invite-only para proveedores","RLS policies en Supabase","Auto-profile trigger en PostgreSQL","React 18 + Vite 5 + React Router 6"]}),
            ("phase", {"num":"02","label":"Producto visible","badge":"Frontend","items":["Grid de categorias con iconos SVG custom","TrustBadge - verificacion visible primero","Perfiles de proveedor con DiceBear avatars","Panel admin con aprobacion manual","GitHub Pages + GitHub Actions CI/CD"]}),
            ("phase", {"num":"03","label":"Comunidad + datos","badge":"Comunidad","items":["Sistema de resenas piloto - 10 cupos","Emails transaccionales via Resend","GA4 con eventos personalizados","i18n: espanol, ingles, frances (fr-CA)","Lucide React - reemplazando emojis"]}),
            ("phase", {"num":"04","label":"Pipeline activo","badge":"Traccion","items":["Email campaign a 6 proveedores prioritarios","Daniela Valenzuela - 1a proveedor verificada","Analisis de 300+ mensajes WhatsApp","Dashboard de metricas disenado","Estructura de planes Basica/Activa/Pro"]}),
            ("how", {}),
            ("stack", {"title":"Stack completo","items":[("Frontend", "React 18 - Vite 5 - React Router 6"),("Auth/DB", "Supabase - Magic Link - RLS - PostgreSQL"),("Deploy", "GitHub Pages - GitHub Actions"),("Email", "Resend - Templates HTML"),("Analytics", "GA4 - Eventos custom"),("i18n", "react-i18next - ES / EN / fr-CA"),("Design", "Lucide React - DiceBear - Ideogram SVG")]}),
            ("cta", {"headline":"El directorio donde\nla comunidad se\ncuida sola.","sub":"Para migrantes con Working Holiday Visa\nyendo a Canada","btn":"-> soymanada.com","url":BASE,"hashtags":"#SoyManada #BuildEnPublico #WorkingHoliday #Canada"})
        ]
    },
    "en": {
        "tag": "Building in public",
        "title": "I built a verified\nservice directory\nin 3 weeks",
        "sub": "With React + Supabase + AI\nZero infra budget",
        "slides": [
            ("phase", {"num":"01","label":"Tech foundation","badge":"Auth + DB","items":["Magic link auth - no passwords","Invite-only provider onboarding","Row-Level Security in Supabase","Auto-profile trigger in PostgreSQL","React 18 + Vite 5 + React Router 6"]}),
            ("phase", {"num":"02","label":"Visible product","badge":"Frontend","items":["Category grid with custom SVG icons","TrustBadge - credibility signal first","Provider profiles with DiceBear avatars","Admin panel with manual approval","GitHub Pages + GitHub Actions CI/CD"]}),
            ("phase", {"num":"03","label":"Community + data","badge":"Community","items":["Pilot review system - 10 spots","Transactional emails via Resend","GA4 with custom events","i18n: Spanish, English, French (fr-CA)","Lucide React - replacing emojis"]}),
            ("phase", {"num":"04","label":"Active pipeline","badge":"Traction","items":["Email campaign to 6 priority providers","Daniela Valenzuela - 1st verified provider","Analysis of 300+ WhatsApp messages","Provider metrics dashboard designed","Basica/Activa/Pro pricing structure"]}),
            ("how", {}),
            ("stack", {"title":"Full stack","items":[("Frontend", "React 18 - Vite 5 - React Router 6"),("Auth/DB", "Supabase - Magic Link - RLS - PostgreSQL"),("Deploy", "GitHub Pages - GitHub Actions"),("Email", "Resend - HTML Templates"),("Analytics", "GA4 - Custom Events"),("i18n", "react-i18next - ES / EN / fr-CA"),("Design", "Lucide React - DiceBear - Ideogram SVG")]}),
            ("cta", {"headline":"The directory where\nthe community\nprotects itself.","sub":"For migrants on Working Holiday Visas\nheading to Canada","btn":"-> soymanada.com","url":BASE,"hashtags":"#SoyManada #BuildInPublic #WorkingHoliday #Canada"})
        ]
    }
}

def build(lang):
    data = CONTENT[lang]
    total = len(data["slides"]) + 1
    data["total"] = total
    fname = f"output/soymanada-linkedin-post1-{lang}-v2.pdf"
    c = rl_canvas.Canvas(fname, pagesize=(W, H))
    draw_cover(c, data, lang)
    c.showPage()
    for idx, (stype, sdata) in enumerate(data["slides"]):
        pn_val = idx + 2
        if stype == "phase":
            draw_phase(c, sdata, pn_val, total, lang)
        elif stype == "how":
            draw_how(c, pn_val, total, lang)
        elif stype == "stack":
            draw_stack(c, sdata, pn_val, total, lang)
        elif stype == "cta":
            draw_cta(c, sdata, pn_val, total, lang)
        c.showPage()
    c.save()
    print(f"OK {fname}")

build("es")
build("en")
