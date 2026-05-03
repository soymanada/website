
import subprocess, sys
subprocess.run([sys.executable, '-m', 'pip', 'install', 'reportlab', '-q'])

from reportlab.pdfgen import canvas
from reportlab.lib.colors import HexColor

W, H = 1080, 1080
PDF_OUT = 'soymanada-carousel-es.pdf'
BASE_URL = 'https://soymanada.com'

BG_DARK   = HexColor('#120826')
BG_MID    = HexColor('#2D1057')
PURPLE    = HexColor('#7B4DC8')
PURPLE_L  = HexColor('#A07DE0')
LIGHT_TEXT= HexColor('#C4B0F0')
GOLD      = HexColor('#C9953A')
GOLD_L    = HexColor('#F0D89A')
CARD_BG   = HexColor('#1E0A3C')
CARD_BORDER = HexColor('#3D1A78')
WHITE     = HexColor('#FFFFFF')
MINT      = HexColor('#4ADE80')

def bg(c, tc=None, bc=None):
    c.setFillColor(tc or BG_DARK)
    c.rect(0, H//2, W, H//2, fill=1, stroke=0)
    c.setFillColor(bc or BG_MID)
    c.rect(0, 0, W, H//2, fill=1, stroke=0)
    c.setFillColor(HexColor('#5B2D9E'))
    c.setFillAlpha(0.08)
    c.circle(W*0.9, H*0.85, 280, fill=1, stroke=0)
    c.circle(W*0.1, H*0.15, 200, fill=1, stroke=0)
    c.setFillAlpha(1.0)

def brand(c, n, total=9):
    c.setFillColor(CARD_BG); c.setStrokeColor(PURPLE); c.setLineWidth(1)
    c.roundRect(48, H-72, 200, 32, 14, fill=1, stroke=1)
    c.setFillColor(PURPLE_L); c.setFont('Helvetica-Bold', 12)
    c.drawCentredString(148, H-57, 'SOYMANADA')
    c.setFillColor(CARD_BORDER); c.setFont('Helvetica', 11)
    c.drawRightString(W-48, 44, f'{n} / {total}')
    c.setFillColor(PURPLE); c.setFont('Helvetica-Bold', 14)
    c.drawRightString(W-48, 28, 'soymanada.com')

def card(c, x, y, w, h, fill=None, border=None):
    c.setFillColor(fill or CARD_BG); c.setStrokeColor(border or CARD_BORDER)
    c.setLineWidth(1.5); c.roundRect(x, y, w, h, 12, fill=1, stroke=1)

def bar(c, x, y, w, col=None):
    c.setFillColor(col or PURPLE); c.roundRect(x, y, w, 4, 2, fill=1, stroke=0)

def btn(c, x, y, text, url, w=300, h=46, bg=None):
    c.setFillColor(bg or PURPLE); c.roundRect(x, y, w, h, 10, fill=1, stroke=0)
    c.setFillColor(WHITE); c.setFont('Helvetica-Bold', 14)
    c.drawCentredString(x+w/2, y+15, text)
    c.linkURL(url, (x, y, x+w, y+h))

def tag(c, x, y, text, fs=11):
    tw = c.stringWidth(text, 'Helvetica', fs) + 24
    c.setFillColor(CARD_BG); c.setStrokeColor(CARD_BORDER); c.setLineWidth(1)
    c.roundRect(x, y, tw, 26, 13, fill=1, stroke=1)
    c.setFillColor(PURPLE_L); c.setFont('Helvetica', fs)
    c.drawCentredString(x+tw/2, y+8, text)
    return tw + 6

cv = canvas.Canvas(PDF_OUT, pagesize=(W, H))

# SLIDE 1
bg(cv); brand(cv, 1)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 13)
cv.drawString(48, H-120, '¿RECIEN LLEGASTE A CANADA?')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 68)
cv.drawString(44, H-210, 'Encuentra')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-290, 'proveedores')
cv.setFillColor(WHITE); cv.drawString(44, H-370, 'de confianza.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 20)
cv.drawString(48, H-430, 'Directorio verificado - Comunidad real')
cv.drawString(48, H-458, 'Sin estafas - Sin nada raro')
btn(cv, 48, H-530, '-> Entrar al directorio', BASE_URL, w=340, h=50, bg=PURPLE)
stats = [('9','proveedores'),('13','categorias'),('500+','migrantes'),('3','opiniones')]
sx = 48
for val, lbl in stats:
    card(cv, sx, H-660, 230, 88)
    cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 32)
    cv.drawCentredString(sx+115, H-622, val)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13)
    cv.drawCentredString(sx+115, H-646, lbl)
    sx += 244
