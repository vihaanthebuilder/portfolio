---
title: 'Room Life jetpack flight controls and pose'
type: 'feature'
created: '2026-11-22'
status: 'in-review'
baseline_commit: '084ded4aadc2a0003b5c0886d90478cf35e567ba'
route: 'dispatch'
review_loop_iteration: 0
context: []
---

<frozen-after-approval reason="human-owned intent — execute the dispatched Jetpack brief">

## Intent

**Problem:** With a jetpack enabled, each boy still looks and moves as though he is walking, and the exhaust is static. Flight height cannot be controlled independently.

**Approach:** Keep Shift/Q as flight toggles, add held-key altitude control, use a stable airborne leg pose instead of ground foot IK, and animate the existing warm exhaust meshes smoothly. Releasing rise returns to hover; switching flight off lands gently.

## Boundaries & Constraints

**Always:** Keep arrow/WASD steering, existing flight toggles, and mounted-flight coverage working. In two-player mode Vihaan uses Space to rise and Ahaan uses R so neither takes the other's movement or interaction keys. Cap height below the room ceiling, reset foot anchors on landing, and keep motion calm with no strobing.

**Never:** Copy from Ahaan's Park repo, add a dependency, add sound or a new page, or break normal grounded gait and stair contact. Publish only the Room Life feature and its Fresh Drops record under the existing driver-authorized workflow.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Hover and rise | Flight on; hold Space (Vihaan) or R (Ahaan) | Smooth lift to a room-relative safe ceiling; no walking cycle or planted-foot stepping | Clamp at the ceiling |
| Release to hover | Release the assigned rise key while flight remains on | Gentle return to the hover height | Never snap to ground |
| Land | Turn flight off during ascent or hover | Smooth descent; grounded IK reseeds and normal walking resumes | Clear held rise state on keyup, blur, mode change, or toggle off |
| Two players | Both flight toggles on; hold Space and R independently | Both rise without key stealing; hint names each player's key | Preserve arrows/WASD and Enter/E interactions |
| Exhaust | Hover, rise, and land over time | Existing flames move smoothly and grow under thrust | Keep emissive values bounded and non-flashing |

</frozen-after-approval>

## Code Map

- `index.html` -- `updateVihaanMovement()` currently calls `updateFeet()` during flight and adds altitude after grounded pose calculation; branch the flight pose before foot IK and reseed `vihaanRig.feet` (`position`, `swing`, `standY`) at landing. `updateAhaanMovement()` drives a gait rotation from `walkT`; suppress it while airborne. Keep both ground samplers and guards unchanged. Keep the home camera aimed at the players as they rise.
- `index.html` -- keyboard handlers around `keydown`/`keyup` already reserve Shift/Q toggles; add held Space/R state in home mode and clear held states in `resetMovement`/blur. `hintEl` is the existing accessible responsive pill. `makeJetpack()` creates reusable warm cone meshes; animate their transforms/material intensity without allocating materials per frame.
- `tests/room-life-fixes.cjs` -- existing jetpack lift, controls, and quad-riding assertions; extend it for altitude rise/hover/land, pose freeze, exhaust motion, and two-player input independence. Keep the recorded initial threshold failure in HANDOFF.
- `tests/room-life-feature.cjs`, `tests/walk-and-trophies.cjs`, `tests/walk-physical-contact.cjs`, `tests/walk-picking.cjs`, and `tests/walk-boundaries.cjs` -- existing desktop/mobile interaction and grounded-walking regressions.

## Tasks & Acceptance

**Execution:**
- [x] `index.html` -- implement held rise, hover, safe cap, gentle landing, responsive hint, and independent two-player inputs while preserving steering and mounted behavior.
- [x] `index.html` -- suppress the walking pose/foot planting in flight; animate existing exhaust with a calm thrust response and reset foot anchors after landing.
- [x] `tests/room-life-fixes.cjs` -- add durable flight altitude, leg pose, flame, landing, and two-player input checks.
- [ ] `HANDOFF.md` -- record baseline, each fix and rerun, publish, Fresh Drops screenshot, and live desktop/mobile verification.

