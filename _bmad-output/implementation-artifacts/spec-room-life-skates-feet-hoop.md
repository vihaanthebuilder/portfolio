---
title: 'Room Life skateboard wheels, stable feet, and basketball shot'
type: 'feature'
created: '2026-11-22'
status: 'in-progress'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: '379ec99e74abd76eff4d032129cf88bdc52e8097'
---

<frozen-after-approval reason="human-owned intent — execute the dispatched Room Life skateboard, feet, and hoop brief">

## Intent

**Problem:** The Room Life skateboard’s wheels are hard to see and do not roll convincingly, Vihaan’s planted feet look unstable, and the basketball disappears from the room rather than showing him shooting it.

**Approach:** Make board wheels and trucks legible and roll them from actual travel while preserving the existing carry, stunt, grind, and landing route. Inspect and correct only a reproduced visible foot wobble while preserving planted contact and stair guards. Keep a basketball visible in Room Life and use the existing hoop physics for a repeatable shot animated from Vihaan’s hand, with kind score feedback and a ready-again ball.

## Boundaries & Constraints

**Always:** Keep the room, board dimensions and pickup/Enter interactions, movement guards, stair support sampler, existing drag/Space hoop controls, and current score rules. Keep motion smooth, calm, and without sound or pressure. Verify desktop 1280×800 and mobile 390×844.

**Never:** Weaken planted-foot tolerances or movement boundaries to hide wobble. Break the TV-to-stairs carry, stunt, rail grind, dismount, or clean landing. Copy code from Ahaan’s Park repo. Add dependencies or modify unrelated room props.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Board rolling | Enter to ride; steer across floor or into rail | Four visible wheels spin around their axles according to distance; board rolls smoothly and remains stable on the rail | No per-frame accumulated drift; settle cleanly on landing |
| Board sequence | BOARD RUN from TV | Pickup, carry, top stunt, rail grind, and landing complete in order | Preserve existing route guards and reset/dismount behavior |
| Foot plant | Walk, turn, diagonal, or climb stairs | Shoes stay flat, stable, and supported when planted; swing feet clear treads | Keep planted sole gap within current ±0.005 test tolerance |
| Hoop shot | Choose HOOP, then shoot | Ball is visible at Vihaan’s hand, arm follows through, and ball travels through the rim with gentle score feedback | Failed shots return to a ready position; repeat shots work |
| Return and repeat | Shot finishes or misses | Ball returns to the player/ready position for another shot | No ball remains hidden or permanently live |

</frozen-after-approval>

## Code Map

- `index.html` -- skateboard construction near `skateboard` (~5342), `updateSkateboardPose()`, `startBoardRun()`, and carry/stunt/grind branches in `updateVihaanMovement()`. Wheel groups now have tread, hubs, truck plates, and a widened axle stance; roll phase follows signed distance traveled. Deck/TV offsets put the wheels on the support surface. Existing route and Enter interactions are preserved.
- `index.html` -- `footDestination()`, `poseWalkingLeg()`, and `updateFeet()` (~4310–4400) own world-space planted shoes, IK, support, and swing. Inspect rendered flat-ground turns and stairs before edits. Preserve `walkableMeshes`, stair quantization, and all contact bounds.
- `index.html` -- basketball remains visible in home, follows Vihaan's shot hand on approach and throughout hoop mode, and reuses the existing gravity/rim/backboard/scoring physics. Existing shot controls and score rules are unchanged.
- `tests/room-life-feature.cjs`, `tests/room-life-fixes.cjs` -- desktop/mobile coverage asserts four wheels, spin, TV rest, route/grind/landing/reset, ball-at-hand, score crossing, ready-again, and repeat shot.
- `tests/walk-and-trophies.cjs`, `tests/walk-physical-contact.cjs`, `tests/walk-picking.cjs`, `tests/walk-boundaries.cjs` -- preserve support, navigation, picking, and boundary behavior. Current physical-contact test raycasts eight shoe-sole points and requires planted gaps within ±0.005 across 33k+ samples; it does not measure visual wobble.
- `FEATURE-BRIEF-room-life-skates-feet-hoop.md` -- dispatched user intent. Sally’s reference file remains untracked and is not a source of scene-specific approval.

## Tasks & Acceptance

**Execution:**
- [x] `index.html` -- add clear four-wheel/truck geometry and spin each wheel around its axle based on signed board travel; keep the existing board route and dimensions.
- [x] `index.html` -- inspect planted shoe transforms and correct any reproduced wobble without changing the support sampler or guards. Visual captures show planted shoes flat on floor/treads; no solver change was needed. Contact sampling remains unmodified.
- [x] `index.html` -- restore a visible basketball in Room Life and connect a Vihaan hand-shot animation to existing hoop physics, score feedback, and ready-again state.
- [x] `tests/room-life-feature.cjs`, `tests/room-life-fixes.cjs` -- cover wheel spin, full board route, foot stability, visible ball, score crossing, and repeat shot on desktop/mobile.
- [x] `HANDOFF.md` -- record baseline, visual/contact findings, each fix and rerun, publication, Fresh Drops screenshot, and live desktop/mobile verification. Fresh Drops follow-up publish/live check is tracked in HANDOFF.