cats = ['Alojamiento','Tramites','Trabajo','Finanzas','Vuelos','Salud','Edu','Transporte','Comida','Tech','Moda','Legal','Bienestar']
cx2, cy2 = 48, H-710
for cat in cats:
    tw = tag(cv, cx2, cy2, cat)
    cx2 += tw
    if cx2 > W-180: cx2=48; cy2-=34
cv.showPage()

# SLIDE 2
bg(cv); brand(cv, 2)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, 'PARA MIGRANTES')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 52); cv.drawString(44, H-200, 'Busca el servicio')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-262, 'que necesitas.')
bar(cv, 48, H-278, 320, GOLD)
feats = [
    ('Navega 13 categorias de servicios para migrantes'),
    ('Perfil verificado manualmente - sin bots, sin spam'),
    ('Lee opiniones reales de otros migrantes (piloto activo)'),
    ('Escribele directo al proveedor desde la plataforma'),
    ('Agenda una cita: video, telefono o presencial'),
    ('Disponible en Espanol, English y Francais (FR-CA)'),
    ('Acceso seguro con magic link - sin contrasena'),
    ('Solicita un servicio si no encuentras lo que buscas'),
]
fy = H-320
for text in feats:
    card(cv, 48, fy, W-96, 52, fill=HexColor('#1A0A35'), border=CARD_BORDER)
    cv.setFillColor(WHITE); cv.setFont('Helvetica', 14); cv.drawString(80, fy+18, text)
    fy -= 60
btn(cv, 48, 60, '-> Registrarme gratis', f'{BASE_URL}/#registro', w=320, h=46)
btn(cv, 390, 60, '-> Ver directorio', BASE_URL, w=260, h=46, bg=HexColor('#3D1A78'))
cv.showPage()

# SLIDE 3
bg(cv); brand(cv, 3)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, 'MIGRANTE -> PROVEEDOR')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 48); cv.drawString(44, H-195, 'Contacta sin salir')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-253, 'de la plataforma.')
steps3 = [
    (PURPLE,'1','Conversacion','Mensaje directo protegido dentro de la plataforma'),
    (HexColor('#8B5DCE'),'2','Agenda tu cita','Video, telefono o presencial'),
    (HexColor('#A070D8'),'3','Checklist de docs','El proveedor indica que traer'),
    (GOLD,'4','Deja tu opinion','Comunidad mas fuerte - resena verificada')
]
sy = H-320
for col, num, title, sub in steps3:
    card(cv, 48, sy, W-96, 108, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.circle(94, sy+54, 28, fill=1, stroke=0)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 22); cv.drawCentredString(94, sy+47, num)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 18); cv.drawString(140, sy+68, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 14); cv.drawString(140, sy+44, sub)
    sy -= 124
btn(cv, 48, 60, '-> Iniciar sesion', f'{BASE_URL}/login', w=300, h=46)
cv.showPage()

# SLIDE 4
bg(cv); brand(cv, 4)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, 'SISTEMA DE CONFIANZA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 52); cv.drawString(44, H-195, 'Opiniones que')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-257, 'realmente importan.')
bar(cv, 48, H-273, 400, GOLD)
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 15)
cv.drawString(48, H-305, 'Sistema de resenas piloto activo (10 cupos externos).')
cv.drawString(48, H-327, 'Cada opinion mide 4 dimensiones reales:')
dims = [('Experiencia general','1 a 5 estrellas'),('Comunicacion','claridad y respuesta'),
        ('Calidad del servicio','resultado entregado'),('Precio justo','relacion calidad-precio')]
dy = H-400
for title, sub in dims:
    card(cv, 48, dy, W-96, 72, fill=HexColor('#1A0A35'), border=PURPLE)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 16); cv.drawString(80, dy+44, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13); cv.drawString(80, dy+24, sub)
    dy -= 84
