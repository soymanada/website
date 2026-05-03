import subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', 'reportlab', '-q'])

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

W, H = 1080, 1080
PDF_OUT = 'soymanada-carousel-es.pdf'
BASE    = 'https://soymanada.com'

# ── Paleta ────────────────────────────────────────────────
BG_DARK    = HexColor('#120826')
BG_MID     = HexColor('#2D1057')
PURPLE     = HexColor('#7B4DC8')
PURPLE_L   = HexColor('#A07DE0')
LIGHT_TEXT = HexColor('#C4B0F0')
GOLD       = HexColor('#C9953A')
GOLD_L     = HexColor('#F0D89A')
CARD_BG    = HexColor('#1E0A3C')
CARD_BORDER= HexColor('#3D1A78')
WHITE      = HexColor('#FFFFFF')
MINT       = HexColor('#4ADE80')

# ── Rutas reales del sitio (de App.jsx) ──────────────────
URL = {
    'home':        BASE,
    'proveedores': f'{BASE}/proveedores',
    'login':       f'{BASE}/login',
    'registro':    f'{BASE}/registro-proveedores',
    'dashboard':   f'{BASE}/mi-perfil',
    'planes':      f'{BASE}/planes',
    'opinar':      f'{BASE}/opinar',
    'pasos':       f'{BASE}/primeros-pasos',
    'verificacion':f'{BASE}/verificacion',
}

# ── Sistema de espaciado consistente (igual en todos los slides) ──
LABEL_Y   = H - 118
TITLE1_Y  = H - 172
FS_TITLE  = 42
TITLE2_Y  = TITLE1_Y - int(FS_TITLE * 1.35)
BAR_Y     = TITLE2_Y - 22
CONTENT_Y = BAR_Y - 30

