# Vihaan Room Life — skateboard wheels + physics, wobbly feet, basketball hoop

**Asked by:** Nishant, Sat Nov 21, 2026, 9:08 PM CT (typed from the Mac): "for vihaan world - improve th skates - no wheel. on it - it's physics is off - also vihaan feet are still wobbly + hoop have vihaan actually hoop the baskteball - basketball itsefl is gone now"
**Project:** Vihaan's World, Room Life (index.html home page, worker 0069, worktree `.worktrees/feature-room-life-scene`).
**Queue position:** After the current Room Life 2-player/walking publish, then the jetpack flight fix (no-walk + Space altitude + animated fire). Then this brief, then Deck 3 tracker, then LEGO instructions + boats.

## The four asks (his words)
1. "improve th skates - no wheel. on it" — the skateboard has no wheels.
2. "it's physics is off" — skateboard physics feel wrong.
3. "vihaan feet are still wobbly" — the avatar's feet wobble when walking.
4. "hoop have vihaan actually hoop the baskteball - basketball itsefl is gone now" — the basketball has disappeared, and Vihaan himself should shoot it into the hoop.

## What to build
1. **Skateboard wheels:** Add visible wheels (4 small wheels + trucks) to the skateboard model. Wheels spin while rolling. Keep the guided sequence from the Nov 18 fix round working: Vihaan holds the skateboard in hand, picks it up from the top of the TV, goes up the stairs, does stunts at the top, comes down grinding the stair railing.
2. **Skateboard physics:** Fix the feel — smooth rolling on the floor, believable speed/turning, stable rail grind down the stair railing (board stays on the rail, no clipping/floating), clean landing. No sudden snaps or jitter.
3. **Wobbly feet:** Stabilize the planted-foot IK gait — feet plant flat without wobble/slide/roll while walking (all directions + diagonals + stairs). Re-run the walk suites and record numbers: walk-and-trophies, walk-physical-contact, walk-picking, walk-boundaries + room-life-feature (one persistent VQA dir per suite). Zero planted-foot errors is the bar (33k+ contact samples previously).
4. **Basketball back + real shooting:** Restore the missing basketball (visible ball near the hoop / in Vihaan's hands on approach). Vihaan the avatar actually shoots: walk to the hoop → shoot animation → ball arcs from his hands into the hoop → gentle score feedback (ball drops through net, small kind line). Ball returns/rolls back so he can shoot again. In Play together, Ahaan can shoot too if simple; Vihaan shooting is the must-have.

## Acceptance checks
- Skateboard shows 4 spinning wheels in desktop 1280x800 + mobile 390x844 captures; full TV → stairs → stunt → rail-grind sequence completes smoothly.
- Walk suites pass with numbers recorded; no visible foot wobble in captures (standing + walking + stairs).
- Basketball visible; Vihaan shoots and the ball goes through the hoop; repeatable.
- room-life-feature suite passes; zero console/page errors.
- Publish on driver authority + live-verify + Fresh Drops entry WITH screenshot (skateboard wheels or the shot going in — standing rule: no entry without its screenshot).

## Notes
- Sensory-friendly: smooth motion, no flashing.
- Do not copy code from Ahaan's Park repo; this is Vihaan's Room Life only.
- The procedural dog (images/dog.bin 404) is pre-existing — do not chase it.
