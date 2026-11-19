---
title: 'Room Life scene fixes and play sequences'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'c9d3f4a4b0a2f81198648b2ee779f1bda88e58bc'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** The published Room Life scene has reports of crooked walking, an unexplained white boot mark, a grown-up-looking avatar, broken railing, and disconnected play interactions. The room also needs clearer scenery and playable choices for both boys.

**Approach:** Repair the avatar, stairs, rides, basketball and arcade interactions, and expand the room with distinct plants, motivating trophy display, windows, and visible two-player gear. Keep the existing room as the setting and verify the result on desktop and phone.

## Boundaries & Constraints

**Always:** Preserve stable walking guards, foot contact, room paths, game rules and current controls outside the changed interaction. Keep both boys and their rides visible and matched; use gentle, age-appropriate presentation. Verify visual changes with Sally and record findings. Local commits only.

**Never:** Publish, merge, or push in this dispatch. Add pressure, scores, fail states, or autoplay sound. Leave Ahaan seated on an invisible vehicle. Remove scene features unrelated to this brief.

</frozen-after-approval>

## Code Map

- `index.html` -- inline Three.js scene and all requested features. Avatar geometry is in `vihaanCharacter()` (~2810–2990); walking and IK are `guardedPositionFor`, `footDestination`, `poseWalkingLeg`, `updateFeet`, `updateVihaanMovement` (~4240–4620); stair/rail geometry ~2650 and ~4700; arcade cabinet setup ~3260 and game selection `selectArcadeGame`/dock (~5410–5700); hoop ball physics `heldPos`, `throwBall`, `ballStep` (~5995–6040); room walls and shelves ~2550–2610; quad/skateboard ~5119–5225; plants `makePlant`, `makeLargePlant` (~5179–5205); `setTwoPlayerMode` (~4480).
- `tests/room-life-feature.cjs` -- existing browser harness for desktop/mobile, controls, plants, dog, rides and camera; extend for changes here.
- `tests/walk-physical-contact.cjs`, `tests/walk-boundaries.cjs`, `tests/walk-picking.cjs`, `tests/walk-and-trophies.cjs` -- preserve gait contact, guards, floor picking and room navigation.
- `FEATURE-BRIEF-room-life-fixes.md` -- full dispatch intent. `sally-ux-review-2026-11-12.md` -- project UX guardrails: sensory-friendly motion, sound off until requested, readable contrast, visible focus, and kind non-pressure feedback.

## Tasks & Acceptance

**Execution:**
- [ ] `index.html` -- trace cardinal walking on flat ground and stairs, then fix heading/steering so actual path matches input without weakening IK or guards.
- [ ] `index.html` -- inspect the white boot detail in close-up, identify its source, and remove only the unintended artifact.
- [ ] `index.html` -- adjust kid proportions and stature to read as a grade-three child; review character, gait, proportions and plant placement with Sally before finalizing these visual choices.
- [ ] `index.html` -- repair stair railing alignment and continuity without changing stair dimensions.
- [ ] `index.html` -- make the quad motor-driven; remove rider pedaling and show a stable seated posture.
- [ ] `index.html` -- add a coherent skateboard pickup from TV top, carry uphill, simple top stunts, rail grind and safe landing sequence.
- [ ] `index.html` -- animate Vihaan holding and shooting the basketball while keeping existing drag/space shooting behavior.
- [ ] `index.html` -- wire cabinet joystick/buttons and game pills to one shared six-choice arcade selector.
- [ ] `index.html` -- give Ahaan a visible blue vehicle and separate blue quad; keep Vihaan's red quad, and add a jetpack for each boy with understandable controls.
- [ ] `index.html` -- replace repetitive small plants with distinct recognizable species in planters, retaining 14 small and 3 large; review placement/clutter with Sally.
- [ ] `index.html` -- add a warm plaque/light and low-pressure motivational cue at the trophy shelves.
- [ ] `index.html` -- add warm windows with visible sky/light on blank walls without obstructing walkways.
- [ ] `tests/room-life-feature.cjs`, `tests/README.md`, and `HANDOFF.md` -- add durable behavior/visual checks and record evidence, review limits, and local commit.