# ── Helpers ──────────────────────────────────────────────
def bg(c, tc=None, bc=None):
    c.setFillColor(tc or BG_DARK)
    c.rect(0, H//2, W, H//2, fill=1, stroke=0)
    c.setFillColor(bc or BG_MID)
    c.rect(0, 0, W, H//2, fill=1, stroke=0)
    c.setFillColor(HexColor('#5B2D9E'))
    c.setFillAlpha(0.05)
    c.circle(W*0.88, H*0.84, 240, fill=1, stroke=0)
    c.circle(W*0.12, H*0.16, 170, fill=1, stroke=0)
    c.setFillAlpha(1.0)

def brand(c, n, total=9):
    c.setFillColor(CARD_BG); c.setStrokeColor(PURPLE); c.setLineWidth(1)
    c.roundRect(48, H-64, 188, 26, 11, fill=1, stroke=1)
    c.setFillColor(PURPLE_L); c.setFont('Helvetica-Bold', 11)
    c.drawCentredString(142, H-52, 'SOYMANADA')
    c.setFillColor(CARD_BORDER); c.setFont('Helvetica', 10)
    c.drawRightString(W-48, 40, f'{n} / {total}')
    c.setFillColor(PURPLE); c.setFont('Helvetica-Bold', 12)
    c.drawRightString(W-48, 24, 'soymanada.com')

def header(c, label, line1, line2, col2=None):
    c.setFillColor(GOLD); c.setFont('Helvetica-Bold', 11)
    c.drawString(48, LABEL_Y, label)
    c.setFillColor(WHITE); c.setFont('Helvetica-Bold', FS_TITLE)
    c.drawString(48, TITLE1_Y, line1)
    c.setFillColor(col2 or PURPLE_L); c.setFont('Helvetica-Bold', FS_TITLE)
    c.drawString(48, TITLE2_Y, line2)
    c.setFillColor(GOLD)
    c.roundRect(48, BAR_Y, min(len(line2)*FS_TITLE//3 + 80, 560), 4, 2, fill=1, stroke=0)

def card(c, x, y, w, h, fill=None, border=None):
    c.setFillColor(fill or CARD_BG)
    c.setStrokeColor(border or CARD_BORDER)
    c.setLineWidth(1.5)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=1)

def btn(c, x, y, text, url, w=300, h=44, bg=None):
    c.setFillColor(bg or PURPLE)
    c.roundRect(x, y, w, h, 10, fill=1, stroke=0)
    c.setFillColor(WHITE); c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(x+w/2, y+14, text)
    c.linkURL(url, (x, y, x+w, y+h))

def tag(c, x, y, text, fs=11):
    tw = c.stringWidth(text, 'Helvetica', fs) + 20
    c.setFillColor(CARD_BG); c.setStrokeColor(CARD_BORDER); c.setLineWidth(1)
    c.roundRect(x, y, tw, 24, 11, fill=1, stroke=1)
    c.setFillColor(PURPLE_L); c.setFont('Helvetica', fs)
    c.drawCentredString(x+tw/2, y+7, text)
    return tw + 6

cv = canvas.Canvas(PDF_OUT, pagesize=(W, H))

# SLIDE 1
bg(cv); brand(cv, 1)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 11)
cv.drawString(48, LABEL_Y, 'DIRECTORIO VERIFICADO PARA MIGRANTES EN CANADA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 64)
cv.drawString(48, H-186, 'Encuentra')
cv.setFillColor(PURPLE_L); cv.drawString(48, H-262, 'proveedores')
cv.setFillColor(WHITE); cv.drawString(48, H-338, 'de confianza.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 17)
cv.drawString(48, H-386, 'Directorio verificado · Comunidad real · Sin estafas')
btn(cv, 48, H-450, '-> Entrar al directorio', URL['home'], w=340, h=46)
sx = 48
for val, lbl in [('9','proveedores'),('13','categorias'),('500+','migrantes'),('3','opiniones')]:
    card(cv, sx, H-566, 228, 84)
    cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 28)
    cv.drawCentredString(sx+114, H-533, val)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
    cv.drawCentredString(sx+114, H-553, lbl)
    sx += 242
cats = ['Alojamiento','Tramites','Trabajo','Finanzas','Vuelos','Salud','Educacion','Transporte','Comida','Tech','Moda','Legal','Bienestar']
cx, cy = 48, H-614
for cat in cats:
    tw = tag(cv, cx, cy, cat)
    cx += tw
    if cx > W-160: cx=48; cy-=30
cv.showPage()

# SLIDE 2
bg(cv); brand(cv, 2)
header(cv, 'PARA MIGRANTES', 'Busca el servicio', 'que necesitas.')
feats = [
    'Navega 13 categorias de servicios para migrantes',
    'Perfil verificado manualmente - sin bots, sin spam',
    'Lee opiniones reales de otros migrantes (piloto activo)',
    'Escribele directo al proveedor desde la plataforma',
    'Agenda una cita: video, telefono o presencial',
    'Disponible en Espanol, English y Francais (FR-CA)',
    'Acceso seguro con magic link - sin contrasena',
    'Solicita un servicio si no encuentras lo que buscas',
]
fy = CONTENT_Y
for text in feats:
    card(cv, 48, fy, W-96, 50, fill=HexColor('#1A0A35'), border=CARD_BORDER)
    cv.setFillColor(WHITE); cv.setFont('Helvetica', 13)
    cv.drawString(72, fy+17, text)
    fy -= 56
btn(cv, 48,  54, '-> Registrarme gratis', URL['login'],       w=310, h=44)
btn(cv, 370, 54, '-> Ver directorio',     URL['proveedores'], w=256, h=44, bg=HexColor('#3D1A78'))
cv.showPage()

# SLIDE 3
bg(cv); brand(cv, 3)
header(cv, 'MIGRANTE -> PROVEEDOR', 'Contacta sin salir', 'de la plataforma.')
steps3 = [
    (PURPLE,              '1','Conversacion', 'Mensaje directo protegido dentro de la plataforma'),
    (HexColor('#8B5DCE'), '2','Agenda tu cita','Video, telefono o presencial'),
    (HexColor('#A070D8'), '3','Checklist docs','El proveedor indica que documentos traer'),
    (GOLD,                '4','Deja tu opinion','Resena verificada - fortalece la comunidad'),
]
sy = CONTENT_Y
for col, num, title, sub in steps3:
    card(cv, 48, sy, W-96, 106, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.circle(92, sy+53, 27, fill=1, stroke=0)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 20)
    cv.drawCentredString(92, sy+46, num)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 17)
    cv.drawString(136, sy+67, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13)
    cv.drawString(136, sy+44, sub)
    sy -= 116
btn(cv, 48,  54, '-> Iniciar sesion',  URL['login'], w=296, h=44)
btn(cv, 360, 54, '-> Primeros pasos',  URL['pasos'], w=296, h=44, bg=HexColor('#3D1A78'))
cv.showPage()

# SLIDE 4
bg(cv); brand(cv, 4)
header(cv, 'SISTEMA DE CONFIANZA', 'Opiniones que', 'realmente importan.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 14)
cv.drawString(48, CONTENT_Y+6, 'Piloto activo (10 cupos). Cada opinion mide 4 dimensiones:')
dims = [
    ('Experiencia general',  '1 a 5 estrellas'),
    ('Comunicacion',         'Claridad y tiempo de respuesta'),
    ('Calidad del servicio', 'Resultado entregado'),
    ('Precio justo',         'Relacion calidad-precio'),
]
dy = CONTENT_Y - 46
for title, sub in dims:
    card(cv, 48, dy, W-96, 76, fill=HexColor('#1A0A35'), border=PURPLE)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 15)
    cv.drawString(72, dy+48, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13)
    cv.drawString(72, dy+26, sub)
    dy -= 84
card(cv, 48, dy-8, W-96, 68, fill=HexColor('#2D1057'), border=GOLD)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 14)
cv.drawString(72, dy+38, 'TrustBadge')
cv.setFillColor(WHITE); cv.setFont('Helvetica', 12)
cv.drawString(72, dy+18, 'Verificacion manual por admin - No automatizada - Core del producto')
btn(cv, 48, 54, '-> Ver proveedores verificados', URL['verificacion'], w=380, h=44)
cv.showPage()

# SLIDE 5
bg(cv, HexColor('#0D1A0A'), HexColor('#1A2D10')); brand(cv, 5)
header(cv, 'PARA PROVEEDORES', 'Tu perfil verificado,', 'tu reputacion online.', col2=MINT)
pfeats = [
    'Perfil completo: descripcion, categoria e idiomas',
    'Avatar DiceBear - foto de perfil personalizada',
    'Links: WhatsApp, Instagram, sitio web, pago externo',
    'Agenda de disponibilidad (dias, horarios, duracion)',
    'Inbox de conversaciones con migrantes',
    'Opiniones verificadas visibles en tu perfil',
    'Dashboard: vistas, clicks de contacto, metricas',
    'Notificaciones por email (mensaje nuevo, resena nueva)',
    'Responde publicamente a cada opinion',
    'Tiers: Bronze, Cob, Wolf (en desarrollo)',
]
fy = CONTENT_Y
for text in pfeats:
    card(cv, 48, fy, W-96, 48, fill=HexColor('#0A1A08'), border=HexColor('#2D4A1A'))
    cv.setFillColor(WHITE); cv.setFont('Helvetica', 13)
    cv.drawString(72, fy+15, text)
    fy -= 54
btn(cv, 48,  54, '-> Aplicar como proveedor', URL['registro'], w=360, h=44, bg=HexColor('#2D7A1A'))
btn(cv, 420, 54, '-> Ver planes',             URL['planes'],   w=200, h=44, bg=HexColor('#3D7A1A'))
cv.showPage()

# SLIDE 6
bg(cv, HexColor('#0D1A0A'), HexColor('#1A2D10')); brand(cv, 6)
header(cv, 'PROVEEDOR -> GESTION', 'Gestiona tu negocio', 'desde el dashboard.', col2=MINT)
BW, BH = 476, 174
blocks = [
    (48,  CONTENT_Y,       MINT,               'AGENDA',
     ['Define dias y horarios disponibles','Slots: 30, 60 o 90 minutos','Timezone: America/Toronto','Activa/desactiva por dia']),
    (556, CONTENT_Y,       PURPLE_L,           'MENSAJES',
     ['Inbox: nuevo / en progreso','Archiva conversaciones cerradas','Interacciones verificadas','Notificacion por email']),
    (48,  CONTENT_Y-BH-14, HexColor('#60A5FA'), 'CHECKLIST DOCS',
     ['Crea listas de docs por caso','Vinculada a conversacion activa','El migrante ve que falta']),
    (556, CONTENT_Y-BH-14, GOLD,               'RESERVAS',
     ['Confirma / cancela citas','Video, telefono o presencial','Link de videollamada integrado','Notas por migrante']),
]
for bx, by, col, title, items in blocks:
    card(cv, bx, by-BH, BW, BH, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.setFont('Helvetica-Bold', 13)
    cv.drawString(bx+16, by-24, title)
    iy = by-50
    for item in items:
        cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
        cv.drawString(bx+24, iy, f'- {item}')
        iy -= 28
btn(cv, 48, 54, '-> Ir a mi dashboard', URL['dashboard'], w=330, h=44, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 7
bg(cv); brand(cv, 7)
header(cv, '13 CATEGORIAS ACTIVAS', 'Todo lo que necesitas', 'en un solo lugar.')
cats_full = [
    ('Alojamiento','Airbnb, habitaciones, arriendos'),('Tramites','SIN, permisos, documentos'),
    ('Trabajo','CV, agencias, orientacion'),('Finanzas','envios, cuentas, cambio'),
    ('Vuelos','pasajes, maletas, escala'),('Salud','medicos, farmacia, cobertura'),
    ('Educacion','ingles, cursos, titulos'),('Transporte','licencia, arriendo, carpool'),
    ('Comida','delivery, cocina, catering'),('Tecnologia','soporte, celular, SIM'),
    ('Moda','ropa, segunda mano, estilismo'),('Legal','visa, contratos, asesoria'),
    ('Bienestar','psicologo, yoga, comunidad'),
]
COL_W = (W-108)//3
CH, CGAP = 84, 10
for i,(name,desc) in enumerate(cats_full):
    col=i%3; row=i//3
    x=48+col*(COL_W+12); y=CONTENT_Y-row*(CH+CGAP)-CH
    card(cv,x,y,COL_W,CH,fill=HexColor('#1A0A35'),border=CARD_BORDER)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold',14); cv.drawString(x+14,y+52,name)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica',11); cv.drawString(x+14,y+28,desc)
    cv.linkURL(URL['proveedores'],(x,y,x+COL_W,y+CH))
btn(cv, 48, 36, '-> Explorar todas las categorias', URL['proveedores'], w=420, h=44)
cv.showPage()

# SLIDE 8
bg(cv); brand(cv, 8)
header(cv, 'COMO FUNCIONA', 'Simple. Seguro.', 'Verificado.')
steps8 = [
    (PURPLE,              '1','Busca',        'Explora el directorio por categoria'),
    (PURPLE_L,            '2','Lee el perfil', 'TrustBadge + opiniones reales'),
    (GOLD,                '3','Contacta',     'Mensaje directo dentro de la plataforma'),
    (MINT,                '4','Agenda',       'Video, telefono o presencial'),
    (HexColor('#F87171'), '5','Opina',        'Resena verificada — comunidad mas fuerte'),
]
fy=CONTENT_Y; fh=106
for col,num,title,sub in steps8:
    card(cv,48,fy,W-96,fh,fill=CARD_BG,border=col)
    cv.setFillColor(col); cv.circle(92,fy+fh//2,26,fill=1,stroke=0)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold',19); cv.drawCentredString(92,fy+fh//2-7,num)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold',17); cv.drawString(136,fy+fh//2+10,title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica',13); cv.drawString(136,fy+fh//2-14,sub)
    fy -= fh+8
btn(cv, 48,  54, '-> Comenzar ahora',  URL['login'],    w=290, h=44)
btn(cv, 352, 54, '-> Soy proveedor',   URL['registro'], w=290, h=44, bg=HexColor('#2D7A1A'))
btn(cv, 656, 54, '-> Dejar opinion',   URL['opinar'],   w=264, h=44, bg=HexColor('#5B2D9E'))
cv.showPage()

# SLIDE 9
bg(cv, HexColor('#0D0520'), HexColor('#1A0A40')); brand(cv, 9)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 14)
cv.drawCentredString(W//2, H-124, 'LA MANADA TE ESPERA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 72)
cv.drawCentredString(W//2, H-218, 'Sin estafas.')
cv.setFillColor(PURPLE_L); cv.drawCentredString(W//2, H-304, 'Sin nada raro.')
cv.setFillColor(GOLD_L); cv.drawCentredString(W//2, H-390, 'Con la Manada.')
cv.setFillColor(GOLD); cv.roundRect(W//2-210, H-412, 420, 4, 2, fill=1, stroke=0)
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 16)
cv.drawCentredString(W//2, H-452, 'Directorio verificado para migrantes latinoamericanos en Canada')
btn(cv, W//2-358, H-524, '-> Entrar como migrante',   URL['login'],    w=336, h=50)
btn(cv, W//2+14,  H-524, '-> Aplicar como proveedor', URL['registro'], w=336, h=50, bg=HexColor('#2D7A1A'))
card(cv, W//2-432, H-630, 864, 72, fill=CARD_BG, border=CARD_BORDER)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 14)
cv.drawCentredString(W//2, H-584, 'La comunidad pregunta. La IA construye. Tu decides que se publica.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
cv.drawCentredString(W//2, H-606, '- Francisco Reyes, fundador SoyManada')
cv.setFillColor(HexColor('#5B3D9E')); cv.setFont('Helvetica', 11)
cv.drawCentredString(W//2, 88, 'React 18 · Vite 5 · Supabase · Resend · i18next · GitHub Pages')
cv.drawCentredString(W//2, 68, '#SoyManada  #BuildInPublic  #ComunidadPrimero  #ReactJS  #Latam  #WHV')
btn(cv, W//2-160, 22, '-> soymanada.com', URL['home'], w=320, h=44)
cv.save()
print('OK:', PDF_OUT)
