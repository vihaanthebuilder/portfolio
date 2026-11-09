# FEATURE BRIEF — Walk smoothing + Trophy rack & trophy cards

From: Goku (coordinator), per Nishant's direction, Nov 9, 2026.
Project: Vihaan's World (friendly-oppenheimer). This brief SUPERSEDES the earlier note pausing 3D landing-page work — Nishant personally reviewed the 3D landing scene today and requested this work.

Context: Nishant's screenshot shows the 3D landing scene — character on the stairs, the big dark shelving rack on the left beside the stairs, the LED ticker, hoop, arcade cabinet, TV stack. His exact asks (parsed):

1. "Walk should be normal — weird walk, also digging into stairs. Fix that and get it smoothed. I would rely on you on VQA on it."
2. "I don't see trophy on the rack on left stairs — Vihaan should be able to see all trophies."
3. "Clicking a trophy/pick shows a card with a 3D view of the trophy along with stats — when won, etc."

## Task A — Walk cycle + stair traversal fix

Symptoms to eliminate:
- The walk looks weird: unnatural gait/leg motion, sliding, bobbing, or foot skating.
- The character sinks into / clips through the stair geometry while climbing ("digging into stairs").

Do:
- Character Y position must follow the stair tread height along the whole flight — no sinking, no floating. Feet land on treads.
- Gait: natural stride synced to movement speed (no foot-skate), smooth acceleration/deceleration, smooth turns. Fix at the animation/motion root cause (step-height sampling, interpolation, easing) — not by hacks that break other movement (ground walk, click-to-walk, WASD/arrows, HOOP / SIT ON STAIRS / ARCADE actions).
- Desktop and mobile viewports.

VQA REQUIREMENT (Nishant explicitly relies on us for visual QA):
- Capture screenshots/screen recordings of the character at bottom, mid-flight, and top of the stairs, before and after the fix.
- Save evidence under /tmp/vihaan-walk-vqa/ and list exact file paths in HANDOFF.md.
- Self-check against the screenshots: no clipping into steps, feet on treads, posture natural. If the after-state still shows a defect, iterate before reporting done.

## Task B — Trophy rack on the left shelving unit

- Populate the big dark shelving rack beside the stairs with trophy objects for ALL of Vihaan's chess trophies/awards.
- Trophy data (verified family records — do not invent events, dates, places, or finishes):
  1. 1st Place — Crowder College Spring Open, May 30, 2026, Joplin, MO. Rating surge 585 -> 715 (+130) at this event. (Site already carries this story.)
  2. Outstanding Performance — Peace Academy K-12 Open, Oct 24, 2026. Section 3 (K-12 U900), 4th place, score 4.0/5. (Prize rule: 4.0+ outside top three earns this trophy.)
- HONESTY RULE: photos chess-trophy.jpg and outstanding-performance-trophy.jpg are byte-identical (same photo, plaque reads OUTSTANDING PERFORMANCE), and index.html currently captions that photo "1st Place Chess Championship Trophy." Do NOT silently fix, swap, or guess the photos/captions — that mismatch is a family decision. Build 3D trophy objects/placements for BOTH awards with correct text labels; leave the existing photo files and captions exactly as they are.
- Trophies must read clearly as trophies from the default landing camera, on desktop and mobile.

## Task C — Trophy detail card with 3D view + stats

- Clicking a trophy on the rack opens a detail card/modal containing:
  - An interactive 3D view of that trophy (rotatable; reuse the site's Three.js stack — and do not worsen the known duplicate-Three.js-import warning; fixing it is welcome if low-risk).
  - Stats: event name, date, venue/city, section, place/finish, score where applicable, and the rating note for the 1st Place trophy (+130 surge).
- Card closes cleanly; scene controls resume; no console errors. Works on mobile (tap) as well as desktop (click).
- Keep AGENTS.md in force: built with a young kid; act as guardian/helper; keep it simple, friendly, robust.

## Process (project rules)

- Work on branch feature/3d-trophy-cabinet-showcase (create from main if needed). Commit with the explicit identity Codex Worker <codex@localhost>.
- Code everything first; verify once at the end (local browser checks + the VQA captures above).
- Update HANDOFF.md with: what changed, VQA evidence paths, verification results, and anything left for the family (photo mismatch stays listed).
- Do NOT push to main and do NOT publish without Goku's go — Goku verifies (independent VQA against the evidence) and coordinates the publish with Nishant.
