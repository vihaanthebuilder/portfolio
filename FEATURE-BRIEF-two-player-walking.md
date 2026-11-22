# Brief: Room Life — 2-player + walking improvement pass (Vihaan's World)

From Nishant (Nov 20, 2026): "improve 2 player and both websites - walking is off - test yourself and fix issues you see - drive it over the night."

## Context
- Room Life scene on index.html: Play together toggle (Vihaan arrows + Enter, Ahaan WASD + E), planted-foot IK gait, stairs, quad, skateboard, jetpacks, dog, trophy cabinet.
- The Nov 18–19 fix round already fixed walk-heading (yaw 12→30/s). Nishant still reports walking is off — find what remains.
- Sensory-friendly rules hold: calm motion, no red error states, no flashing, no harsh sounds.

## Do this, in order
1. Baseline: run the existing suites and record pass/fail with numbers — walk-and-trophies, walk-physical-contact, walk-picking, walk-boundaries, room-life-feature, room-life-fixes (use the durable harness: PLAYWRIGHT_MODULE=/Users/Nishant/dev-tools/browser-check/node_modules/playwright). One persistent VQA dir per suite — reuse it, do not mint new dirs per rerun.
2. Fresh-eyes playtest (desktop 1280x800 + mobile 390x844): walk all 4 directions + diagonals; stairs up and down; click-to-walk; sit/chess positions; BOTH players walking at once. Look for: heading drift or veering, foot sliding, foot-planting errors, legs clipping stairs/furniture, camera losing a player, separation weirdness, input stealing between players, quad/jetpack/skateboard behavior in 2-player, dog petting by both boys, toggle off resetting cleanly (Ahaan leaves, vehicles home).
3. Fix every issue you find, one at a time. After each fix, re-run the affected suite and record the result. A failed check stays recorded as failed — never quietly turn it into a pass.
4. Two-player specifics to verify with numbers: both boys move simultaneously without either freezing; camera keeps both in frame at max separation; toggle off → Ahaan gone, vehicles back at home spots, no console errors.
5. Publish: merge to main, push, wait for Pages, live-verify desktop + mobile with zero console errors. Record the publish in HANDOFF.md.
6. Fresh Drops standing rule: this publish gets a Fresh Drops entry (date + what changed + Try it line + screenshot of the live feature from publish verification). No entry without its screenshot.

## Report back
- Baseline results, each issue found + fixed (with the suite result after), publish merge + Pages run + live-verify result.
