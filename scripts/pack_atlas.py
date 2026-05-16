"""
Pack rendered per-frame PNGs into a single Phaser-compatible atlas.

Input: directory of <name>_<frame>.png files (or just <name>.png for single
frames). Output: <outdir>/sprites.png + <outdir>/sprites.json
(Phaser's JSON Hash format).

Usage:
    python scripts/pack_atlas.py <input_dir> <output_dir>
"""
import json
import math
import os
import re
import sys
from PIL import Image

if len(sys.argv) < 3:
    print("Usage: pack_atlas.py <input_dir> <output_dir>")
    sys.exit(2)

in_dir = sys.argv[1]
out_dir = sys.argv[2]
os.makedirs(out_dir, exist_ok=True)

# Collect frames. Filename convention is <char>_<frame>.png or <char>.png.
frame_re = re.compile(r"^(?P<name>[a-zA-Z0-9_]+?)(?:_(?P<idx>\d+))?\.png$")
items = []
for fn in sorted(os.listdir(in_dir)):
    m = frame_re.match(fn)
    if not m:
        continue
    name = m.group("name")
    idx = int(m.group("idx")) if m.group("idx") else 0
    full_name = name if m.group("idx") is None else f"{name}_{idx:02d}"
    items.append((full_name, name, idx, os.path.join(in_dir, fn)))

if not items:
    print("ERR: no PNG frames found in " + in_dir)
    sys.exit(3)

# Load all frames first to find tight bounding boxes.
loaded = []
for full_name, char, idx, path in items:
    img = Image.open(path).convert("RGBA")
    bbox = img.getbbox()  # tight transparent crop
    if bbox is None:
        # All-transparent image — skip but warn
        print("WARN: " + full_name + " is fully transparent, skipping")
        continue
    cropped = img.crop(bbox)
    loaded.append((full_name, char, idx, cropped))

# Sort by area descending — bigger frames first packs more tightly.
loaded.sort(key=lambda t: -(t[3].width * t[3].height))

# Pick atlas size as power-of-two big enough.
def fits(side_px):
    """Greedy row-by-row packing into a side_px × side_px atlas."""
    placements = []
    cursor_x = 0
    cursor_y = 0
    row_h = 0
    for full_name, char, idx, img in loaded:
        w, h = img.width, img.height
        if cursor_x + w > side_px:
            cursor_x = 0
            cursor_y += row_h
            row_h = 0
        if cursor_y + h > side_px:
            return None
        placements.append((full_name, char, idx, img, cursor_x, cursor_y))
        cursor_x += w
        row_h = max(row_h, h)
    return placements

side = 256
placements = None
while side <= 4096:
    placements = fits(side)
    if placements is not None:
        break
    side *= 2

if placements is None:
    print("ERR: cannot fit frames into 4096×4096 atlas")
    sys.exit(4)

# Build atlas image.
atlas = Image.new("RGBA", (side, side), (0, 0, 0, 0))
frames_json = {}
for full_name, char, idx, img, x, y in placements:
    atlas.paste(img, (x, y))
    frames_json[full_name] = {
        "frame": {"x": x, "y": y, "w": img.width, "h": img.height},
        "rotated": False,
        "trimmed": False,
        "spriteSourceSize": {"x": 0, "y": 0, "w": img.width, "h": img.height},
        "sourceSize": {"w": img.width, "h": img.height},
    }

# Phaser JSON-Hash format.
out_png = os.path.join(out_dir, "sprites.png")
out_json = os.path.join(out_dir, "sprites.json")
atlas.save(out_png, optimize=True)

manifest = {
    "frames": frames_json,
    "meta": {
        "app": "render_sprite + pack_atlas",
        "version": "1.0",
        "image": "sprites.png",
        "format": "RGBA8888",
        "size": {"w": side, "h": side},
        "scale": "1",
    },
}
with open(out_json, "w", encoding="utf-8") as f:
    json.dump(manifest, f, indent=2)

print("OK atlas size=" + str(side) + " frames=" + str(len(placements)) + " out=" + out_png)
for full_name, char, idx, img, x, y in placements:
    print("  " + full_name + " " + str(img.width) + "x" + str(img.height) + " @ " + str(x) + "," + str(y))