**Acceptance Criteria:**
- Given flight is enabled, when either boy moves horizontally, then he glides without a walk cycle or grounded foot stepping.
- Given Vihaan holds Space or Ahaan holds R in two-player mode, when flight is enabled, then that player rises smoothly to a room-relative cap without changing the other player's altitude.
- Given the rise key is released, when flight stays enabled, then altitude settles gently to hover; when flight is disabled, then he lands and grounded walking resumes with fresh foot anchors.
- Given flight is hovering or thrusting, when two captures are taken apart, then the warm exhaust visibly moves and is larger under thrust without flashing.
- Given 1280×800 desktop or 390×844 mobile, when the scene and all existing movement suites run, then no unexpected page/console errors occur and grounded contact remains valid.

## Implementation Notes

- Investigation: Vihaan's `updateFeet()` owns world-space planted feet and pelvis height; skipping it during flight without a one-time landing reset would preserve stale takeoff anchors. Ahaan uses the shared leg groups and a gait rotation. The ceiling plane is at y=7.6.
- Implementation: flight draws the articulated leg meshes at a static trailing ankle target, and grounded `updateFeet()` remains authoritative outside flight. The Room Life camera follows active flight altitude so the avatar stays within the desktop/mobile frame, then returns to the room framing as soon as flight is toggled off.
- Intent gaps: none remain after repository/history inspection. R is selected for Ahaan because WASD moves and E interacts; Q remains his flight toggle. The hint will state the mapping.
- Irreversibles: publishing to `main` and GitHub Pages is an external side effect, already authorized by the Nov 22 overnight driver instruction and the brief's publish directive. Capture and include a live flight screenshot in Fresh Drops.
- Footprint: `index.html`, `tests/room-life-fixes.cjs`, and `HANDOFF.md`; no new runtime dependency or page.

## Verification

**Commands:**
- Run the durable Playwright suites `room-life-fixes.cjs`, `room-life-feature.cjs`, `walk-and-trophies.cjs`, `walk-physical-contact.cjs`, `walk-picking.cjs`, and `walk-boundaries.cjs` with the existing Playwright module and one persistent VQA folder per suite.
- Inspect flight and landing screenshots at 1280×800 and 390×844; record altitude samples, the ceiling cap, flame transform/intensity differences, and console/page errors.

## Review Triage Log

- **patch / medium** — The brief's mobile viewport included no way to hold Space or R because flight buttons only toggled flight. Added held touch rise buttons for each active flyer; mobile Playwright coverage presses and releases Vihaan's control.
- **patch / medium** — The camera returned to room framing as soon as flight was switched off, while the avatar could still be high in its descent. Camera tracking now follows full altitude until near the hover height, then eases down as the avatar approaches the floor.
- **patch / low** — The flight hint replaced steering and toggle instructions. It now includes the Shift/Q toggle and horizontal steering keys as well as rise controls.
- **patch / medium** — `room-life-feature.cjs` covered the flight toggle but did not exercise Space rise. Added an actual held-Space altitude assertion on desktop and mobile.
- **patch / medium** — Ahaan's airborne movement/gait was untested. Added simultaneous Space/R rise, WASD glide, frozen gait clock, and stable leg-pose assertions.
- **patch / low** — The exhaust test did not assert that flames disappear after landing. The landing assertion now checks all four nozzles are hidden.
- **patch / medium** — Landing checked that feet were reseeded but not that they touched the floor. The landing assertion now compares each foot anchor to its sampled support height.
- **patch / medium** — The ceiling target could lower when a flyer moved onto higher stairs while current altitude remained above the new target. Altitude is now clamped to the recomputed ceiling every flight frame.
- **patch / medium** — Flight screenshots did not verify camera framing during ascent. Desktop and mobile checks now project the flyer and assert the avatar remains in view.
