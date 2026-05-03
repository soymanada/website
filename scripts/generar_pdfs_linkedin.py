#!/usr/bin/env python3
"""
SoyManada — LinkedIn Carousel PDFs
Genera: soymanada-linkedin-post1-es.pdf / soymanada-linkedin-post1-en.pdf
Requiere: pip install reportlab
Uso:      python scripts/generar_pdfs_linkedin.py
Output:   ./output/  (se crea automáticamente)
"""

import os
from reportlab.pdfgen import canvas as rl_canvas
from reportlab.lib.colors import HexColor

os.makedirs("output", exist_ok=True)

W, H = 1080, 1080
IRIS  = HexColor("#7B4DC8")
WHITE = HexColor("#FFFFFF")
GRAY  = HexColor("#6B7280")

def bg_gradient(c, top, bot):
    steps = 40
    r1,g1,b1 = top.red,top.green,top.blue
    r2,g2,b2 = bot.red,bot.green,bot.blue
    sh = H/steps
    for i in range(steps):
        t = i/steps
        c.setFillColorRGB(r1+(r2-r1)*t, g1+(g2-g1)*t, b1+(b2-b1)*t)
        c.rect(0, H-(i+1)*sh, W, sh+1, fill=1, stroke=0)

def pill(c, x, y, w, h, color, radius=12):
    c.setFillColor(color)
    c.roundRect(x, y, w, h, radius, fill=1, stroke=0)

def badge(c, x, y, label, bg=None, fg=WHITE, size=18, padding=14, radius=10):
    if bg is None:
        bg = IRIS
    ww = c.stringWidth(label, "Helvetica-Bold", size) + padding*2
    pill(c, x, y, ww, size+padding, bg, radius)
    c.setFillColor(fg)
    c.setFont("Helvetica-Bold", size)
    c.drawString(x+padding, y+padding*0.55, label)
    return ww

def txt(c, s, x, y, size=24, color=WHITE, bold=False, align="left"):
    c.setFillColor(color)
    c.setFont("Helvetica-Bold" if bold else "Helvetica", size)
    if align == "center":
        c.drawCentredString(x, y, s)
    elif align == "right":
        c.drawRightString(x, y, s)
    else:
        c.drawString(x, y, s)

def lh(c, x, y, w, color, t=2):
    c.setStrokeColor(color)
    c.setLineWidth(t)
    c.line(x, y, x+w, y)

def footer(c):
    lh(c, 60, 58, W-120, HexColor("#2D2D4A"), 1)
    txt(c, "soymanada.com", 60, 28, size=20, color=HexColor("#7C3AED"))
    c.linkURL("https://soymanada.com", (60, 18, 280, 48))

def pn(c, n, total=7):
    txt(c, f"{n:02d} / {total:02d}", W-120, H-72, size=18, color=GRAY)


