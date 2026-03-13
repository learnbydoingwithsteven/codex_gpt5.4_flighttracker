from __future__ import annotations

from pathlib import Path
from typing import Iterable

from PIL import Image, ImageDraw, ImageFont, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
IMAGES_DIR = ROOT / "images"
CAPTURES_DIR = ROOT / "media_assets" / "captures"
WATERMARK = "learn by doing with steven数能生智"
CARD_SIZE = (1080, 1280)
BG = (6, 10, 22)
TEXT = (239, 246, 255)
MUTED = (158, 180, 209)
ACCENT = (255, 142, 60)
COOL = (125, 211, 252)

FONT_CANDIDATES_SANS = [
    Path(r"C:\Windows\Fonts\msyh.ttc"),
    Path(r"C:\Windows\Fonts\segoeuib.ttf"),
    Path(r"C:\Windows\Fonts\segoeui.ttf"),
]
FONT_CANDIDATES_MONO = [
    Path(r"C:\Windows\Fonts\consola.ttf"),
    Path(r"C:\Windows\Fonts\cour.ttf"),
]


SEGMENTS = [
    {
        "title": "Live 3D Flight Tracker",
        "subtitle": "OpenSky aircraft positions visualized on a rotatable globe",
        "body": [
            "Global traffic rendered on a 3D Earth",
            "Real-time polling and scene updates",
            "Readable command-style interface",
        ],
        "capture": "dashboard-global.png",
    },
    {
        "title": "Frontend Stack",
        "subtitle": "Vite + React + react-three-fiber + drei + postprocessing",
        "body": [
            "Declarative scene composition",
            "Camera, lighting, bloom, and controls",
            "Production-oriented React application shell",
        ],
        "code": [
            "Canvas -> Earth -> AircraftLayer",
            "OrbitControls -> adaptive DPR",
            "Bloom + vignette + chromatic aberration",
        ],
    },
    {
        "title": "OpenSky Data Pipeline",
        "subtitle": "Normalization, filtering, bounds, and refresh control",
        "body": [
            "Converts raw OpenSky tuples into typed flight records",
            "Rejects stale and grounded aircraft",
            "Applies region filters and performance caps",
        ],
        "code": [
            "fetchOpenSkyFlights({ bounds, limit })",
            "normalizeFlight(tuple) -> FlightRecord",
            "sort by recency + altitude + velocity",
        ],
    },
    {
        "title": "Smooth Motion Prediction",
        "subtitle": "Great-circle prediction between polling intervals",
        "body": [
            "Uses heading, velocity, and vertical rate",
            "Predicts latitude and longitude before next poll",
            "Maps altitude directly into globe radius",
        ],
        "code": [
            "predictFlightPosition(flight, timestampMs)",
            "latLonToVector3(latitude, longitude, altitude)",
            "group.position.lerp(origin, smoothing)",
        ],
    },
    {
        "title": "Rendering The Globe",
        "subtitle": "Procedural earth textures, clouds, glow, stars, and bloom",
        "body": [
            "Procedural land and emissive night detail",
            "Cloud shell and atmospheric halo",
            "Lighting tuned for marker visibility",
        ],
        "capture": "dashboard-europe.png",
    },
    {
        "title": "Controls And Telemetry",
        "subtitle": "Region presets, traffic caps, selection, and responsive layout",
        "body": [
            "Desktop control panel and stats strip",
            "Aircraft detail card with live telemetry",
            "Responsive mobile view for narrow screens",
        ],
        "captures": ["dashboard-europe-180.png", "mobile-view.png"],
    },
    {
        "title": "Verified Delivery Pipeline",
        "subtitle": "Build, media capture, narration, and branded export",
        "body": [
            "Production build verified successfully",
            "Screenshots and highlight sequences captured from the running app",
            "Reusable scripts export final English and Chinese vertical videos",
        ],
        "code": [
            "npm run build",
            "node scripts/capture_highlights.mjs",
            "python scripts/assemble_vertical_video.py",
        ],
    },
]


