# Genera los íconos de la app a partir de la foto de images.js.
import re, io, base64, math, os
from PIL import Image, ImageDraw
src = open('images.js', encoding='utf-8').read()
rock = re.search(r"rock:'data:image/webp;base64,([^']+)'", src).group(1)
head = Image.open(io.BytesIO(base64.b64decode(rock))).convert('RGBA')
BG, RAY, FRAME, GOLD, INK = (30, 58, 50, 255), (40, 72, 62, 255), (107, 74, 46, 255), (255, 201, 74), (25, 12, 30)
def star(d, x, y, r):
    pts = [(x + (r if i % 2 == 0 else r * .45) * math.cos(i * math.pi / 5 - math.pi / 2), y + (r if i % 2 == 0 else r * .45) * math.sin(i * math.pi / 5 - math.pi / 2)) for i in range(10)]
    d.polygon(pts, fill=GOLD, outline=INK, width=max(1, int(r * .15)))
def icon(size, maskable, path, opaque=False):
    s = size
    im = Image.new('RGBA', (s, s), BG if (maskable or opaque) else (0, 0, 0, 0))
    d = ImageDraw.Draw(im)
    if not (maskable or opaque):
        d.rounded_rectangle((0, 0, s - 1, s - 1), radius=int(s * .22), fill=BG)
    lay = Image.new('RGBA', (s, s), (0, 0, 0, 0)); ld = ImageDraw.Draw(lay)
    for i in range(10):
        a = i * math.pi / 5
        ld.polygon([(s / 2, s / 2), (s / 2 + s * math.cos(a - .12), s / 2 + s * math.sin(a - .12)), (s / 2 + s * math.cos(a + .12), s / 2 + s * math.sin(a + .12))], fill=RAY)
    mask = im.split()[3]
    im.alpha_composite(Image.composite(lay, Image.new('RGBA', (s, s), (0, 0, 0, 0)), mask))
    d = ImageDraw.Draw(im)
    if not maskable:
        d.rounded_rectangle((s * .06, s * .06, s * .94, s * .94), radius=int(s * .18), outline=FRAME, width=max(2, int(s * .035)))
    k = (.62 if maskable else .74) * s / head.width
    h = head.resize((int(head.width * k), int(head.height * k)), Image.LANCZOS)
    im.alpha_composite(h, ((s - h.width) // 2, int(s * .5 - h.height * .5)))
    star(d, s * (.74 if maskable else .82), s * (.26 if maskable else .2), s * (.05 if maskable else .07))
    im = im.convert('RGB') if opaque else im
    im.save(path, optimize=True)
os.makedirs('site/icons', exist_ok=True)
icon(192, False, 'site/icons/icon-192.png')
icon(512, False, 'site/icons/icon-512.png')
icon(512, True, 'site/icons/maskable-512.png')
icon(180, False, 'site/icons/apple-touch-icon.png', opaque=True)
icon(64, False, 'site/icons/favicon.png')
print('Íconos listos')
