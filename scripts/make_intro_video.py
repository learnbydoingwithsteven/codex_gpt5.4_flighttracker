from __future__ import annotations

import os
from pathlib import Path

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ffmpeg_dir = str(Path(imageio_ffmpeg.get_ffmpeg_exe()).parent)
os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

from manim import Arc, Circle, Dot, DOWN, FadeIn, FadeOut, Group, LaggedStart, LEFT, Line, ORIGIN, RIGHT, Scene, Text, UP, VGroup, config, Create, Write  # noqa: E402
from moviepy import AudioClip, ColorClip, CompositeVideoClip, ImageClip, ImageSequenceClip, VideoFileClip, concatenate_videoclips  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
CAPTURES = ROOT / "media_assets" / "captures"
FRAMES = CAPTURES / "frames"
OUTPUT = ROOT / "media_assets" / "output"
MANIM_DIR = ROOT / "media_assets" / "manim"
OUTPUT.mkdir(parents=True, exist_ok=True)

FONT_CANDIDATES = [
    Path(r"C:\Windows\Fonts\msyh.ttc"),
    Path(r"C:\Windows\Fonts\msyhbd.ttc"),
    Path(r"C:\Windows\Fonts\segoeui.ttf"),
]

WATERMARK = "learn by doing with steven数能生智"


def font_path() -> str:
    for candidate in FONT_CANDIDATES:
        if candidate.exists():
            return str(candidate)
    return ""


def font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    chosen = font_path()
    if chosen:
        return ImageFont.truetype(chosen, size=size)
    return ImageFont.load_default()


def make_text_panel(
    text: str,
    output_name: str,
    width: int,
    font_size: int,
    fill=(239, 246, 255, 255),
    background=(7, 17, 34, 205),
    stroke=(136, 176, 233, 90),
) -> Path:
    padding = 34
    panel = Image.new("RGBA", (width, 220), (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)
    rect = (0, 0, width - 1, 219)
    draw.rounded_rectangle(rect, radius=28, fill=background, outline=stroke, width=2)
    content_font = font(font_size)
    draw.multiline_text(
        (padding, 34),
        text,
        font=content_font,
        fill=fill,
        spacing=10,
        align="left",
    )
    path = OUTPUT / output_name
    panel.save(path)
    return path


def make_watermark() -> Path:
    image = Image.new("RGBA", (600, 70), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, 599, 69), radius=22, fill=(6, 14, 28, 110))
    draw.text((18, 17), WATERMARK, font=font(26), fill=(239, 246, 255, 170))
    path = OUTPUT / "watermark.png"
    image.save(path)
    return path


class ObjectiveIntro(Scene):
    def construct(self):
        title = Text("Orbital Airspace", font_size=56, color="#EFF6FF")
        subtitle = Text(
            "React + Vite + Three.js flight tracking\nwith live OpenSky aircraft states",
            font_size=24,
            color="#9EB4D1",
            line_spacing=1.1,
        )
        subtitle.next_to(title, DOWN, buff=0.4)

        rings = VGroup(
            Circle(radius=1.2, color="#7DD3FC", stroke_opacity=0.3),
            Circle(radius=1.75, color="#FF8E3C", stroke_opacity=0.22),
            Arc(radius=2.25, start_angle=0.2, angle=4.4, color="#58A6FF", stroke_opacity=0.25),
        ).shift(LEFT * 4.1)

        globe = Circle(radius=0.82, color="#58A6FF", fill_color="#123A68", fill_opacity=1).move_to(rings.get_center())
        axis = Line(globe.get_top() * 0.88, globe.get_bottom() * 0.88, color="#8AD4FF", stroke_opacity=0.35)
        stack = VGroup(
            Text("Live OpenSky data", font_size=20, color="#EFF6FF"),
            Text("Smooth interpolation", font_size=20, color="#EFF6FF"),
            Text("Altitude-accurate globe", font_size=20, color="#EFF6FF"),
        ).arrange(DOWN, aligned_edge=ORIGIN, buff=0.22).shift(RIGHT * 2.5 + DOWN * 0.2)

        self.play(LaggedStart(*[Create(ring) for ring in rings], lag_ratio=0.15), run_time=1.4)
        self.play(FadeIn(globe), FadeIn(axis), run_time=0.6)
        self.play(Write(title), FadeIn(subtitle, shift=UP * 0.15), run_time=1.2)
        self.play(LaggedStart(*[FadeIn(item, shift=RIGHT * 0.18) for item in stack], lag_ratio=0.2), run_time=1.2)
        self.wait(1.6)
        self.play(FadeOut(Group(title, subtitle, rings, globe, axis, stack)), run_time=0.7)


