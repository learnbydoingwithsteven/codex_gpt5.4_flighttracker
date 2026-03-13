from __future__ import annotations

import argparse
import os
import re
from pathlib import Path
from typing import Iterable

import imageio_ffmpeg
from PIL import Image, ImageDraw, ImageFont

ffmpeg_dir = str(Path(imageio_ffmpeg.get_ffmpeg_exe()).parent)
os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

from moviepy import AudioFileClip, ColorClip, CompositeVideoClip, ImageClip, VideoFileClip, concatenate_videoclips  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
SEGMENT_PATTERN = re.compile(r"## Segment (\d+):.*?\*\*Audio:\*\* (.*?)(?=\n##|\Z)", re.DOTALL)
FONT_CANDIDATES = [
    Path(r"C:\Windows\Fonts\msyh.ttc"),
    Path(r"C:\Windows\Fonts\segoeui.ttf"),
]
WATERMARK = "learn by doing with steven数能生智"
VIDEO_W = 1080
VIDEO_H = 1920


def choose_font(size: int) -> ImageFont.FreeTypeFont | ImageFont.ImageFont:
    for candidate in FONT_CANDIDATES:
        if candidate.exists():
            return ImageFont.truetype(str(candidate), size=size)
    return ImageFont.load_default()


def wrap_text(draw: ImageDraw.ImageDraw, text: str, font_obj, max_width: int) -> str:
    text = text.strip()
    if not text:
        return ""

    cjk_heavy = sum(1 for char in text if ord(char) > 127) > len(text) // 3
    if cjk_heavy:
        lines: list[str] = []
        current = ""
        for char in text:
            candidate = current + char
            width = draw.textbbox((0, 0), candidate, font=font_obj)[2]
            if width <= max_width or not current:
                current = candidate
            else:
                lines.append(current)
                current = char
        if current:
            lines.append(current)
        return "\n".join(lines)

    words = text.split()
    lines: list[str] = []
    current = words[0]

    for word in words[1:]:
        candidate = f"{current} {word}"
        width = draw.textbbox((0, 0), candidate, font=font_obj)[2]
        if width <= max_width:
            current = candidate
        else:
            lines.append(current)
            current = word

    lines.append(current)
    return "\n".join(lines)


def text_panel_path(text: str, output_path: Path, title: str | None = None) -> Path:
    panel = Image.new("RGBA", (VIDEO_W - 90, 520), (0, 0, 0, 0))
    draw = ImageDraw.Draw(panel)
    draw.rounded_rectangle((0, 0, panel.width - 1, panel.height - 1), radius=32, fill=(12, 24, 46, 220), outline=(110, 160, 220, 80), width=2)
    body_font = choose_font(36)
    if title:
        draw.text((36, 28), title, font=choose_font(26), fill=(125, 211, 252, 255))
        y = 92
    else:
        y = 36
    wrapped = wrap_text(draw, text, body_font, panel.width - 72)
    draw.multiline_text((36, y), wrapped, font=body_font, fill=(239, 246, 255, 255), spacing=14)
    panel.save(output_path)
    return output_path


def watermark_path(output_path: Path) -> Path:
    image = Image.new("RGBA", (620, 72), (0, 0, 0, 0))
    draw = ImageDraw.Draw(image)
    draw.rounded_rectangle((0, 0, 619, 71), radius=24, fill=(5, 14, 26, 125))
    draw.text((20, 18), WATERMARK, font=choose_font(28), fill=(239, 246, 255, 195))
    image.save(output_path)
    return output_path


def parse_segments(transcript_path: Path) -> list[tuple[str, str]]:
    content = transcript_path.read_text(encoding="utf-8")
    return SEGMENT_PATTERN.findall(content)


def build_segment_clip(segment_no: str, text: str, images_dir: Path, audio_dir: Path, temp_dir: Path):
    audio = AudioFileClip(str(audio_dir / f"seg_{segment_no}.mp3"))
    duration = audio.duration + 0.2
    background = ColorClip((VIDEO_W, VIDEO_H), color=(10, 10, 20)).with_duration(duration)

    image = ImageClip(str(images_dir / f"image_{segment_no}.png")).with_duration(duration)
    if image.w > VIDEO_W - 90:
        image = image.resized(width=VIDEO_W - 90)
    if image.h > 1080:
        image = image.resized(height=1080)
    image = image.with_position((int((VIDEO_W - image.w) / 2), 770))

    panel_file = text_panel_path(
        text.strip(),
        temp_dir / f"caption_{segment_no}.png",
        title=f"Segment {segment_no}",
    )
    panel = ImageClip(str(panel_file)).with_duration(duration).with_position((45, 180))

    return CompositeVideoClip([background, image, panel], size=(VIDEO_W, VIDEO_H)).with_audio(audio)


def build_bumper_clip(path: Path, duration: float | None = None):
    clip = VideoFileClip(str(path)).without_audio()
    if duration is not None and clip.duration > duration:
        clip = clip.subclipped(0, duration)
    return clip


def find_bumper(name: str) -> Path | None:
    candidates = [
        ROOT / "media_assets" / "manim_vertical" / "videos" / "1920p30" / f"{name}.mp4",
        ROOT / "media_assets" / "manim_vertical" / "videos" / "1080p60" / f"{name}.mp4",
    ]
    for candidate in candidates:
        if candidate.exists():
            return candidate
    return None


def close_all(clips: Iterable):
    for clip in clips:
        clip.close()


def assemble(transcript_path: Path, images_dir: Path, audio_dir: Path, output_path: Path, include_bumpers: bool = True):
    temp_dir = ROOT / "video" / "_temp"
    temp_dir.mkdir(parents=True, exist_ok=True)
    segments = parse_segments(transcript_path)
    clips = []
    resources = []

    if include_bumpers:
        opener_path = find_bumper("opener")
        if opener_path is not None and opener_path.exists():
            opener = build_bumper_clip(opener_path, 2.8)
            clips.append(opener)
            resources.append(opener)

    for segment_no, text in segments:
        clip = build_segment_clip(segment_no, text, images_dir, audio_dir, temp_dir)
        clips.append(clip)
        resources.append(clip)

    if include_bumpers:
        closer_path = find_bumper("closer")
        if closer_path is not None and closer_path.exists():
            closer = build_bumper_clip(closer_path, 1.8)
            clips.append(closer)
            resources.append(closer)

    final = concatenate_videoclips(clips, method="compose")
    wm_file = watermark_path(temp_dir / "watermark.png")
    watermark_image = Image.open(wm_file)
    watermark = ImageClip(str(wm_file)).with_duration(final.duration).with_position((int((VIDEO_W - watermark_image.width) / 2), 40))
    branded = CompositeVideoClip([final, watermark], size=(VIDEO_W, VIDEO_H))
    branded.write_videofile(
        str(output_path),
        fps=20,
        codec="libx264",
        audio_codec="aac",
        preset="ultrafast",
        bitrate="3500k",
        logger=None,
    )

    close_all([watermark, branded, final, *resources])


if __name__ == "__main__":
    parser = argparse.ArgumentParser()
    parser.add_argument("--lang", choices=["en", "zh"], required=True)
    args = parser.parse_args()

    transcript = ROOT / "video" / f"transcript_{args.lang}.md"
    audio_dir = ROOT / f"audio_{args.lang}"
    output = ROOT / "video" / f"final_{args.lang}.mp4"
    assemble(transcript, ROOT / "images", audio_dir, output)
