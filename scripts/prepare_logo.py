from pathlib import Path

try:
    from PIL import Image
except ImportError as exc:
    raise SystemExit(
        "Pillow is required. Install with: pip install pillow"
    ) from exc


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "logo-source.png"
WEBUI_TARGET = ROOT / "webui" / "assets" / "logo-transparent.png"
APP_ICON_TARGET = ROOT / "icon.png"


def make_transparent(source: Path, output: Path, threshold: int = 18) -> None:
    image = Image.open(source).convert("RGBA")
    pixels = image.getdata()

    sampled = [
        pixels[0],
        pixels[image.width - 1],
        pixels[(image.height - 1) * image.width],
        pixels[-1],
    ]
    avg_r = sum(px[0] for px in sampled) // len(sampled)
    avg_g = sum(px[1] for px in sampled) // len(sampled)
    avg_b = sum(px[2] for px in sampled) // len(sampled)

    new_pixels = []
    for r, g, b, a in pixels:
        distance = abs(r - avg_r) + abs(g - avg_g) + abs(b - avg_b)
        if distance <= threshold:
            new_pixels.append((r, g, b, 0))
        else:
            new_pixels.append((r, g, b, a))

    image.putdata(new_pixels)
    output.parent.mkdir(parents=True, exist_ok=True)
    image.save(output, "PNG")


def make_icon(source: Path, output: Path) -> None:
    image = Image.open(source).convert("RGBA")
    image.thumbnail((256, 256), Image.Resampling.LANCZOS)
    canvas = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
    x = (256 - image.width) // 2
    y = (256 - image.height) // 2
    canvas.paste(image, (x, y), image)
    canvas.save(output, "PNG")


def main() -> None:
    if not SOURCE.exists():
        raise SystemExit(
            f"Missing source image: {SOURCE}\n"
            "Place your logo image there as logo-source.png and rerun."
        )

    make_transparent(SOURCE, WEBUI_TARGET)
    make_icon(WEBUI_TARGET, APP_ICON_TARGET)

    print(f"Generated dashboard logo: {WEBUI_TARGET}")
    print(f"Generated app icon: {APP_ICON_TARGET}")


if __name__ == "__main__":
    main()
