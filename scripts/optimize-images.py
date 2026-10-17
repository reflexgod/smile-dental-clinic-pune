"""Convert editorial source JPGs from the brain directory into responsive WebP assets + OG image."""
from pathlib import Path
from PIL import Image, ImageOps

BRAIN = Path(r"C:\Users\viraa\.gemini\antigravity\brain\c67e1ee5-39db-4f9c-904e-a4389c06549d")
OUT = Path(__file__).resolve().parent.parent / "assets" / "images"
OUT.mkdir(parents=True, exist_ok=True)

SOURCES = {
    "hero": ("hero_1792234127622.jpg", [720, 896]),
    "smile": ("smile_1792234148779.jpg", [640]),
    "care": ("care_1792234170251.jpg", [800, 1264]),
    "reception": ("reception_1792234188566.jpg", [800, 1264]),
    "dentist": ("dentist_clean_portrait_1792237692521.jpg", [720]),
    "studio": ("studio_consultation_1792237716264.jpg", [800, 1264]),
}

for name, (filename, widths) in SOURCES.items():
    src = BRAIN / filename
    img = ImageOps.exif_transpose(Image.open(src)).convert("RGB")
    for w in widths:
        w_actual = min(w, img.width)
        h = round(img.height * w_actual / img.width)
        out = OUT / f"{name}-{w}.webp"
        img.resize((w_actual, h), Image.LANCZOS).save(out, "WEBP", quality=80, method=6)
        print(f"{out.name}: {w_actual}x{h} ({out.stat().st_size // 1024} KB)")

og = ImageOps.fit(Image.open(BRAIN / "reception_1792234188566.jpg").convert("RGB"), (1200, 630), Image.LANCZOS)
og.save(OUT / "og-image.jpg", "JPEG", quality=82, optimize=True, progressive=True)
print("og-image.jpg written")