**Acceptance Criteria:**
- Given the skateboard is rolling, when it moves across the floor or grinds the rail, then four visible wheels spin along their axles and the complete pickup-to-landing sequence remains smooth.
- Given Vihaan walks in every cardinal/diagonal direction or on stairs, when a shoe is planted, then it stays flat and stable with zero sampled planted-foot errors under the existing tolerance.
- Given Vihaan starts the hoop interaction, when he releases the ball from his hand, then his shot animation accompanies a visible arc through the rim, kind score feedback, and a ball ready for another shot.
- Given desktop or mobile Room Life and all required walk suites, when checks run, then there are zero unexpected console/page errors and existing controls, guards, and contact remain valid.

## Implementation Notes

- Baseline is `379ec99e74abd76eff4d032129cf88bdc52e8097` on `feature/room-life-scene`. No planning-artifacts directory is present; prior Room Life and walking specs supply the existing invariants.
- No unresolved user-visible choice remains. Ahaan shooting is optional in the brief and may be deferred if it would expand the existing single-player shooting path.
- Publishing to `main` and GitHub Pages is already authorized by the overnight HANDOFF and the brief. Fresh Drops requires a screenshot captured from the live scene; do not add the card before that capture exists.
- Final footprint is `index.html`, `tests/room-life-feature.cjs`, `tests/room-life-fixes.cjs`, and `HANDOFF.md`; publication will add a live screenshot under `images/fresh-drops/` and a `fresh-drops.html` card. No new page, runtime dependency, or copied Park code.

## Verification

**Commands:**
- Run `room-life-feature.cjs`, `room-life-fixes.cjs`, `walk-and-trophies.cjs`, `walk-physical-contact.cjs`, `walk-picking.cjs`, and `walk-boundaries.cjs` using the existing Playwright module; retain one persistent VQA folder per suite.
- Capture and inspect board wheels while rolling and grinding, planted feet standing/walking/on stairs, and the ball arc at 1280×800 and 390×844. Record board progression, contact counts/gaps, scoring/repeat state, and errors.
- After publish, verify the live scene and the Fresh Drops card/screenshot at desktop and mobile.

## Verification completed locally

- `room-life-feature.cjs` PASS on desktop 1280×800 and mobile 390×844, including four-wheel geometry/spin, TV rest, rail grind, landing/reset, with `errors: []`. Final report and captures: `/tmp/vihaan-room-life-scene/skates-hoop-final/`.
- `room-life-fixes.cjs` PASS: ball starts in Vihaan's hand, follows a descending make for +2 with “Nice swish!”, returns ready, and accepts a second shot. Jetpack, arcade, and board-run regressions also pass; `errors: []`. Evidence: `/tmp/vihaan-room-life-scene/skates-hoop-fixes-final/`.
- `walk-physical-contact.cjs` PASS, 33,968 sole samples, `bad: []`, min planted gap `8.34e-10`, max `0.6700000008` including swing steps. `walk-and-trophies.cjs` PASS desktop/mobile with zero contact/page errors (one existing duplicate-Three.js warning); `walk-picking.cjs` PASS desktop/mobile; `walk-boundaries.cjs` PASS 13/13.
- Inspected `feetStanding-closeup.png`, `feetWalking-closeup.png`, and `feetStairs-closeup.png`: planted shoes remain flat and supported, with swing clearance on the walking frame. No IK or support tolerance changes were warranted. Inspected `desktop-skateboard-wheels.png`, `mobile-skateboard-wheels.png`, `desktop-skateboard-grind.png`, and `basketball-made-desktop.png`.
- Published at merge `ffa6927d186c2d684736c66cd286ce76061c5fe3`; Pages run `45067722110` succeeded. Repeated `room-life-feature.cjs` against the live site at desktop/mobile and `room-life-fixes.cjs` against live; both passed with zero unexpected browser errors. Evidence is under `/tmp/vihaan-room-life-scene/skates-hoop-live-feature/` and `skates-hoop-live-fixes/`. Added live-captured Fresh Drops image `images/fresh-drops/room-life-skateboard-hoop.png`; its card follow-up deployment is not yet complete.

## Review Triage Log

- Corrected the wheel axle mismatch and moved tires outward from under the deck after visual inspection showed only two wheels from common angles. Raising the deck and lowering the TV rest offset resolves wheel/deck clipping and TV float while keeping the board route and control behavior unchanged.
- Kept the existing foot solver after standing, walking, and stair captures plus 33,968 clean support samples showed no reproducible planted-foot wobble.
- Added hand attachment both on entering hoop mode and during held-ball frames; the preexisting camera-held fallback could otherwise leave the ball far from the avatar when the court mode opened.

## Review Triage Log
