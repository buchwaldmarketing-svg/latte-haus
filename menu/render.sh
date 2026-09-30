#!/bin/zsh
# Re-render both menus after editing menu/menu.html or menu/fall.html.
# Needs this folder served on 127.0.0.1:4184 (python3 -m http.server 4184 --directory ~/Downloads/latte-haus).
set -e
cd "$(dirname "$0")/.."
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"

# render <source html> <pdf name> <image prefix>
render() {
  local URL="http://127.0.0.1:4184/menu/$1"
  "$C" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=6000 --print-to-pdf="$2" "$URL" 2>/dev/null
  "$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=816,1056 --virtual-time-budget=6000 --screenshot="menu/$3@2x.png" "$URL" 2>/dev/null
  echo "<html><body style=\"margin:0\"><iframe src=\"/menu/$1\" style=\"width:500px;height:3200px;border:0\"></iframe></body></html>" > menu/_phone.html
  "$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=500,3200 --virtual-time-budget=6000 --screenshot="menu/$3-mobile@2x.png" "http://127.0.0.1:4184/menu/_phone.html" 2>/dev/null
  rm menu/_phone.html
  python3 - "$3" <<'PY'
import sys
from PIL import Image, ImageChops
n = sys.argv[1]
d = Image.open(f'menu/{n}@2x.png').convert('RGB')
d.save(f'images/{n}.webp', quality=86)
d.resize((816, 1056), Image.LANCZOS).save(f'images/{n}-thumb.webp', quality=84)
m = Image.open(f'menu/{n}-mobile@2x.png').convert('RGB').crop((0, 0, 1000, 6400))
box = ImageChops.difference(m, Image.new('RGB', m.size, (255, 255, 255))).getbbox()
m = m.crop((0, 0, 1000, min(m.height, box[3] + 28)))
m.save(f'images/{n}-mobile.webp', quality=86)
print(n, 'mobile', m.size)
PY
}

render menu.html latte-haus-menu.pdf menu
# Image names are cached for a year: bump the -vN prefix (and script.js MENUS) whenever the fall menu changes.
render fall.html latte-haus-fall-menu.pdf fall-menu-v2
ls -la latte-haus-menu.pdf latte-haus-fall-menu.pdf images/menu*.webp images/fall-menu-v2*.webp
