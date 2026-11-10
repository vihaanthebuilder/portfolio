# FEATURE BRIEF — LEGO Cruise Ship Explorer (Vihaan's World)

Build a new page for Vihaan's portfolio site: an interactive deck-by-deck explorer for his LEGO cruise ship (he also calls it the Titanic). Same visual style, colors, and conventions as the rest of the site (match gameroom.html). Link it from the site nav and from the LEGO/builds page. Do not change any other page except adding those links.

## The ship — verified facts (use exactly these; invent nothing)

- 4 decks, room for **125 minifigure guests**.
- **Deck 1 — Rooms (Finished):** where the guests sleep. The lounges are all finished, and **every lounge hides a prize**.
- **Deck 2 — Shops & the Rich Lounge (NOW BUILDING — he is on this deck):** shops, a rich lounge with a dance floor, a doctor, a dentist, a jail (for anyone who tries to steal something), a clothing store, and a massage place.
- **Deck 3 — Fun Deck (Planned, not built yet):** swimming pool, golf, badminton, a concert, the captain's own home, and TVs in the rooms.
- **Deck 4 — Food Deck (Planned):** all the food, with security at the entrance.
- **Captain's plans (deck not decided yet — do NOT pin these to a deck):** a roller coaster, fair rides, and a tiny phone charger.
- **NO PRICES anywhere on the page.** (Two different price lists exist and the family has not settled which one — leave prices off entirely.)
- Photos: if a real photo of the ship already exists in the repo's images, it may be used. Otherwise illustration only — never invent or stock-photo a ship and present it as his.

## The page

- File: `cruise-ship.html`.
- Header: the ship's name/story in one or two lines, 3rd-grade readable, second person, same confident tone as the Game Room.
- **Ship's Stats strip:** 4 decks · 125 guests · lounges: all done, a prize in each · now building: Deck 2.
- **The explorer (the main event):** a big side view of the ship with 4 clearly tappable decks (SVG/CSS in site colors). Tapping or clicking a deck lights it up and opens a panel for that deck showing: deck name, a status badge (Finished / Now Building / Planned), and what's on it as friendly tiles or chips.
- A separate small **"Captain's Plans"** section for the undecided items (roller coaster, fair rides, tiny phone charger) — worded as coming soon, deck to be decided by the captain.
- Accessibility: keyboard operable (decks reachable and selectable by keyboard, visible focus), works on a phone (stacked layout), no sound, gentle motion only and respect prefers-reduced-motion.

## Rules

- Branch `feature/cruise-ship-explorer` from main. **Local commit only — do NOT merge, push to main, or publish.** Publishing needs Nishant's separate go-ahead.
- Verify on desktop and mobile widths; save screenshots of both to /tmp/vihaan-cruise-ship/.
- Update HANDOFF.md when done: what was built, the commit hash, screenshot paths, and anything left open.
