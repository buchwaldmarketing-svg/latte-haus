#!/bin/zsh
# Render the link preview card. Needs this folder served on 127.0.0.1:4184. Bump the output filename on every change.
set -e
cd "$(dirname "$0")/.."
"/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" --headless=new --disable-gpu --hide-scrollbars --window-size=1200,630 --virtual-time-budget=6000 --screenshot=menu/og@1x.png "http://127.0.0.1:4184/menu/og.html" 2>/dev/null
python3 -c "from PIL import Image; Image.open('menu/og@1x.png').convert('RGB').save('images/${1:-og-card-v2}.jpg', quality=88, optimize=True)"
ls -la images/${1:-og-card-v2}.jpg
