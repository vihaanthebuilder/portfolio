# Vihaan Room Life — jetpack flight fix

**Asked by:** Nishant, Sat Nov 21, 2026, 8:31 PM CT (typed from the Mac).
**Project:** Vihaan's World, Room Life (index.html home page, worker 0069, worktree `.worktrees/feature-room-life-scene`).
**Queue position:** After the current Room Life 2-player/walking publish path. Do not interrupt the in-flight publish; run this as the next Room Life brief.

## The three asks (his words)
1. "why is it walking when the jet pack is on" — the avatar plays the walking leg animation / ground-walk movement while the jetpack is on. It should fly, not walk.
2. "have space bar decide the altitude of flight" — Space bar controls how high the flight goes.
3. "the fire should move so it looks more real" — the jetpack flame/exhaust should be animated, not static.

## What to build
1. **Flight pose, no walking:** When a jetpack is on (Shift for Vihaan, Q for Ahaan in Play together), the avatar leaves the ground and uses a flight/hover pose — legs still or slightly trailing, NO walk-cycle leg swing, NO planted-foot stepping. Horizontal movement in flight is smooth gliding (keep existing WASD/arrows steering). Landing (jetpack off) returns to normal walking.
2. **Space = altitude:** Hold Space to rise; release Space to gently descend toward hover height (do not slam to the ground). Cap altitude at a safe room ceiling height. Show a small hint pill while flying, e.g. "Hold Space to fly higher". Both players: in Play together, each player's jetpack altitude is controlled by their own flight key if Space conflicts — resolve so both can fly without stealing each other's input (Vihaan Space is fine solo; in 2-player keep Vihaan on Space and give Ahaan his own rise key, and say so in the hint).
3. **Animated fire:** Jetpack exhaust flame flickers/moves continuously while on — scale/flicker with thrust (bigger/brighter while rising with Space held, smaller at hover). Simple particle or shader flicker is fine; keep it calm and sensory-friendly (no flashing/strobing, no red alarm colors — warm orange/yellow flame is fine as it is fire, keep motion smooth).

## Acceptance checks
- Jetpack on: avatar airborne, legs NOT walking (verify in desktop 1280x800 + mobile 390x844 captures).
- Hold Space: altitude increases smoothly to cap; release: gentle descent to hover; jetpack off: lands and walking resumes normally.
- Flame visibly animates (two screenshots a moment apart differ) and grows while rising.
- Existing suites still pass: room-life-feature + walk suites (walk-and-trophies, walk-physical-contact, walk-picking, walk-boundaries) with numbers recorded; one persistent VQA dir per suite.
- Publish on driver authority + live-verify + Fresh Drops entry WITH screenshot of flight (standing rule: no entry without its screenshot).

## Notes
- Sensory-friendly rules apply (calm motion, no flashing).
- Do not copy code from Ahaan's Park repo; this is Vihaan's Room Life jetpack only.
