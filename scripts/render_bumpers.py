from __future__ import annotations

import os
from pathlib import Path

import imageio_ffmpeg

ffmpeg_dir = str(Path(imageio_ffmpeg.get_ffmpeg_exe()).parent)
os.environ["PATH"] = ffmpeg_dir + os.pathsep + os.environ.get("PATH", "")

from manim import Arc, Circle, FadeIn, FadeOut, LaggedStart, Line, ORIGIN, Scene, Text, VGroup, config, Create, Write  # noqa: E402


ROOT = Path(__file__).resolve().parents[1]
MEDIA_DIR = ROOT / "media_assets" / "manim_vertical"


class CodebaseOpener(Scene):
    def construct(self):
        rings = VGroup(
            Circle(radius=1.2, color="#58A6FF", stroke_opacity=0.38),
            Circle(radius=1.8, color="#FF8E3C", stroke_opacity=0.26),
            Arc(radius=2.4, angle=4.9, color="#7DD3FC", stroke_opacity=0.24),
        )
        axis = Line(rings.get_center() + ORIGIN + (0, 0.9, 0), rings.get_center() + ORIGIN + (0, -0.9, 0), color="#B9D9FF", stroke_opacity=0.35)
        title = Text("Orbital Airspace", font_size=54, color="#EFF6FF").shift((0, -2.7, 0))
        self.play(LaggedStart(*[Create(item) for item in rings], lag_ratio=0.16), run_time=1.4)
        self.play(FadeIn(axis), Write(title), run_time=0.9)
        self.wait(0.8)
        self.play(FadeOut(VGroup(rings, axis, title)), run_time=0.6)


class CodebaseCloser(Scene):
    def construct(self):
        ring = Circle(radius=1.35, color="#58A6FF", stroke_opacity=0.38)
        orbit = Arc(radius=2.1, angle=4.7, color="#FF8E3C", stroke_opacity=0.28)
        line_one = Line((-1.8, -2.2, 0), (1.8, -2.2, 0), color="#7DD3FC", stroke_opacity=0.24)
        line_two = Line((-1.2, -2.55, 0), (1.2, -2.55, 0), color="#7DD3FC", stroke_opacity=0.18)
        self.play(Create(ring), Create(orbit), run_time=1.1)
        self.play(FadeIn(line_one), FadeIn(line_two), run_time=0.5)
        self.wait(0.6)


def render(scene_cls, output_name: str) -> None:
    config.background_color = "#020611"
    config.pixel_width = 1080
    config.pixel_height = 1920
    config.frame_rate = 30
    config.media_dir = str(MEDIA_DIR)
    config.output_file = output_name
    scene_cls().render()


if __name__ == "__main__":
    render(CodebaseOpener, "opener")
    render(CodebaseCloser, "closer")