card(cv, 48, 130, W-96, 76, fill=HexColor('#2D1057'), border=GOLD)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 16); cv.drawString(80, 184, 'TrustBadge')
cv.setFillColor(WHITE); cv.setFont('Helvetica', 14); cv.drawString(80, 160, 'Verificacion manual por admin - No automatizada - Core del producto')
btn(cv, 48, 60, '-> Ver proveedores verificados', BASE_URL, w=380, h=46)
cv.showPage()

# SLIDE 5
bg(cv, HexColor('#0D1A0A'), HexColor('#1A2D10')); brand(cv, 5)
cv.setFillColor(MINT); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, 'PARA PROVEEDORES')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 52); cv.drawString(44, H-195, 'Tu perfil verificado,')
cv.setFillColor(MINT); cv.drawString(44, H-257, 'tu reputacion online.')
bar(cv, 48, H-273, 500, MINT)
pfeats = [
    'Perfil completo con descripcion, categoria e idiomas',
    'Avatar DiceBear - foto de perfil personalizada',
    'Links: WhatsApp, Instagram, sitio web, pago externo',
    'Agenda de disponibilidad (dias, horarios, duracion)',
    'Inbox de conversaciones con migrantes',
    'Muestra tus opiniones verificadas en tu perfil',
    'Dashboard con metricas: vistas, clicks de contacto',
    'Notificaciones por email (mensaje nuevo, resena nueva)',
    'Responde publicamente a cada opinion',
    'Tiers: Bronze, Cob, Wolf (en desarrollo)'
]
fy = H-320
for text in pfeats:
    card(cv, 48, fy, W-96, 50, fill=HexColor('#0A1A08'), border=HexColor('#2D4A1A'))
    cv.setFillColor(WHITE); cv.setFont('Helvetica', 13); cv.drawString(80, fy+17, text)
    fy -= 58
btn(cv, 48, 60, '-> Aplicar como proveedor', f'{BASE_URL}/apply', w=360, h=46, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 6
bg(cv, HexColor('#0D1A0A'), HexColor('#1A2D10')); brand(cv, 6)
cv.setFillColor(MINT); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, 'PROVEEDOR -> GESTION')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 48); cv.drawString(44, H-195, 'Gestiona tu negocio')
cv.setFillColor(MINT); cv.drawString(44, H-253, 'desde el dashboard.')
blocks = [
    (48, H-320, MINT, 'AGENDA', ['Define dias y horarios disponibles','Slots: 30, 60 o 90 minutos','Timezone: America/Toronto','Activa/desactiva por dia']),
    (540, H-320, PURPLE_L, 'MENSAJES', ['Inbox con estado: nuevo/en progreso','Archiva conversaciones cerradas','Interacciones verificadas','Notificacion por email']),
    (48, H-630, HexColor('#60A5FA'), 'CHECKLIST DOCS', ['Crea listas de documentos por caso','Vinculada a una conversacion','El migrante ve que falta']),
    (540, H-630, GOLD, 'RESERVAS', ['Confirma/cancela citas entrantes','Video, telefono o presencial','Link de videollamada integrado','Agrega notas al migrante']),
]
for bx, by, col, title, items in blocks:
    bh = len(items)*30 + 60
    card(cv, bx, by-bh, 460, bh, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.setFont('Helvetica-Bold', 14); cv.drawString(bx+20, by-24, title)
    iy = by-52
    for item in items:
        cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 13); cv.drawString(bx+28, iy, f'- {item}'); iy-=28
btn(cv, 48, 60, '-> Ver mi dashboard', f'{BASE_URL}/dashboard', w=340, h=46, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 7
bg(cv); brand(cv, 7)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, '13 CATEGORIAS ACTIVAS')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 48); cv.drawString(44, H-195, 'Todo lo que necesitas')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-253, 'en un solo lugar.')
cats_full = [
    ('Alojamiento','Airbnb, habitaciones, arriendos'),('Tramites','SIN, permisos, documentos'),
    ('Trabajo','CV, agencias, orientacion'),('Finanzas','envios, cuentas, cambio'),
    ('Vuelos','pasajes, maletas, escala'),('Salud','medicos, farmacia, cobertura'),
    ('Educacion','ingles, cursos, titulos'),('Transporte','licencia, arriendo, carpool'),
    ('Comida','delivery, cocina, catering'),('Tecnologia','soporte, celular, SIM'),
    ('Moda','ropa, segunda mano, estilismo'),('Legal','visa, contratos, asesoria'),
    ('Bienestar','psicologo, yoga, comunidad')
]
col_w = (W-108)//3
for i,(name,desc) in enumerate(cats_full):
    col = i%3; row = i//3
    x = 48+col*(col_w+12); y = H-310-row*94
    card(cv, x, y, col_w, 82, fill=HexColor('#1A0A35'), border=CARD_BORDER)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 15); cv.drawString(x+14, y+52, name)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 11); cv.drawString(x+14, y+28, desc)
    cv.linkURL(BASE_URL, (x, y, x+col_w, y+82))