class ObjectiveOutro(Scene):
    def construct(self):
        heading = Text("Objective project summary", font_size=42, color="#EFF6FF").shift(UP * 2.3)
        bullets = VGroup(
            Text("3D Earth scene with polished lighting and bloom", font_size=26, color="#EFF6FF"),
            Text("Real-time polling pipeline for OpenSky aircraft states", font_size=26, color="#EFF6FF"),
            Text("Predictive motion smoothing between API refreshes", font_size=26, color="#EFF6FF"),
            Text("Responsive dashboard with controls and telemetry panels", font_size=26, color="#EFF6FF"),
        ).arrange(DOWN, aligned_edge=LEFT, buff=0.4)
        bullets.shift(UP * 0.15)
        accents = VGroup(
            Dot(color="#FF8E3C", radius=0.06).next_to(bullets[0], LEFT, buff=0.3),
            Dot(color="#FF8E3C", radius=0.06).next_to(bullets[1], LEFT, buff=0.3),
            Dot(color="#FF8E3C", radius=0.06).next_to(bullets[2], LEFT, buff=0.3),
            Dot(color="#FF8E3C", radius=0.06).next_to(bullets[3], LEFT, buff=0.3),
        )

        self.play(Write(heading), run_time=0.8)
        self.play(LaggedStart(*[FadeIn(item, shift=RIGHT * 0.16) for item in bullets], lag_ratio=0.15), run_time=1.3)
        self.play(FadeIn(accents), run_time=0.6)
        self.wait(1.3)


def render_manim_scene(scene_cls, output_name: str) -> Path:
    config.background_color = "#020611"
    config.pixel_width = 1280
    config.pixel_height = 720
    config.frame_rate = 30
    config.media_dir = str(MANIM_DIR)
    config.output_file = output_name
    config.quality = "high_quality"
    scene = scene_cls()
    scene.render()
    return Path(scene.renderer.file_writer.movie_file_path)


def overlay_watermark(base_clip, watermark_path: Path):
    watermark_clip = (
        ImageClip(str(watermark_path))
        .with_duration(base_clip.duration)
        .resized(width=360)
        .with_position((base_clip.w - 390, base_clip.h - 90))
    )
    return CompositeVideoClip([base_clip, watermark_clip], size=(base_clip.w, base_clip.h))


def make_caption(text: str, name: str, width: int = 900) -> ImageClip:
    path = make_text_panel(text, name, width, 30)
    return ImageClip(str(path)).with_duration(1)


def screenshot_clip(image_path: Path, caption_text: str, duration: float, caption_name: str):
    base = ColorClip((1280, 720), color=(2, 6, 17)).with_duration(duration)
    shot = (
        ImageClip(str(image_path))
        .with_duration(duration)
        .resized(width=1140)
        .with_position(("center", 48))
        .resized(lambda t: 1.0 + 0.05 * min(t / duration, 1))
    )
    caption_path = make_text_panel(caption_text, caption_name, 980, 30)
    caption = (
        ImageClip(str(caption_path))
        .with_duration(duration)
        .with_position(("center", 560))
    )
    return CompositeVideoClip([base, shot, caption], size=(1280, 720))


