#!/usr/bin/env python3
"""Gera as imagens otimizadas (WebP) em public/img a partir de assets-src/img.

Uso (na raiz do repositório):  python3 scripts/optimize-images.py
Requer: Pillow (pip install pillow). Não faz parte do build do site: rode
somente quando trocar/adicionar uma imagem de origem e faça commit do resultado.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets-src" / "img"
OUT = ROOT / "public" / "img"


def save_webp(img, dest, width, quality=80):
    img = img.convert("RGB")
    if img.width > width:
        img = img.resize((width, round(img.height * width / img.width)), Image.LANCZOS)
    dest.parent.mkdir(parents=True, exist_ok=True)
    img.save(dest, "WEBP", quality=quality, method=6)
    print(f"{dest.relative_to(ROOT)}  {img.size}  {dest.stat().st_size // 1024} KB")


# Foto principal: recorte quadrado centrado no rosto (a foto original é 960x1010
# com a pessoa deslocada para a esquerda; o recorte automático "center" cortava mal).
hero = Image.open(SRC / "image.png").convert("RGB")
hero_sq = hero.crop((20, 140, 820, 940))
save_webp(hero_sq, OUT / "hero-400.webp", 400)
save_webp(hero_sq, OUT / "hero-720.webp", 720)

# Capas de projetos e bots (mantêm a proporção original).
save_webp(Image.open(SRC / "homelab.png"), OUT / "projects" / "portfolio.webp", 800)
save_webp(Image.open(SRC / "discord-bots.png"), OUT / "projects" / "discord-bots.webp", 800)
save_webp(Image.open(SRC / "ui-cyber.png"), OUT / "projects" / "ui-cyber.webp", 800)
save_webp(Image.open(SRC / "emebedgen.png"), OUT / "bots" / "embedgen.webp", 480)
save_webp(Image.open(SRC / "discord-bots.png"), OUT / "bots" / "discord-bots.webp", 640)
save_webp(Image.open(SRC / "encomenda.jpg"), OUT / "bots" / "custom.webp", 640)

# Imagem padrão de compartilhamento (Open Graph) 1200x630, em JPEG por compatibilidade.
W, H = 1200, 630
og = Image.new("RGB", (W, H), (7, 6, 15))
d = ImageDraw.Draw(og)
for y in range(H):  # degradê vertical bem suave, roxo escuro -> preto
    t = y / H
    d.line([(0, y), (W, y)], fill=(int(21 * (1 - t) + 4 * t), int(16 * (1 - t) + 3 * t), int(58 * (1 - t) + 8 * t)))


def font(size, bold=False):
    for p in (
        "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf",
        "/usr/share/fonts/truetype/liberation/LiberationSans-Bold.ttf" if bold else "/usr/share/fonts/truetype/liberation/LiberationSans-Regular.ttf",
    ):
        if Path(p).exists():
            return ImageFont.truetype(p, size)
    return ImageFont.load_default()


d.rectangle([80, 250, 140, 254], fill=(94, 231, 231))
d.text((80, 275), "Caetano Guisso", font=font(84, True), fill=(241, 241, 246))
d.text((80, 385), "Desenvolvedor Backend", font=font(40), fill=(94, 231, 231))
d.text((80, 540), "cae.guisso.dev", font=font(28), fill=(180, 180, 199))
photo = hero_sq.resize((300, 300), Image.LANCZOS)
mask = Image.new("L", (300, 300), 0)
ImageDraw.Draw(mask).ellipse((0, 0, 299, 299), fill=255)
d.ellipse((800 - 4, 165 - 4, 1100 + 4, 465 + 4), outline=(94, 231, 231), width=3)
og.paste(photo, (800, 165), mask)
og.save(OUT / "og-default.jpg", "JPEG", quality=85, optimize=True)
print("public/img/og-default.jpg", og.size, (OUT / "og-default.jpg").stat().st_size // 1024, "KB")
