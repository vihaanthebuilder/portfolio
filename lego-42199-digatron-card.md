# LEGO 42199 — Monster Jam DIGatron Pull-Back — add to Vihaan's LEGO Collections

**Asked by:** Vidhu (Vihaan), voice call, Nov 18, 2026 evening.
**Status:** Card brief ready. NOT yet on the live site — publish is blocked until Mac computer control resumes (needs a typed chat message from the Mac, same unblocker as the Author's Room count fix).

## Verified set facts (web, Nov 18)
- LEGO Technic Monster Jam™ DIGatron™ Pull-Back, set **42199**
- **218 pieces**, ages 7+, released Jan 2025
- Pull-back motor: pull backwards, release, speeds forward
- DIGatron's shovel + grabber, oversized tyres
- 10 cm high × 19 cm long × 11 cm wide
- Sources: LEGO.com listing via brickcompare/brickunited/brickranker — all agree on 218 pieces.

## Vidhu's words (his description on the call)
- "It makes a technique monster truck and it says Digitron Monster Jam on the top and it says JCB Monster Jam."
- "Yeah, it actually works."
- "So technically you pull it backwards you let go and it moves by itself."

## Where it goes
- Page: `lego.html` — "LEGO Collections" section, "My Own Creations" group.
- Live page currently says **32 builds and counting** — this becomes build **33** (update `legoBuildCount` 32 → 33).
- Set 42199 is NOT on the live page yet (verified by curl Nov 18).

## Card HTML (match the live pattern exactly)
Copy an existing card's structure. Fill:

- `data-img`: **OPEN — no photo yet.** Ask Vidhu for a photo of his built truck, or draw a simple placeholder in the site's style (other cards use `images/set-*.jpg`; some use `.svg`). Do NOT hotlink a store image.
- `data-title`: `Monster Jam DIGatron Pull-Back`
- `data-category`: `🛻 TECHNIC MONSTER JAM SERIES`
- `data-meta`: `🛻 Set 42199 · 🧩 218 Pieces · ⏱ <build time — ASK VIDHU>`
- `data-fav`: `the pull-back motor — pull it back and it zooms off by itself`
- `data-quote`: `"Pull it back, let go, and it moves by itself!"`
- `data-desc`: `LEGO Technic Monster Jam DIGatron Pull-Back (set 42199, 218 pieces) — a monster truck with a pull-back motor, DIGatron's shovel and grabber, and huge tyres. It says DIGatron Monster Jam on top and JCB Monster Jam on the side. Pull it backwards, let go, and it speeds off by itself!`
- `data-technique`: `Pull-back motor & Technic gear drive`
- `data-funfact`: `The real DIGatron is a Monster Jam truck sponsored by JCB — that's why it says JCB Monster Jam!`
- Photo block: `<img src="..." alt="LEGO Technic 42199 Monster Jam DIGatron Pull-Back" class="contain" loading="lazy" style="background:#fff">`, glass-badge `🛻 Technic Set`, title `Monster Jam DIGatron Pull-Back`
- Body pills: `🧩 218 Pieces`, `⏱ <build time>`; why-text = the data-quote; footer `Built by Vihaan, Age 8`

## Publish path
Same as other kids' items (driver authority, no per-item approval needed): edit `lego.html` in the Vihaan repo, verify locally, merge + push, wait for Pages deploy, live-verify the card shows and the count reads 33, record in HANDOFF. Do NOT publish until Mac control is back.