**Acceptance Criteria:**
- Given flat ground or stairs, when Vihaan walks along a cardinal input/waypoint, then his root path and facing stay aligned, planted shoes remain supported, and room/stair guards still hold.
- Given the boot close-up, when its white geometry is inspected, then only intended trim remains and no detached/flickering artifact is visible.
- Given the avatar beside known room furniture, when viewed at scene scale, then kid proportions read clearly without breaking gait or foot reach; Sally's review of character and plants is recorded.
- Given each requested activity, when mounted, picked up, selected, or played, then the quad is motorized, board sequence completes to a stable landing, Vihaan visibly shoots the ball, and physical/dock arcade selectors agree on all six games.
- Given Play Together, when Ahaan joins or either boy uses flight gear, then each boy has a visible correctly colored quad and usable jetpack; no rider animates over an invisible cycle.
- Given the room's decor, when viewed at desktop and phone sizes, then varied plants, trophy encouragement and warm sky-visible windows improve readability without blocking navigation or causing overflow.
- Given desktop 1280×800 and mobile 390×844, when the durable scene checks run, then no unexpected page/console errors occur.

## Implementation Notes

The human explicitly asked to execute the complete follow-up brief, so its independently shippable items remain in scope. Existing worktree is `feature/room-life-scene` at the published implementation baseline. The worktree HANDOFF has been updated before source changes. Sally's reference reviews Ahaan's portfolio pages and contains no direct opinion on Vihaan's 3D model or plants. Its grade-three audience context and sensory-friendly principles guide the local visual assessment in `sally-room-life-review.md`; those scene findings are worker observations, not Sally's direct approval.


## Verification

**Commands:**
- `PLAYWRIGHT_MODULE=/Users/Nishant/dev-tools/browser-check/node_modules/playwright VIHAAN_BASE_URL=http://127.0.0.1:18876 VIHAAN_VQA_DIR=/tmp/vihaan-room-life-fixes node tests/room-life-feature.cjs` -- desktop/mobile scene interactions, all new vehicle and arcade paths, no overflow or unexpected errors.
- Run `tests/walk-physical-contact.cjs`, `tests/walk-boundaries.cjs`, `tests/walk-picking.cjs`, and `tests/walk-and-trophies.cjs` with the same browser environment -- existing navigation and planted-foot behavior remains sound.
- Visually inspect avatar/boot, stair rail, skateboard sequence, hoop shot, arcade menu, plant set, trophy shelves, windows, and both players at 1280×800 and 390×844; save captures under `/tmp/vihaan-room-life-fixes/`.

## Review Triage Log

- `low / patch` — Blind Hunter: physical cabinet start did nothing on “All Full Games.” It now opens the same game-library link as Enter; the regression test checks the link and navigation.
- `medium / patch` — Blind Hunter: the hoop action and follow-through lacked coverage. The test now clicks HOOP from the court and asserts the shot arm pose and ball release.
- `medium / patch` — Blind Hunter: jetpack height was discarded by the ride pose. The ride height now includes the damped flight altitude; the test covers flight while riding.
- `medium / patch` — Blind Hunter: Ahaan's quad stayed parked when he walked. It now follows his position and heading; desktop and mobile checks compare quad and rider positions.
- `low / patch` — Blind Hunter: arcade dock instructions did not explain selection/start behavior. The arcade hint now names joystick/dock selection, cabinet-button/Enter start, and the full-games destination.
- `medium / patch` — Blind Hunter: scene-specific Sally findings were absent. Read Sally's reference and recorded a scene assessment in `sally-room-life-review.md`, explicitly distinguishing its guardrails from our visual observations; the source itself has no 3D verdict.
- `medium / patch` — Blind Hunter: the new regression harness did not cover mobile flight controls. The desktop/mobile scene harness now toggles Vihaan flight on both viewports.
- `low / patch` — Blind Hunter: plant verification checked names/counts only. Added a geometry-scale silhouette signature assertion and recorded visual placement review in Sally's notes.
- `false` — Blind Hunter: execution checkboxes remain unchecked. The review workflow forbids changing this build's spec to address review findings; the required Step 05 status change will mark the spec done.
- `false` — Edge Case Hunter: flight altitude accumulates upward every frame. `updateFeet` resets the standing height before the offset is applied, and the ride branch resets the rider height; added a riding case where a real loss of altitude was found and fixed separately.
- `false` — Edge Case Hunter claim: the flight implementation makes jetpack unusable. Desktop and mobile walking flight tests pass, and quad-riding flight now adds altitude to its rider pose.
- `medium / patch` — Verification Gap Reviewer: the visible BOARD RUN button was bypassed by the direct function call. The regression now clicks the button and checks the full safe landing.
- `medium / patch` — Verification Gap Reviewer: flight buttons and `aria-pressed` were not covered. The regression clicks both buttons and checks each player's flight state; mobile checks Vihaan's control.
- `medium / patch` — Verification Gap Reviewer: cabinet button interaction was not tested. The regression now clicks a physical start button after joystick selection and verifies the game starts.
