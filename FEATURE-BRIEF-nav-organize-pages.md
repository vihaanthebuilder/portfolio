# Vihaan's World — organize every page under the existing menu tabs (no orphan pages)

**Asked by:** Nishant, Sat Nov 21, 2026, 9:17 PM CT (typed from the Mac, right after asking about the Solar System Explorer): "add all thes eunder eixting menu tabs right - there arse just random seaparte pages" (read: add all these under existing menu tabs — right now they are just random separate pages).
**Project:** Vihaan's World (vihaanthebuilder.github.io/portfolio, worker 0069).
**Queue position:** With the Room Life fixes (after jetpack fix). Can ship as its own small publish.

## The problem
Vihaan's site has grown many pages (Solar System Explorer, Cruise Ship Explorer, Game Room, Author's Room, LEGO Collections, Tactics, Spelling Bee, Road to State, Hall of Fame, Fresh Drops, etc.). Some are only reachable as random separate pages / direct URLs, not discoverable from the main nav. Nishant wants **everything under the existing menu tabs** so Vidhu can find it all from the top nav.

## Standing rule (Nishant, Nov 21, 9:19 PM CT — "make that a rule")
From now on, **every new feature/page on BOTH kids' sites must be added under an existing menu tab at publish time — no orphan pages, ever.** And **every new feature gets a visible "NEW" tag** (on its nav entry and any home-page card) for its first 7 days, so the kids know what to try. This brief implements the rule for Vihaan's site; all future briefs on both sites must include both requirements (menu placement + NEW tag + Fresh Drops entry with screenshot).

## What to build
1. **Audit:** List every `.html` page in the repo root. For each, note: page title, current nav entry (if any), and which existing menu tab it belongs under: **Chess · LEGO · Play · Words · What's New · Me** (What's New = Fresh Drops, just added).
2. **Map sensibly, for example:**
   - Chess: Tactics Trainer, Robot Chess, Road to State, Hall of Fame
   - LEGO: LEGO Collections, Cruise Ship Explorer (LEGO build), Build of the Week
   - Play: Game Room (arcade games), Solar System Explorer (explore/play), Room Life (home)
   - Words: Spelling Bee, Author's Room (his book)
   - What's New: Fresh Drops
   - Me: Goals, Badges, Fresh Drops (existing dropdown — keep)
   Adjust to what fits best; the rule is: **no page left as an orphan** — every kid-facing page reachable in ≤2 clicks from the top nav.
3. **Add missing entries** using the existing nav/sub-nav pattern (`sub-navs.js` / `sub-navs.css` — same styling as the What's New item just added). Dropdown items where a tab has several pages; keep labels kid-readable and short.
4. Do not rename/move any page URLs (links already shared must keep working). Nav-only change.
5. Homepage: make sure the home page's feature cards/sections (if any) match the same grouping, so nav and home agree.

## Acceptance checks
- Page audit table in HANDOFF: every .html page → menu tab → nav label. Zero orphans.
- Desktop 1280x800 + mobile 390x844: every page reachable from top nav in ≤2 clicks; zero console/page errors; mobile nav still fits (no overflow).
- Existing checks pass (room-life-feature if home page touched).
- Publish on driver authority + live-verify (click through every nav entry live) + Fresh Drops entry WITH screenshot of the organized nav (standing rule: no entry without its screenshot).

## Notes
- Same audit will be done for Ahaan's site separately — do not mix repos.
- Do not copy code from Ahaan's Park repo; this is Vihaan's site nav only.