CONTENT = {
    "es": {
        "tag": "Build en público",
        "title": "Construí un\ndirectorio de\nservicios en\n3 semanas",
        "sub": "Con React + Supabase + IA\nCon cero presupuesto de infra",
        "slides": [
            ("phase", {"num": "01", "label": "Base técnica", "badge": "Auth + DB", "items": [
                "Auth magic link — sin contraseñas",
                "Invite-only para proveedores",
                "RLS policies en Supabase",
                "Auto-profile trigger en PostgreSQL",
                "React 18 + Vite 5 + React Router 6",
            ]}),
            ("phase", {"num": "02", "label": "Producto visible", "badge": "Frontend", "items": [
                "Grid de categorías con íconos SVG custom",
                "TrustBadge — verificación visible primero",
                "Perfiles de proveedor con DiceBear avatars",
                "Panel admin con aprobación manual",
                "GitHub Pages + GitHub Actions CI/CD",
            ]}),
            ("phase", {"num": "03", "label": "Comunidad + datos", "badge": "Comunidad", "items": [
                "Sistema de reseñas piloto — 10 cupos",
                "Emails transaccionales via Resend",
                "GA4 con eventos personalizados",
                "i18n: español, inglés, français (fr-CA)",
                "Lucide React — reemplazando emojis",
            ]}),
            ("phase", {"num": "04", "label": "Pipeline activo", "badge": "Tracción", "items": [
                "Email campaign a 6 proveedores prioritarios",
                "Daniela Valenzuela — 1ª proveedor verificada",
                "Análisis de 300+ mensajes WhatsApp",
                "Dashboard de métricas diseñado",
                "Estructura de planes Básica/Activa/Pro",
            ]}),
            ("stack", {"title": "Stack completo", "items": [
                ("Frontend",  "React 18 · Vite 5 · React Router 6"),
                ("Auth/DB",   "Supabase · Magic Link · RLS · PostgreSQL"),
                ("Deploy",    "GitHub Pages · GitHub Actions"),
                ("Email",     "Resend · Templates HTML"),
                ("Analytics", "GA4 · Eventos custom"),
                ("i18n",      "react-i18next · ES / EN / fr-CA"),
                ("Design",    "Lucide React · DiceBear · Ideogram SVG"),
            ]}),
            ("cta", {
                "headline": "El directorio donde\nla comunidad se\ncuida sola.",
                "sub": "Para migrantes con Working Holiday Visa\nllendo a Canadá",
                "btn": "→ soymanada.com",
                "url": "https://soymanada.com",
                "hashtags": "#SoyManada #BuildEnPublico #WorkingHoliday #Canada",
            }),
        ]
    },
    "en": {
        "tag": "Building in public",
        "title": "I built a verified\nservice directory\nin 3 weeks",
        "sub": "With React + Supabase + AI\nZero infra budget",
        "slides": [
            ("phase", {"num": "01", "label": "Tech foundation", "badge": "Auth + DB", "items": [
                "Magic link auth — no passwords",
                "Invite-only provider onboarding",
                "Row-Level Security in Supabase",
                "Auto-profile trigger in PostgreSQL",
                "React 18 + Vite 5 + React Router 6",
            ]}),
            ("phase", {"num": "02", "label": "Visible product", "badge": "Frontend", "items": [
                "Category grid with custom SVG icons",
                "TrustBadge — credibility signal first",
                "Provider profiles with DiceBear avatars",
                "Admin panel with manual approval",
                "GitHub Pages + GitHub Actions CI/CD",
            ]}),
            ("phase", {"num": "03", "label": "Community + data", "badge": "Community", "items": [
                "Pilot review system — 10 spots",
                "Transactional emails via Resend",
                "GA4 with custom events",
                "i18n: Spanish, English, French (fr-CA)",
                "Lucide React — replacing emojis",
            ]}),
            ("phase", {"num": "04", "label": "Active pipeline", "badge": "Traction", "items": [
                "Email campaign to 6 priority providers",
                "Daniela Valenzuela — 1st verified provider",
                "Analysis of 300+ WhatsApp messages",
                "Provider metrics dashboard designed",
                "Básica/Activa/Pro pricing structure",
            ]}),
            ("stack", {"title": "Full stack", "items": [
                ("Frontend",  "React 18 · Vite 5 · React Router 6"),
                ("Auth/DB",   "Supabase · Magic Link · RLS · PostgreSQL"),
                ("Deploy",    "GitHub Pages · GitHub Actions"),
                ("Email",     "Resend · HTML Templates"),
                ("Analytics", "GA4 · Custom Events"),
                ("i18n",      "react-i18next · ES / EN / fr-CA"),
                ("Design",    "Lucide React · DiceBear · Ideogram SVG"),
            ]}),
            ("cta", {
                "headline": "The directory where\nthe community\nprotects itself.",
                "sub": "For migrants on Working Holiday Visas\nheading to Canada",
                "btn": "→ soymanada.com",
                "url": "https://soymanada.com",
                "hashtags": "#SoyManada #BuildInPublic #WorkingHoliday #Canada",
            }),
        ]
    }
}


