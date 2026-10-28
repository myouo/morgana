"""Reject a subset that silently falls back for missing narrative characters."""
from fontTools.ttLib import TTFont
from pathlib import Path
import sys

# U+200B is a zero-width line-break opportunity, not a visible glyph.
# It remains in the story text; only this cmap coverage check excludes it.
with TTFont(sys.argv[1]) as font:
    requested = {ord(c) for c in Path(sys.argv[2]).read_text() if c not in "\n\r\t\u200b"}
    missing = requested - set(font.getBestCmap())
    if missing:
        raise ValueError("FONT_MISSING_GLYPHS: " + ",".join(f"U+{code:04X}" for code in sorted(missing)))
