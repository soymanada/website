
import subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', 'reportlab', '-q'])

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

W, H = 1080, 1080
PDF_OUT = 'soymanada-carousel-es.pdf'
BASE_URL = 'https://soymanada.com'

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

def bg(c, tc=None, bc=None):
    c.setFillColor(tc or BG_DARK)
    c.rect(0, H//2, W, H//2, fill=1, stroke=0)
    c.setFillColor(bc or BG_MID)
    c.rect(0, 0, W, H//2, fill=1, stroke=0)
    c.setFillColor(HexColor('#5B2D9E'))
    c.setFillAlpha(0.06)
    c.circle(W*0.9, H*0.85, 260, fill=1, stroke=0)
    c.circle(W*0.1, H*0.15, 180, fill=1, stroke=0)
    c.setFillAlpha(1.0)

def brand(c, n, total=9):
    c.setFillColor(CARD_BG); c.setStrokeColor(PURPLE); c.setLineWidth(1)
    c.roundRect(48, H-68, 190, 28, 12, fill=1, stroke=1)
    c.setFillColor(PURPLE_L); c.setFont('Helvetica-Bold', 11)
    c.drawCentredString(143, H-55, 'SOYMANADA')
    c.setFillColor(CARD_BORDER); c.setFont('Helvetica', 11)
    c.drawRightString(W-48, 44, f'{n} / {total}')
    c.setFillColor(PURPLE); c.setFont('Helvetica-Bold', 13)
    c.drawRightString(W-48, 26, 'soymanada.com')

def card(c, x, y, w, h, fill=None, border=None):
    c.setFillColor(fill or CARD_BG)
    c.setStrokeColor(border or CARD_BORDER)
    c.setLineWidth(1.5)
    c.roundRect(x, y, w, h, 12, fill=1, stroke=1)

def bar(c, x, y, w, col=None):
    c.setFillColor(col or PURPLE)
    c.roundRect(x, y, w, 4, 2, fill=1, stroke=0)

def btn(c, x, y, text, url, w=300, h=46, bg=None):
    c.setFillColor(bg or PURPLE)
    c.roundRect(x, y, w, h, 10, fill=1, stroke=0)
    c.setFillColor(WHITE); c.setFont('Helvetica-Bold', 13)
    c.drawCentredString(x+w/2, y+15, text)
    c.linkURL(url, (x, y, x+w, y+h))

def tag(c, x, y, text, fs=11):
    tw = c.stringWidth(text, 'Helvetica', fs) + 22
    c.setFillColor(CARD_BG); c.setStrokeColor(CARD_BORDER); c.setLineWidth(1)
    c.roundRect(x, y, tw, 24, 12, fill=1, stroke=1)
    c.setFillColor(PURPLE_L); c.setFont('Helvetica', fs)
    c.drawCentredString(x+tw/2, y+7, text)
    return tw + 6

def header(c, label, line1, line2=None, col1=None, col2=None, fs=46):
    col1 = col1 or WHITE
    col2 = col2 or PURPLE_L
    c.setFillColor(GOLD); c.setFont('Helvetica-Bold', 12)
    c.drawString(48, H-112, label)
    c.setFillColor(col1); c.setFont('Helvetica-Bold', fs)
    c.drawString(48, H-178, line1)
    if line2:
        c.setFillColor(col2); c.drawString(48, H-178-fs-8, line2)
        bar(c, 48, H-178-fs-8-20, min(len(line2)*fs//3+100, 500), GOLD)
        return H-178-fs-8-46
    bar(c, 48, H-178-fs-20, min(len(line1)*fs//3+100, 500), GOLD)
    return H-178-fs-46

cv = canvas.Canvas(PDF_OUT, pagesize=(W, H))

# SLIDE 1
bg(cv); brand(cv, 1)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 12)
cv.drawString(48, H-112, 'DIRECTORIO VERIFICADO PARA MIGRANTES EN CANADA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 64)
cv.drawString(44, H-192, 'Encuentra')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-266, 'proveedores')
cv.setFillColor(WHITE); cv.drawString(44, H-340, 'de confianza.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 18)
cv.drawString(48, H-390, 'Directorio verificado - Comunidad real - Sin estafas')
btn(cv, 48, H-460, '-> Entrar al directorio', BASE_URL, w=340, h=48, bg=PURPLE)
stats = [('9','proveedores'),('13','categorias'),('500+','migrantes'),('3','opiniones')]
sx = 48
for val, lbl in stats:
    card(cv, sx, H-580, 230, 86)
    cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 30)
    cv.drawCentredString(sx+115, H-544, val)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
    cv.drawCentredString(sx+115, H-566, lbl)
    sx += 244
cats = ['Alojamiento','Tramites','Trabajo','Finanzas','Vuelos','Salud','Educacion','Transporte','Comida','Tech','Moda','Legal','Bienestar']
cx2, cy2 = 48, H-634
for cat in cats:
    tw = tag(cv, cx2, cy2, cat)
    cx2 += tw
    if cx2 > W-180: cx2=48; cy2-=32
cv.showPage()

# SLIDE 2
bg(cv); brand(cv, 2)
top = header(cv, 'PARA MIGRANTES', 'Busca el servicio', 'que necesitas.')
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
fy = top - 16
for text in feats:
    card(cv, 48, fy, W-96, 50, fill=HexColor('#1A0A35'), border=CARD_BORDER)
    cv.setFillColor(WHITE); cv.setFont('Helvetica', 13)
    cv.drawString(76, fy+17, text)
    fy -= 58
btn(cv, 48, 60, '-> Registrarme gratis', f'{BASE_URL}/#registro', w=310, h=44)
btn(cv, 374, 60, '-> Ver directorio', BASE_URL, w=250, h=44, bg=HexColor('#3D1A78'))
cv.showPage()

# SLIDE 3
bg(cv); brand(cv, 3)
top = header(cv, 'MIGRANTE -> PROVEEDOR', 'Contacta sin salir', 'de la plataforma.')
steps3 = [
    (PURPLE,'1','Conversacion','Mensaje directo protegido dentro de la plataforma'),
    (HexColor('#8B5DCE'),'2','Agenda tu cita','Video, telefono o presencial'),
    (HexColor('#A070D8'),'3','Checklist de docs','El proveedor indica que traer'),
    (GOLD,'4','Deja tu opinion','Comunidad mas fuerte - resena verificada'),
]
sy = top - 16
for col, num, title, sub in steps3:
    card(cv, 48, sy, W-96, 106, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.circle(92, sy+53, 27, fill=1, stroke=0)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 20)
    cv.drawCentredString(92, sy+46, num)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 17)
    cv.drawString(136, sy+67, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13)
    cv.drawString(136, sy+44, sub)
    sy -= 120
btn(cv, 48, 60, '-> Iniciar sesion', f'{BASE_URL}/login', w=300, h=44)
cv.showPage()

# SLIDE 4
bg(cv); brand(cv, 4)
top = header(cv, 'SISTEMA DE CONFIANZA', 'Opiniones que', 'realmente importan.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 14)
cv.drawString(48, top-16, 'Piloto activo (10 cupos). Cada opinion mide 4 dimensiones:')
dims = [
    ('Experiencia general','1 a 5 estrellas'),
    ('Comunicacion','Claridad y tiempo de respuesta'),
    ('Calidad del servicio','Resultado entregado'),
    ('Precio justo','Relacion calidad-precio'),
]
dy = top - 60
for title, sub in dims:
    card(cv, 48, dy, W-96, 76, fill=HexColor('#1A0A35'), border=PURPLE)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 16)
    cv.drawString(76, dy+48, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13)
    cv.drawString(76, dy+26, sub)
    dy -= 90
card(cv, 48, dy-10, W-96, 72, fill=HexColor('#2D1057'), border=GOLD)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 15)
cv.drawString(76, dy+38, 'TrustBadge')
cv.setFillColor(WHITE); cv.setFont('Helvetica', 13)
cv.drawString(76, dy+16, 'Verificacion manual por admin - No automatizada - Core del producto')
btn(cv, 48, 48, '-> Ver proveedores verificados', BASE_URL, w=370, h=44)
cv.showPage()

# SLIDE 5
bg(cv, HexColor('#0D1A0A'), HexColor('#1A2D10')); brand(cv, 5)
top = header(cv, 'PARA PROVEEDORES', 'Tu perfil verificado,', 'tu reputacion online.', col2=MINT)
pfeats = [
    'Perfil completo: descripcion, categoria e idiomas',
    'Avatar DiceBear - foto de perfil personalizada',
    'Links: WhatsApp, Instagram, sitio web, pago externo',
    'Agenda de disponibilidad (dias, horarios, duracion)',
    'Inbox de conversaciones con migrantes',
    'Muestra tus opiniones verificadas en tu perfil',
    'Dashboard: vistas, clicks de contacto, metricas',
    'Notificaciones por email (mensaje nuevo, resena nueva)',
    'Responde publicamente a cada opinion',
    'Tiers: Bronze, Cob, Wolf (en desarrollo)',
]
fy = top - 16
for text in pfeats:
    card(cv, 48, fy, W-96, 48, fill=HexColor('#0A1A08'), border=HexColor('#2D4A1A'))
    cv.setFillColor(WHITE); cv.setFont('Helvetica', 13)
    cv.drawString(76, fy+15, text)
    fy -= 56
btn(cv, 48, 48, '-> Aplicar como proveedor', f'{BASE_URL}/apply', w=360, h=44, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 6
bg(cv, HexColor('#0D1A0A'), HexColor('#1A2D10')); brand(cv, 6)
top = header(cv, 'PROVEEDOR -> GESTION', 'Gestiona tu negocio', 'desde el dashboard.', col2=MINT)
BW, BH = 476, 178
blocks = [
    (48,  top-24, MINT,              'AGENDA',
     ['Define dias y horarios disponibles','Slots: 30, 60 o 90 minutos','Timezone: America/Toronto','Activa/desactiva por dia']),
    (556, top-24, PURPLE_L,          'MENSAJES',
     ['Inbox: nuevo / en progreso','Archiva conversaciones cerradas','Interacciones verificadas','Notificacion por email']),
    (48,  top-24-BH-16, HexColor('#60A5FA'), 'CHECKLIST DOCS',
     ['Crea listas de docs por caso','Vinculada a conversacion activa','El migrante ve que falta']),
    (556, top-24-BH-16, GOLD, 'RESERVAS',
     ['Confirma / cancela citas','Video, telefono o presencial','Link de videollamada integrado','Notas por migrante']),
]
for bx, by, col, title, items in blocks:
    card(cv, bx, by-BH, BW, BH, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.setFont('Helvetica-Bold', 13)
    cv.drawString(bx+16, by-26, title)
    iy = by-52
    for item in items:
        cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
        cv.drawString(bx+24, iy, f'- {item}')
        iy -= 28
btn(cv, 48, 48, '-> Ver mi dashboard', f'{BASE_URL}/dashboard', w=340, h=44, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 7 — FIX: titulo 36pt, tarjetas desde H-204
bg(cv); brand(cv, 7)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 12)
cv.drawString(48, H-112, '13 CATEGORIAS ACTIVAS')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 36)
cv.drawString(48, H-164, 'Todo lo que necesitas en un solo lugar.')
bar(cv, 48, H-178, 620, GOLD)
cats_full = [
    ('Alojamiento','Airbnb, habitaciones, arriendos'),
    ('Tramites','SIN, permisos, documentos'),
    ('Trabajo','CV, agencias, orientacion'),
    ('Finanzas','envios, cuentas, cambio'),
    ('Vuelos','pasajes, maletas, escala'),
    ('Salud','medicos, farmacia, cobertura'),
    ('Educacion','ingles, cursos, titulos'),
    ('Transporte','licencia, arriendo, carpool'),
    ('Comida','delivery, cocina, catering'),
    ('Tecnologia','soporte, celular, SIM'),
    ('Moda','ropa, segunda mano, estilismo'),
    ('Legal','visa, contratos, asesoria'),
    ('Bienestar','psicologo, yoga, comunidad'),
]
COL_W = (W-108)//3
CARD_H = 82
GAP_X  = 12
GAP_Y  = 10
START_Y = H-204
for i, (name, desc) in enumerate(cats_full):
    col = i % 3
    row = i // 3
    x = 48 + col * (COL_W + GAP_X)
    y = START_Y - row * (CARD_H + GAP_Y) - CARD_H
    card(cv, x, y, COL_W, CARD_H, fill=HexColor('#1A0A35'), border=CARD_BORDER)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 14)
    cv.drawString(x+14, y+52, name)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 11)
    cv.drawString(x+14, y+28, desc)
    cv.linkURL(BASE_URL, (x, y, x+COL_W, y+CARD_H))
btn(cv, 48, 36, '-> Explorar todas las categorias', BASE_URL, w=420, h=44)
cv.showPage()

# SLIDE 8
bg(cv); brand(cv, 8)
top = header(cv, 'COMO FUNCIONA', 'Simple. Seguro.', 'Verificado.')
steps8 = [
    (PURPLE,              '1','Busca',        'Explora el directorio por categoria'),
    (PURPLE_L,            '2','Lee el perfil', 'TrustBadge + opiniones reales'),
    (GOLD,                '3','Contacta',     'Mensaje directo en la plataforma'),
    (MINT,                '4','Agenda',       'Video, telefono o presencial'),
    (HexColor('#F87171'), '5','Opina',        'Deja tu resena - comunidad mas fuerte'),
]
fy = top - 16; fh = 108
for col, num, title, sub in steps8:
    card(cv, 48, fy, W-96, fh, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.circle(92, fy+fh//2, 27, fill=1, stroke=0)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 20)
    cv.drawCentredString(92, fy+fh//2-7, num)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 18)
    cv.drawString(138, fy+fh//2+10, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 14)
    cv.drawString(138, fy+fh//2-16, sub)
    fy -= fh + 8
btn(cv, 48, 60, '-> Comenzar ahora', BASE_URL, w=296, h=44)
btn(cv, 360, 60, '-> Soy proveedor', f'{BASE_URL}/apply', w=280, h=44, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 9
bg(cv, HexColor('#0D0520'), HexColor('#1A0A40')); brand(cv, 9)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 15)
cv.drawCentredString(W//2, H-124, 'LA MANADA TE ESPERA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 68)
cv.drawCentredString(W//2, H-216, 'Sin estafas.')
cv.setFillColor(PURPLE_L); cv.drawCentredString(W//2, H-298, 'Sin nada raro.')
cv.setFillColor(GOLD_L); cv.drawCentredString(W//2, H-380, 'Con la Manada.')
bar(cv, W//2-200, H-400, 400, GOLD)
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 17)
cv.drawCentredString(W//2, H-440, 'Directorio verificado para migrantes latinoamericanos en Canada')
btn(cv, W//2-356, H-532, '-> Entrar como migrante', BASE_URL, w=336, h=52)
btn(cv, W//2+12,  H-532, '-> Aplicar como proveedor', f'{BASE_URL}/apply', w=336, h=52, bg=HexColor('#2D7A1A'))
card(cv, W//2-420, H-630, 840, 74, fill=CARD_BG, border=CARD_BORDER)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 14)
cv.drawCentredString(W//2, H-582, 'La comunidad pregunta. La IA construye. Tu decides que se publica.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
cv.drawCentredString(W//2, H-604, '- Francisco Reyes, fundador SoyManada')
cv.setFillColor(HexColor('#5B3D9E')); cv.setFont('Helvetica', 12)
cv.drawCentredString(W//2, 96, 'React 18 - Vite 5 - Supabase - Resend - i18next - GitHub Pages')
cv.drawCentredString(W//2, 72, '#SoyManada  #BuildInPublic  #ComunidadPrimero  #ReactJS  #Latam  #WHV')
btn(cv, W//2-156, 22, '-> soymanada.com', BASE_URL, w=312, h=44)
cv.save()
print('PDF generado:', PDF_OUT)
