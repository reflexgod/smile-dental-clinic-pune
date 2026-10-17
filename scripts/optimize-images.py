"""Convert source JPGs in assets/images/src into responsive WebP files + an OG image.

Usage (from the project root):  python scripts/optimize-images.py
Requires Pillow (pip install pillow). Source images are kept out of the deployed site.
"""
from pathlib import Path
from PIL import Image, ImageOps

ROOT = Path(__file__).resolve().parent.parent
SRC = ROOT / "assets" / "images" / "src"
OUT = ROOT / "assets" / "images"

# name -> list of output widths
SIZES = {
    "hero": [720, 896],
    "smile": [640],
    "care": [800, 1264],
    "reception": [800, 1264],
}

for name, widths in SIZES.items():
    src = SRC / f"{name}.jpg"
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for w in widths:
        h = round(img.height * w / img.width)
        out = OUT / f"{name}-{w}.webp"
        img.resize((w, h), Image.LANCZOS).save(out, "WEBP", quality=78, method=6)
        print(f"{out.name}: {w}x{h} {out.stat().st_size // 1024} KB")

# Social share image (1200x630), cropped from the reception shot
og = ImageOps.fit(Image.open(SRC / "reception.jpg").convert("RGB"), (1200, 630), Image.LANCZOS)
og.save(OUT / "og-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)
print("og-image.jpg written")
