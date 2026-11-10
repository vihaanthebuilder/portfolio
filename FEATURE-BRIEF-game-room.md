# FEATURE BRIEF — Vihaan's Game Room (Lichess game analysis for his website)

**For:** the Vihaan portfolio worker (friendly-oppenheimer, live site https://vihaanthebuilder.github.io/portfolio/)
**From:** Goku, coordinator — requested by Nishant (dad) on Nov 9, 2026.
**Queue:** behind the currently running Lichess-1605 chess-page work. Do not interrupt running work. If idle when this arrives, report starting state first, then begin.

## Player data (verified)
- Lichess username: **vihaan_67** — public account, member since Nov 27, 2025. No login or token needed; use the public API only.
- Lichess Classical rating: **1605** (family-stated Nov 9, 2026 — display the LIVE value from the API, not a hardcode).
- US Chess (over the board, keep visually separate from Lichess numbers): Regular **811**, Quick **814**, ID 32756659.
- Family-stated fact for the page: Vihaan has beaten Kanishk Malli (Arkansas K-5 state champion, 2025) in a Lichess game. Do NOT fabricate a game ID, date, or link for it.

## What to build
A new **Game Room** page (`gameroom.html`), linked from `chess.html` and from the site nav in the same style as other pages. AGENTS.md stays in force (built with a young kid; guardian/helper; simple, friendly, robust). Kid-friendly tone throughout — this is motivation + a review habit, never a wall of cold stats.

## Data — Lichess public API (no auth)
- `GET https://lichess.org/api/user/vihaan_67` — perfs (classical, rapid, blitz, puzzle ratings + game counts), account created date.
- `GET https://lichess.org/api/user/vihaan_67/rating-history` — rating-over-time points per category.
- `GET https://lichess.org/api/games/user/vihaan_67?max=200&rated=true&opening=true&moves=true` with header `Accept: application/x-ndjson` — his rated games. If the API rate-limits, drop to `max=50`.
- The site is static (GitHub Pages): fetch live in the browser at page load, AND commit a baked fallback snapshot at `data/vihaan-lichess-snapshot.json` (generated during this build, labeled on the page with its date) so the page still renders fully if the fetch fails or is blocked. Never invent stats; if a number didn't come from the API or the family facts above, it doesn't go on the page.

## Page sections
1. **Header** — "Vihaan's Game Room" + live rating chips: Classical (starred as his main), Rapid, Blitz, Puzzles — labeled "Lichess". A clearly separate chip group labeled "Over the board (US Chess)": 811 Regular / 814 Quick. The two rating systems must never be blended or compared in one number.
2. **The Climb** — line chart of his Classical rating history (from rating-history). Plain canvas or the lightest approach consistent with the site's existing stack; no new heavy dependency. Mark start → current.
3. **Recent Games** — last 10 rated games: date, his color, opponent name + opponent rating, opening name, result badge (Win/Draw/Loss from Vihaan's side), and a "Watch" link to the game on lichess.org.
4. **By the Numbers** — totals from the fetched games: games counted, win % as White vs as Black, top 3 most-played openings with counts, best win (highest-rated opponent he has beaten).
5. **Games to Review** — his 5 most recent losses, each with a link to the game on Lichess labeled "Open in Lichess → then tap Analysis". Friendly framing: losses are treasure maps — where the next lesson hides. No shaming language anywhere.
6. **Best Win Spotlight** — the highest-rated opponent he has beaten, shown on an embedded Lichess board (https://lichess.org/embed/game/{id}) with a caption (opponent, their rating, date, opening).
7. **Road to State** — static tracker from the family plan:
   - Next tournament: **NWA Fall Scholastic — Sat Nov 28, 2026, Fayetteville, AR (registered)**.
   - The big target: **Arkansas Individual Scholastic Championship — Spring 2027 (exact date to be announced — do not invent one)**. K-3 champion goes to the Ashley K-3 nationals; K-5 champion goes to the Rockefeller nationals.
   - Trophy shelf note: Tulsa, Oct 24, 2026 — Outstanding Performance, 4.0/5.
   - Progress marker: US Chess 811 → goal 1000 by spring 2027.
   - One friendly line: "Vihaan has beaten Kanishk M., the Arkansas K-5 state champion, in a Lichess game." (No link, no date — family-stated.)

## Process rules
- Work on branch **`feature/game-room`** (create from `main`). Commit identity `Codex Worker <codex@localhost>`. Code first, verify once at the end.
- **Do NOT push to main and do NOT publish/deploy.** Goku verifies and coordinates publishing with Nishant.
- The Lichess Classical 1605 stat also belongs in the Game Room header, but the separate chess.html stat work on `feature/lichess-classical-1605` stays untouched — do not modify that branch, and this brief supersedes the old PARKED note on FEATURE-BRIEF-lichess-classical-1605.md only for the Game Room itself.
- Protect existing pages; additive change only (new page + nav/chess.html link). Do not worsen the known duplicate-Three.js console warning (fixing is welcome if low-risk).

## Verification (once, at the end — mandatory)
- Load `gameroom.html` locally: confirm the live Lichess fetch populates every section; then block the fetch and confirm the snapshot fallback renders with its date label.
- Capture screenshots (desktop + mobile) of: header + rating chips, The Climb chart, Recent Games, Best Win embed. Save under `/tmp/vihaan-gameroom-vqa/` and list the exact paths in HANDOFF.md.
- Zero new console errors.
- Update HANDOFF.md: what was built, API endpoints used, snapshot date, VQA evidence paths, anything left over for the family (e.g., the Kanishk game is stated, not linked).

---

## AMENDMENT (Nov 9, 2026 — from Nishant, via Goku) — CONFIDENCE FIRST

This changes the brief's emphasis and outranks any conflicting tone guidance above. The page's real job: **Vihaan is slightly underconfident. The Game Room must give him belief that he can become state champion, and build his overall confidence.**

- **Lead with evidence, not numbers.** The page is a wall of proof that he is already a winner — the climb chart framed as "Look how far you've come", the Tulsa trophy, the best-win embed, wins counted big. Stats support the story; they are not the story.
- **Road to State reads as "you can do this."** Steps with the already-done ones checked off (first trophy ✔, beat the state champion ✔, 800+ rating ✔) — the championship as the next step of a journey he is already on.
- **The Kanishk line gets prominence** — hero-adjacent, not a footnote. He has beaten the Arkansas state champion in a Lichess game. Belief anchor #1.
- **Losses never look like failure.** "Games to Review" = treasure maps / detective work. No red-X energy, no loss streaks, no "weakness" language anywhere on the page.
- **Victory language, second person, present tense:** "You beat…", "Your climb…", "Next stop: State Champion." Short, big, readable by a 3rd grader.
- **Milestones over rankings:** badge moments for thresholds he crosses (100 games, 900, 1000). No leaderboards, and no other kids named as rivals anywhere on the page.

---

## AMENDMENT 2 (Nov 9, 2026 — from Nishant, via Goku; item 1 corrected later the same evening) — JISHI03 CORRECTION + "THIS WEEK'S REPS"

1. **CORRECTION (Nov 9, 2026, later the same evening — this replaces the original Belief Anchor #2 item): the game vs WFM jishi03 is NOT a belief anchor.** Nishant clarified: in Vihaan's recorded game against his coach, WFM jishi03 (1874), she LEFT the game because of a connection issue — the result was by abandonment, not by play. So: do NOT spotlight that game, and never word anything as Vihaan beating his coach. EXCLUDE all games vs jishi03 from the Best Win Spotlight pick if the computation surfaces one. Belief anchors stay with wins that actually happened over the board — the Kanishk win (family-stated) is the anchor.
2. **NEW TILE — "This Week's Reps":** count of games played in the last 7 days, from the same games pull. Practice made visible as effort he controls — a number he can grow. Positive label ("Every game makes you stronger"). If the count is 0, show an inviting line instead of a zero ("Your next adventure starts with one game"). Never frame it as a missed quota or a broken streak. Context: Vihaan practices mainly in his weekly classes lately and independent Lichess play has gaps of days/weeks — this tile is the gentle fix.

---

## AMENDMENT 3 (Nov 9, 2026 — from Nishant, via Goku) — GAMIFY THE PRACTICE: DAILY QUEST + STREAK

Nishant confirmed the daily micro-dose: **10 puzzles + 1 game**. Key insight: Vihaan LOVES streaks — he once did a full year of Duolingo without missing a day. Build the practice habit on that exact mechanic.

- **New section "Daily Quest + Streak", placed SECOND on the page**, right under the header/ratings — it's the daily-return hook.
- **Today's Quest card:** Puzzles ●/10 and Game ✓/○ for today. Quest complete = streak day earned.
- **Streak display, Duolingo-style:** big flame, current streak, best streak, last-7-days dots. Best streak stays shown as his record to beat; a missed day resets the current streak quietly — never shame, never a red zero.
- **Data:** games/day from the games pull; puzzles/day — try `https://lichess.org/api/user/vihaan_67/activity` (puzzle entries carry counts per interval) plus the puzzle perf totals in `https://lichess.org/api/user/vihaan_67`. Cache the computed streak state in the snapshot JSON.
- **HONESTY:** never invent a streak or puzzle count. If a day's puzzles can't be verified from the API, show the game half as verified and mark puzzles "check your Lichess app" instead of guessing.
- **This SUPERSEDES Amendment 2's standalone "This Week's Reps" tile** — fold the "Games this week: N" line into the Quest card.

---

## PUBLISH AUTHORIZATION (Nov 9, 2026, 9:25 PM CT — Nishant, via Goku)

Nishant's words: **"Once done publish it."** This brief's earlier "do NOT publish" hold is lifted for the Game Room ONLY, on these terms:

- When the build is complete AND the mandatory verification passes (live fetch populates every section, snapshot fallback renders with its date label, desktop + mobile VQA screenshots saved under `/tmp/vihaan-gameroom-vqa/`, zero new console errors, results recorded in HANDOFF.md), Goku will dispatch the publish step **without asking Nishant again**: merge `feature/game-room` to `main`, push `main` (GitHub Pages deploys from main), then verify live that https://vihaanthebuilder.github.io/portfolio/gameroom.html loads and renders.
- No force-push. If the merge conflicts, stop and record the blocker in HANDOFF.md.
- This authorization covers the Game Room only. The other unpublished branches (`feature/lichess-classical-1605`, `feature/geometry-dash-harder`, `feature/chess-robot-fix`) stay unpublished unless Nishant says otherwise.
