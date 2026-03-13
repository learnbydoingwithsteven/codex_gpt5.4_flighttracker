from __future__ import annotations

import asyncio
import os
import re
from pathlib import Path

import edge_tts


SEGMENT_PATTERN = re.compile(r"## Segment (\d+):.*?\*\*Audio:\*\* (.*?)(?=\n##|\Z)", re.DOTALL)


async def generate_tts(transcript_path: Path, output_dir: Path, voice: str) -> None:
    output_dir.mkdir(parents=True, exist_ok=True)
    content = transcript_path.read_text(encoding="utf-8")
    segments = SEGMENT_PATTERN.findall(content)

    if not segments:
      raise ValueError(f"No segments found in {transcript_path}")

    for segment_number, text in segments:
        cleaned = " ".join(text.strip().split())
        communicate = edge_tts.Communicate(cleaned, voice)
        await communicate.save(str(output_dir / f"seg_{segment_number}.mp3"))


if __name__ == "__main__":
    root = Path(__file__).resolve().parents[1]
    asyncio.run(generate_tts(root / "video" / "transcript_en.md", root / "audio_en", "en-US-AndrewNeural"))
    asyncio.run(generate_tts(root / "video" / "transcript_zh.md", root / "audio_zh", "zh-CN-YunxiNeural"))

