#!/bin/zsh
# Re-render the menu after editing menu/menu.html. Needs this folder served on 127.0.0.1:4184 (python3 -m http.server 4184 --directory ~/Downloads/latte-haus).
set -e
cd "$(dirname "$0")/.."
C="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
URL="http://127.0.0.1:4184/menu/menu.html"
"$C" --headless=new --disable-gpu --no-pdf-header-footer --virtual-time-budget=6000 --print-to-pdf=latte-haus-menu.pdf "$URL" 2>/dev/null
"$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=816,1056 --virtual-time-budget=6000 --screenshot=menu/menu@2x.png "$URL" 2>/dev/null
echo '<html><body style="margin:0"><iframe src="/menu/menu.html" style="width:500px;height:3200px;border:0"></iframe></body></html>' > menu/_phone.html
"$C" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=2 --window-size=500,3200 --virtual-time-budget=6000 --screenshot=menu/menu-mobile@2x.png "http://127.0.0.1:4184/menu/_phone.html" 2>/dev/null
rm menu/_phone.html
python3 - <<'PY'
from PIL import Image, ImageChops
d=Image.open('menu/menu@2x.png').convert('RGB')
d.save('images/menu.webp', quality=86)
d.resize((816,1056), Image.LANCZOS).save('images/menu-thumb.webp', quality=84)
m=Image.open('menu/menu-mobile@2x.png').convert('RGB').crop((0,0,1000,6400))
bg=Image.new('RGB', m.size, (255,255,255))
box=ImageChops.difference(m, bg).getbbox()
m=m.crop((0,0,1000,min(m.height, box[3]+28)))
m.save('images/menu-mobile.webp', quality=86)
print('mobile', m.size)
PY
ls -la latte-haus-menu.pdf images/menu*.webp
