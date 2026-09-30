# Parked ideas (not on the live site)

## Drink tiles under "What we're pouring" (parked 2026-09-30)
Lee liked it but took it off: regular menu 2x2 (Horchata, Fruity Pebbles, Blueberry Muffin Matcha, Pistachio Cloud) + fall menu 2x2 (Calabasa, Maple Cream Cold Brew, Churro, All three), 4x2 on desktop, stacked on phone, each tile opens its menu pop-up.
- Full implementation: commit 8b1f0f1 (images/tile-*.jpg are in that commit). Restore with `git revert <the revert commit>`, or apply `drink-tiles.patch` and check out the images from 8b1f0f1.
- Fall drink names changed after parking: Calabaza Latte, Pumpkin Pie Cold Brew, Calabaza Chai (the tile captions in 8b1f0f1 still say Calabasa / Maple Cream / Churro, update on restore).