def dual_screenshot_clip(left_path: Path, right_path: Path, duration: float):
    base = ColorClip((1280, 720), color=(2, 6, 17)).with_duration(duration)
    left = (
        ImageClip(str(left_path))
        .with_duration(duration)
        .resized(width=660)
        .with_position((40, 110))
    )
    right = (
        ImageClip(str(right_path))
        .with_duration(duration)
        .resized(width=340)
        .with_position((900, 120))
    )
    caption_path = make_text_panel(
        "Region presets, traffic caps, and responsive layout keep the visualization legible across desktop and mobile.",
        "caption-layout.png",
        1180,
        28,
    )
    caption = ImageClip(str(caption_path)).with_duration(duration).with_position(("center", 560))
    return CompositeVideoClip([base, left, right, caption], size=(1280, 720))


def build_highlight_gif_and_mp4() -> tuple[Path, Path]:
    frame_paths = sorted(FRAMES.glob("frame-*.png"))
    if not frame_paths:
        raise FileNotFoundError("No captured highlight frames were found.")

    frames = [Image.open(frame).convert("RGB") for frame in frame_paths]
    gif_path = OUTPUT / "flight-highlights.gif"
    frames[0].save(
        gif_path,
        save_all=True,
        append_images=frames[1:],
        duration=160,
        loop=0,
        optimize=False,
    )

    sequence = ImageSequenceClip([str(path) for path in frame_paths], fps=6)
    mp4_path = OUTPUT / "flight-highlights.mp4"
    sequence.write_videofile(str(mp4_path), fps=30, codec="libx264", audio=False, logger=None)
    sequence.close()
    for frame in frames:
        frame.close()
    return gif_path, mp4_path


def build_final_video():
    intro_path = render_manim_scene(ObjectiveIntro, "objective_intro")
    outro_path = render_manim_scene(ObjectiveOutro, "objective_outro")
    watermark_path = make_watermark()
    _, highlight_mp4 = build_highlight_gif_and_mp4()

    intro_clip = overlay_watermark(VideoFileClip(str(intro_path)), watermark_path)
    scene_one = overlay_watermark(
        screenshot_clip(
            CAPTURES / "dashboard-global.png",
            "The interface centers the project goal: live OpenSky aircraft rendered on a rotatable 3D Earth with command-style HUD panels.",
            6.5,
            "caption-global.png",
        ),
        watermark_path,
    )
    highlight_source = VideoFileClip(str(highlight_mp4)).without_audio()
    highlight_loop = concatenate_videoclips([highlight_source, highlight_source, highlight_source]).subclipped(0, 7)
    highlight_clip = overlay_watermark(
        CompositeVideoClip(
            [
                ColorClip((1280, 720), color=(2, 6, 17)).with_duration(7),
                highlight_loop.resized(width=1120).with_position(("center", 46)),
                ImageClip(
                    str(
                        make_text_panel(
                            "Aircraft markers move continuously between polls by extrapolating heading, speed, and climb rate rather than jumping on refresh.",
                            "caption-highlight.png",
                            1040,
                            30,
                        )
                    )
                )
                .with_duration(7)
                .with_position(("center", 560)),
            ],
            size=(1280, 720),
        ),
        watermark_path,
    )
    region_clip = overlay_watermark(
        screenshot_clip(
            CAPTURES / "dashboard-europe.png",
            "Region targeting narrows the stream to dense corridors like Europe, keeping the globe readable while preserving live traffic density.",
            6.0,
            "caption-europe.png",
        ),
        watermark_path,
    )
    responsive_clip = overlay_watermark(
        dual_screenshot_clip(CAPTURES / "dashboard-europe-180.png", CAPTURES / "mobile-view.png", 6.0),
        watermark_path,
    )
    outro_clip = overlay_watermark(VideoFileClip(str(outro_path)), watermark_path)

    final = concatenate_videoclips(
        [intro_clip, scene_one, highlight_clip, region_clip, responsive_clip, outro_clip],
        method="compose",
    )
    final.write_videofile(
        str(OUTPUT / "project_intro.mp4"),
        fps=30,
        codec="libx264",
        audio=False,
        logger=None,
    )

    for clip in [highlight_source, highlight_loop, intro_clip, scene_one, highlight_clip, region_clip, responsive_clip, outro_clip, final]:
        clip.close()


if __name__ == "__main__":
    build_final_video()
