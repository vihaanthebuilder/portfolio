---
title: 'Room Life scene comforts, rides, and two-player play'
type: 'feature'
created: '2026-11-18'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
context: []
baseline_commit: 'a574a564e59d28ac261729b8aa33a2a67c1026b8'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Vihaan's Room Life has a slightly floaty walk, plants that do not meet their soil, and no quad, skateboard, dog petting, or way for Ahaan to join.

**Approach:** Improve the existing room in `index.html` with a grounded gait, connected and larger plants, safe child-sized rides, friendly dog interaction, small cozy details, and an optional two-player mode.

## Boundaries & Constraints

**Always:** Keep the existing room, stairs, walking paths, and foot IK. Keep the new props non-colliding. Quad and skateboard remain Vihaan's. In two-player mode Vihaan uses arrows + Enter and Ahaan uses WASD + E; single-player keeps current controls. Label both players and frame them together. Both can pet the dog. Turning play together off hides Ahaan and returns vehicles home.

**Never:** Redesign or move the stairs; block room paths; add scores, timers, fail states, or autoplay sound; change or copy the separate Ahaan Park quad implementation; publish or push.

</frozen-after-approval>

## Code Map

- `index.html` -- home scene/avatar UI and `vihaanState`; keyboard routing at `keydown`/`keyup`; camera `targets()`; movement in `guardedPositionFor`, `getWalkHeight`, and `updateVihaanMovement`; plant arrays and vehicle models near `room life: Vihaan's quad and planted greenery`; dog model, `petDog`, `pick`, and pointerdown interaction. Keep the existing stair guards and single-player click-to-walk.
- `Ahaan's portfolio/assets/park3d.js` (reference only) -- two-player precedent: off-by-default toggle, arrow keys routed to Vihaan while Ahaan keeps WASD, E for Ahaan, DOM name labels projected above actors, camera tracking both. Adapt the interaction pattern; do not copy the separate park scene or quad.
- `tests/walk-and-trophies.cjs`, `tests/walk-physical-contact.cjs`, `tests/walk-picking.cjs`, `tests/walk-boundaries.cjs` -- existing walk regressions to rerun.

## Tasks & Acceptance

**Execution:**
- [x] `index.html` -- finish a subtle swing-foot correction while preserving planted-foot IK and stair guards; confirm all 14 small plants meet their soil and add edge-positioned ficus/palms.
- [x] `index.html` -- replace the old bike with a red four-wheel quad at `[-1.6, 0, 0.35]`, with Enter mount/dismount and gentle acceleration capped near 2.8 units/s; add a skateboard near stairs that rides normally and safely grinds the rail to the bottom.
- [x] `index.html` -- make dog proximity action and canvas click/tap trigger reach, wag, bounce, and “Good dog!” without moving the dog; add small cozy decor without changing the layout.
- [x] `index.html` -- implement the optional Play together toggle, separate movement keys, E dog petting, player labels, shared camera framing, and vehicle reset when disabled.
- [x] `HANDOFF.md` -- record the initial walking observation, final spots/speeds/controls, verification evidence, and anything unverified.

**Acceptance Criteria:**
- Given flat ground or stairs, when Vihaan walks at normal speed, then planted feet stay supported without sliding, floating, or sinking.
- Given any of the 14 pots, when viewed close up, then stems emerge from soil inside the pot; added large plants sit at room edges without blocking movement or objects.
- Given proximity to the quad or skateboard, when Enter is pressed, then Vihaan mounts or dismounts; the quad stays within room/stair guards and caps near 2.8 units/s; the board rides on flat ground and completes a rail grind to the bottom.
- Given proximity to or a click/tap on the dog, when petting starts, then Vihaan reaches down, the dog wags and bounces, and a kind line appears while the dog stays fixed.
- Given Play together is off, when the room loads, then only Vihaan is present and existing controls still work. Given it is on, then Ahaan appears with his name, moves with WASD, Vihaan moves with arrows, E and Enter pet the dog for their respective player, and the camera frames both. Given it is turned off, then Ahaan leaves and both vehicles return home.
- Given desktop 1280×800 or mobile 390×844, when the scene is exercised, then layout remains usable and there are no unexpected page/console errors; the known `images/dog.bin` 404 remains the documented fallback request.

## Implementation Notes

The initial walking adjustment and its four regression checks were completed before workflow recovery; evidence is recorded in HANDOFF. Nishant explicitly instructed continuing the Room Life brief after the workflow render fix, so this spec is being advanced without an additional approval pause. Implementation remains local to the feature worktree.

## Verification

**Commands:**
- `node tests/walk-physical-contact.cjs`, `node tests/walk-picking.cjs`, `node tests/walk-boundaries.cjs`, and `node tests/walk-and-trophies.cjs` -- expected: movement, picking, trophy, and boundaries pass (the known dog asset 404 is excluded only from the expected console-error assertion).
- Browser checks at 1280×800 and 390×844 -- expected: quad, skateboard grind, dog pet, player toggle/controls/camera, plant placement, and no viewport overflow or unexpected errors; save screenshots under `/tmp/vihaan-room-life-scene/`.

## Review Triage Log

- false — The implementation tasks were unchecked while the spec entered review. They are now checked against the implementation and browser evidence above; no incomplete task remains.
- false — Quad dismount returning it to its parked position is an intentional, verified behavior; the quad's home position is specified and the toggle-off reset is separately verified.
- medium — Enter could not dismount during a skateboard grind although the visible prompt offered that action. `interactNearVihaan()` now ends the grind and stands Vihaan on the current stair/floor position; the browser test verifies dismount and remount mid-grind.
- false — The skateboard prompt's hop-off text described an action that had been blocked during a grind; the same finding is covered by the preceding fix and is no longer present.
- false — Ahaan's E handler pets only within 1.2 units, and the canvas dog click is an explicit direct interaction; the specific claim that E pets from anywhere is contradicted by `interactNearAhaan()`.
- false — “Good dog!” is transient feedback, not an action prompt; its `data-player=none` intentionally prevents a second interaction during the feedback state.
- false — `updateWorldInteraction()` sorts player choices by distance before selecting the nearest eligible prompt, so the closer player's dog action takes precedence.
- false — Desktop/mobile overflow is now asserted by `tests/room-life-feature.cjs` at 1280×800 and 390×844; the run passed.
- medium — Two-player separation correction could move a walking avatar beyond its movement guards. The corrected candidate is now revalidated through the same guard; persistent feature test and existing boundary checks pass.
- false — The Ahaan spawn clamps its x coordinate and explicitly shifts left if it equals Vihaan's x, so the claimed overlap at the right edge does not occur.
- false — The repo now has persistent behavior checks for two-player controls/interactions, quad, skateboard grind/dismount/landing, and reset in `tests/room-life-feature.cjs`.
- false — The vehicle behavior is covered by the same persistent browser test, including speed cap, rail grind, landing, and reset assertions.