def draw_cover(c, data, lang):
    bg_gradient(c, HexColor("#0F0F1A"), HexColor("#1E1040"))
    c.setFillColor(WHITE); c.setFillAlpha(0.04)
    for xi in range(0, W, 60):
        for yi in range(0, H, 60):
            c.circle(xi, yi, 1.5, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    c.setFillColor(IRIS); c.setFillAlpha(0.12)
    c.circle(W*0.85, H*0.72, 280, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    badge(c, 60, H-100, data["tag"])
    badge(c, W-180, H-100, "7 slides", bg=HexColor("#FFFFFF20"), fg=WHITE, size=18, padding=12)
    y = H - 220
    c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 72)
    for i, ln in enumerate(data["title"].split("\n")):
        c.drawString(60, y - i*85, ln)
    y2 = y - len(data["title"].split("\n"))*85 - 30
    c.setFillColor(HexColor("#C4B5FD")); c.setFont("Helvetica", 30)
    for i, ln in enumerate(data["sub"].split("\n")):
        c.drawString(60, y2 - i*42, ln)
    lh(c, 60, 160, 500, IRIS, 2)
    txt(c, "soymanada.com", 60, 110, size=28, color=HexColor("#A78BFA"), bold=True)
    swipe = "← desliza" if lang == "es" else "← swipe"
    txt(c, swipe, W-220, 110, size=22, color=GRAY)
    txt(c, "01 / 07", W-120, 40, size=18, color=HexColor("#4B5563"))
    c.linkURL("https://soymanada.com", (60, 90, 320, 130))


def draw_phase(c, sdata, page_n, lang):
    bg_gradient(c, HexColor("#0F0F1A"), HexColor("#1A1035"))
    c.setFillColor(WHITE); c.setFillAlpha(0.03)
    c.setFont("Helvetica-Bold", 380)
    c.drawString(-20, H//2 - 190, sdata["num"])
    c.setFillAlpha(1.0)
    label = "Fase" if lang == "es" else "Phase"
    badge(c, 60, H-90, f"{label} {sdata['num']}")
    pn(c, page_n)
    txt(c, sdata["label"], 60, H-160, size=52, bold=True)
    lh(c, 60, H-178, W-120, IRIS, 2)
    bw = c.stringWidth(sdata["badge"], "Helvetica-Bold", 18) + 28
    badge(c, W-bw-60, H-160, sdata["badge"],
          bg=HexColor("#312E81"), fg=HexColor("#C4B5FD"), size=18, padding=14)
    y0 = H - 240
    for i, item in enumerate(sdata["items"]):
        y = y0 - i*92
        c.setFillColor(WHITE); c.setFillAlpha(0.04)
        c.roundRect(52, y-12, W-104, 72, 10, fill=1, stroke=0)
        c.setFillAlpha(1.0)
        c.setFillColor(IRIS)
        c.circle(80, y+26, 6, fill=1, stroke=0)
        txt(c, item, 100, y+16, size=28)
    footer(c)


def draw_stack(c, sdata, page_n, lang):
    bg_gradient(c, HexColor("#0F0F1A"), HexColor("#0D1F3C"))
    txt(c, sdata["title"], 60, H-90, size=44, bold=True)
    lh(c, 60, H-108, W-120, IRIS, 3)
    pn(c, page_n)
    col_w = (W-120)//2
    y0 = H - 180
    rh = 116
    for i, (cat, tech) in enumerate(sdata["items"]):
        col = i % 2; row = i // 2
        x = 60 + col*(col_w+20)
        y = y0 - row*rh
        c.setFillColor(WHITE); c.setFillAlpha(0.05)
        c.roundRect(x, y-72, col_w-10, 84, 12, fill=1, stroke=0)
        c.setFillAlpha(1.0)
        c.setFillColor(IRIS)
        c.roundRect(x, y-72, 4, 84, 2, fill=1, stroke=0)
        txt(c, cat,  x+18, y-14, size=22, color=HexColor("#A78BFA"), bold=True)
        txt(c, tech, x+18, y-44, size=18, color=HexColor("#D1D5DB"))
    footer(c)


def draw_cta(c, sdata, page_n, lang):
    bg_gradient(c, HexColor("#4C1D95"), HexColor("#1E1040"))
    c.setFillColor(WHITE); c.setFillAlpha(0.05)
    c.circle(W*0.8, H*0.3, 320, fill=1, stroke=0)
    c.setFillAlpha(1.0)
    pn(c, page_n)
    y = H - 200
    c.setFillColor(WHITE); c.setFont("Helvetica-Bold", 68)
    lines = sdata["headline"].split("\n")
    for i, ln in enumerate(lines):
        c.drawString(60, y - i*80, ln)
    y2 = y - len(lines)*80 - 30
    c.setFillColor(HexColor("#C4B5FD")); c.setFont("Helvetica", 28)
    for i, ln in enumerate(sdata["sub"].split("\n")):
        c.drawString(60, y2 - i*40, ln)
    c.setFillColor(WHITE)
    c.roundRect(60, 220, 440, 68, 12, fill=1, stroke=0)
    c.setFillColor(IRIS); c.setFont("Helvetica-Bold", 28)
    c.drawString(80, 242, sdata["btn"])
    c.linkURL(sdata["url"], (60, 220, 500, 288))
    txt(c, sdata["hashtags"], 60, 150, size=20, color=HexColor("#7C3AED"))
    lh(c, 60, 58, W-120, HexColor("#3B1F7A"), 1)
    txt(c, "soymanada.com", 60, 28, size=20, color=HexColor("#A78BFA"))
    c.linkURL("https://soymanada.com", (60, 18, 280, 48))


def build(lang):
    data = CONTENT[lang]
    fname = f"output/soymanada-linkedin-post1-{lang}.pdf"
    c = rl_canvas.Canvas(fname, pagesize=(W, H))
    draw_cover(c, data, lang)
    c.showPage()
    total = len(data["slides"]) + 1
    for idx, (stype, sdata) in enumerate(data["slides"]):
        pn_val = idx + 2
        if stype == "phase":
            draw_phase(c, sdata, pn_val, lang)
        elif stype == "stack":
            draw_stack(c, sdata, pn_val, lang)
        elif stype == "cta":
            draw_cta(c, sdata, pn_val, lang)
        c.showPage()
    c.save()
    print(f"✓ {fname}  ({os.path.getsize(fname)//1024} KB, {total} slides)")


build("es")
build("en")
print("\nListo. Archivos en ./output/")