def choose_font(candidates: Iterable[Path], size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in candidates:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


SANS_64 = choose_font(FONT_CANDIDATES_SANS, 64)
SANS_38 = choose_font(FONT_CANDIDATES_SANS, 38)
SANS_30 = choose_font(FONT_CANDIDATES_SANS, 30)
SANS_28 = choose_font(FONT_CANDIDATES_SANS, 28)
SANS_24 = choose_font(FONT_CANDIDATES_SANS, 24)
MONO_24 = choose_font(FONT_CANDIDATES_MONO, 24)


def rounded_panel(draw: ImageDraw.ImageDraw, xy, fill, outline=None, width=1, radius=32):
    draw.rounded_rectangle(xy, radius=radius, fill=fill, outline=outline, width=width)


def add_header(draw: ImageDraw.ImageDraw):
    rounded_panel(draw, (40, 34, 1040, 106), fill=(9, 18, 35, 210), outline=(90, 126, 183, 55), width=2, radius=26)
    draw.text((68, 55), WATERMARK, font=SANS_24, fill=(239, 246, 255, 180))


def add_gradient_glow(canvas: Image.Image):
    glow = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    glow_draw = ImageDraw.Draw(glow)
    glow_draw.ellipse((760, -120, 1240, 360), fill=(41, 121, 255, 70))
    glow_draw.ellipse((-120, 40, 340, 420), fill=(255, 142, 60, 70))
    glow = glow.filter(ImageFilter.GaussianBlur(80))
    canvas.alpha_composite(glow)


def add_title_block(draw: ImageDraw.ImageDraw, title: str, subtitle: str):
    draw.text((56, 156), title, font=SANS_64, fill=TEXT)
    draw.text((56, 242), subtitle, font=SANS_30, fill=MUTED)


def add_bullets(draw: ImageDraw.ImageDraw, lines: list[str], top: int):
    for idx, line in enumerate(lines):
        y = top + idx * 48
        draw.ellipse((60, y + 12, 76, y + 28), fill=ACCENT)
        draw.text((96, y), line, font=SANS_28, fill=TEXT)


def fit_image(image: Image.Image, target: tuple[int, int]) -> Image.Image:
    copy = image.copy()
    copy.thumbnail(target, Image.Resampling.LANCZOS)
    return copy


def add_capture_panel(canvas: Image.Image, image_name: str, box: tuple[int, int, int, int]):
    capture = Image.open(CAPTURES_DIR / image_name).convert("RGBA")
    target = fit_image(capture, (box[2] - box[0] - 36, box[3] - box[1] - 36))
    frame = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    frame_draw = ImageDraw.Draw(frame)
    rounded_panel(frame_draw, box, fill=(8, 18, 36, 245), outline=(120, 168, 230, 55), width=2, radius=28)
    x = box[0] + ((box[2] - box[0]) - target.width) // 2
    y = box[1] + ((box[3] - box[1]) - target.height) // 2
    frame.alpha_composite(target, (x, y))
    canvas.alpha_composite(frame)


def add_dual_capture_panel(canvas: Image.Image, left_image: str, right_image: str, box: tuple[int, int, int, int]):
    frame = Image.new("RGBA", CARD_SIZE, (0, 0, 0, 0))
    frame_draw = ImageDraw.Draw(frame)
    rounded_panel(frame_draw, box, fill=(8, 18, 36, 245), outline=(120, 168, 230, 55), width=2, radius=28)
    left_box = (box[0] + 22, box[1] + 22, box[0] + 670, box[3] - 22)
    right_box = (box[0] + 706, box[1] + 22, box[2] - 22, box[3] - 22)
    frame.alpha_composite(fit_image(Image.open(CAPTURES_DIR / left_image).convert("RGBA"), (left_box[2] - left_box[0], left_box[3] - left_box[1])), (left_box[0], left_box[1]))
    frame.alpha_composite(fit_image(Image.open(CAPTURES_DIR / right_image).convert("RGBA"), (right_box[2] - right_box[0], right_box[3] - right_box[1])), (right_box[0], right_box[1]))
    canvas.alpha_composite(frame)


def add_code_panel(draw: ImageDraw.ImageDraw, lines: list[str], box: tuple[int, int, int, int]):
    rounded_panel(draw, box, fill=(9, 18, 35, 245), outline=(90, 126, 183, 55), width=2, radius=28)
    draw.text((box[0] + 28, box[1] + 22), "Implementation View", font=SANS_24, fill=COOL)
    for index, line in enumerate(lines):
        y = box[1] + 74 + index * 62
        draw.text((box[0] + 28, y), f"{index + 1:02d}", font=MONO_24, fill=(125, 211, 252))
        draw.text((box[0] + 88, y), line, font=MONO_24, fill=TEXT)


def add_footer(draw: ImageDraw.ImageDraw, page: int):
    draw.text((58, 1220), f"Segment {page}/7", font=SANS_24, fill=(255, 225, 196))
    draw.text((820, 1220), "Objective codebase brief", font=SANS_24, fill=(158, 180, 209))


def build_image(index: int, spec: dict):
    canvas = Image.new("RGBA", CARD_SIZE, BG + (255,))
    add_gradient_glow(canvas)
    draw = ImageDraw.Draw(canvas)
    add_header(draw)
    add_title_block(draw, spec["title"], spec["subtitle"])
    add_bullets(draw, spec["body"], 332)

    if "capture" in spec:
        add_capture_panel(canvas, spec["capture"], (52, 514, 1028, 1166))
    elif "captures" in spec:
        add_dual_capture_panel(canvas, spec["captures"][0], spec["captures"][1], (52, 514, 1028, 1166))
    else:
        add_code_panel(draw, spec["code"], (52, 514, 1028, 1166))

    add_footer(draw, index)
    canvas.convert("RGB").save(IMAGES_DIR / f"image_{index}.png", quality=95)


if __name__ == "__main__":
    IMAGES_DIR.mkdir(parents=True, exist_ok=True)
    for index, spec in enumerate(SEGMENTS, start=1):
        build_image(index, spec)