btn(cv, 48, 48, '-> Explorar todas las categorias', BASE_URL, w=420, h=46)
cv.showPage()

# SLIDE 8
bg(cv); brand(cv, 8)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 13); cv.drawString(48, H-120, 'COMO FUNCIONA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 54); cv.drawString(44, H-200, 'Simple. Seguro.')
cv.setFillColor(PURPLE_L); cv.drawString(44, H-264, 'Verificado.')
steps8 = [
    (PURPLE,'1','Busca','Explora el directorio por categoria'),
    (PURPLE_L,'2','Lee el perfil','TrustBadge + opiniones reales'),
    (GOLD,'3','Contacta','Mensaje directo en la plataforma'),
    (MINT,'4','Agenda','Video, telefono o presencial'),
    (HexColor('#F87171'),'5','Opina','Deja tu resena - comunidad mas fuerte')
]
fy = H-320; fh=114
for col,num,title,sub in steps8:
    card(cv, 48, fy, W-96, fh-4, fill=CARD_BG, border=col)
    cv.setFillColor(col); cv.circle(94, fy+(fh-4)//2, 30, fill=1, stroke=0)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 22); cv.drawCentredString(94, fy+(fh-4)//2-8, num)
    cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 20); cv.drawString(144, fy+(fh-4)//2+8, title)
    cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 15); cv.drawString(144, fy+(fh-4)//2-18, sub)
    fy -= fh+6
btn(cv, 48, 60, '-> Comenzar ahora', BASE_URL, w=300, h=46)
btn(cv, 368, 60, '-> Soy proveedor', f'{BASE_URL}/apply', w=280, h=46, bg=HexColor('#2D7A1A'))
cv.showPage()

# SLIDE 9
bg(cv, HexColor('#0D0520'), HexColor('#1A0A40')); brand(cv, 9)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 16); cv.drawCentredString(W//2, H-130, 'LA MANADA TE ESPERA')
cv.setFillColor(WHITE); cv.setFont('Helvetica-Bold', 72); cv.drawCentredString(W//2, H-230, 'Sin estafas.')
cv.setFillColor(PURPLE_L); cv.drawCentredString(W//2, H-316, 'Sin nada raro.')
cv.setFillColor(GOLD_L); cv.drawCentredString(W//2, H-402, 'Con la Manada.')
bar(cv, W//2-200, H-420, 400, GOLD)
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 18)
cv.drawCentredString(W//2, H-460, 'Directorio verificado para migrantes latinoamericanos en Canada')
btn(cv, W//2-360, H-560, '-> Entrar como migrante', BASE_URL, w=340, h=54)
btn(cv, W//2+10, H-560, '-> Aplicar como proveedor', f'{BASE_URL}/apply', w=340, h=54, bg=HexColor('#2D7A1A'))
card(cv, W//2-420, H-660, 840, 80, fill=CARD_BG, border=CARD_BORDER)
cv.setFillColor(GOLD); cv.setFont('Helvetica-Bold', 15)
cv.drawCentredString(W//2, H-608, 'La comunidad pregunta. La IA construye. Tu decides que se publica.')
cv.setFillColor(LIGHT_TEXT); cv.setFont('Helvetica', 12)
cv.drawCentredString(W//2, H-630, '- Francisco Reyes, fundador SoyManada')
cv.setFillColor(HexColor('#3D1A78')); cv.setFont('Helvetica', 12)
cv.drawCentredString(W//2, 100, 'React 18 - Vite 5 - Supabase - Resend - i18next - GitHub Pages')
cv.drawCentredString(W//2, 74, '#SoyManada  #BuildInPublic  #ComunidadPrimero  #ReactJS  #Latam  #WHV')
btn(cv, W//2-160, 24, '-> soymanada.com', BASE_URL, w=320, h=44)
cv.save()
print('PDF generado:', PDF_OUT)
