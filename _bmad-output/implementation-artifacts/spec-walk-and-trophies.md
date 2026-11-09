---
title: Walk smoothing and discoverable chess trophies
type: feature
created: 2026-11-09
status: done
route: dispatch
baseline_commit: fd9334386b13dc6f814d5b552ac6ac103c39c3c4
context:
  - FEATURE-BRIEF-walk-and-trophies.md
  - AGENTS.md
---

<frozen-after-approval reason="User explicitly directed execution of Goku's complete feature brief">

## Intent

Make Vihaan move naturally through his 3D lobby and stairs, and make both verified chess awards visible and inspectable on the left shelving rack. Implement the entire coordinator brief, with no publishing.

## Boundaries & Constraints

Always preserve the site's style and existing ground/click/keyboard walking and HOOP, ARCADE, SIT ON STAIRS, chess actions. Work only on feature/3d-trophy-cabinet-showcase. Keep existing photo files and photo captions exactly unchanged. Award records are exactly those in FEATURE-BRIEF-walk-and-trophies.md; unknown venue/city/section/score fields must say not recorded or remain omitted with a clear unavailable label, never guessed. Reuse imported Three.js and add no new duplicate version. Support desktop and mobile, accessible keyboard modal controls and touch rotation. No pushes or deployments. Commit identity is Codex Worker <codex@localhost> (parent will commit).

VQA before/after evidence is mandatory under /tmp/vihaan-walk-vqa/. Parent captures and visually inspects it; implementation agent must not claim VQA passed. Existing before-state HTML and images are being captured by parent. Code everything first; parent runs verification after implementation. Parent handles HANDOFF.md updates and evidence listing. Independent review follows implementation.

</frozen-after-approval>

## Code Map

- index.html: self-contained primary scene ES module imports Three.js via importmap. Helpers canvasTex, box, rbox, cyl, sphere, limb, std/basic and existing modal patterns are reusable. Preserve existing photos/HTML captions.
- shelves() around 2538: dark cubbies x -11.4..-1.62, z -3.4, depth .6, cell width .815, height .83. Trophies must be visible in default desktop AND narrow mobile composition; choose visible cubbies and adequate lighting/contrast, optionally an accessible trophy action that frames the rack on mobile. Do not rely only on a remote offscreen object.
- Stairs constants around 2569: RISE .265, RUN .6, STEPS 14, BASE .39. Each tread i occupies X [-(i+1)*.6, -i*.6+.032], Y .39+i*.265; actual Z approximately [-2.635,-.515]. Landing X [-10.8,-8.4], height 3.835.
- vihaanCharacter()/vihaanRig around 2630..2850: character faces local +X. Existing legs are permanently bent sitting geometry hip→knee (.35,.01), ankle (.41,-.34), soles near (.47,-.437); whole-leg -1.25 rad animation and ground+.38 root causes penetration. Re-articulate thigh/shin/shoe, use two-link IK or equally robust independently placed feet with actual tread contact. Preserve seated appearance, blue hoodie, red shoes, cap, and kid proportions.
- getWalkHeight()/updateVihaanMovement around 3950..4160: current tread interpolation plus lagging root causes clipping. Use precise surface sampling per foot, planted stance/swing lift, distance-driven gait, smooth speed/shortest-angle turns. For +X facing model yaw=atan2(-dz,dx). Fix keys.up/down versus forward/backward mismatch, queued overshoot and stopped gait, reset keys on blur/modals/mode changes.
- walkVihaanTo/StairsTop/Bottom/ChessTable: reuse and preserve routed action behavior. Guard stair edges so ordinary traversal cannot walk off a landing and suddenly drop or pass through risers. Direct clicks currently hit arbitrary meshes: limit walking to tagged walkable surfaces/validated ground hits.
- pick()/canvas pointer handlers around 5190..5345: integrate trophy mesh picking without competing scene actions. Trophy dialog must suspend background control and queued movement while open; close resumes safely. Rotation via pointer capture + keyboard; close, Escape, backdrop; focus trap/restoration and scroll restoration.
- render() and __sblvl around 5400..5545: update trophy preview only while open, no runaway RAF/context leaks; include lightweight deterministic debug hooks for movement stepping and foot contact telemetry (not user-facing). Reuse imported Three.js in preview; no new CDN library.

## Tasks & Acceptance

**Execution:**
- [x] index.html — correct movement, footing, input, and seating transitions across stairs/ground/actions.
- [x] index.html — build two recognizable lit labeled trophies on left rack using verified award data; add discoverable mobile access if needed.
- [x] index.html — interactive rotatable trophy detail dialog with all known stats and explicit unknowns, clean open/close and restored controls.
- [x] Parent: capture/inspect before and after bottom/mid/top stairs on desktop/mobile, plus default rack and both cards; iterate on visible defects.
- [x] Parent: browser regression checks and handoff with exact evidence paths, results, and family photo decision.

**Acceptance Criteria:**
- Given home mode, when click walking or WASD/arrows moves Vihaan, then he faces travel, accelerates/decelerates smoothly, moves without frozen/bent skating poses, and comes to a natural stand.
- Given stair traversal, when moving up/down including bottom and landing transitions, then planted feet meet physical treads without clipping and swing feet clear risers; no arbitrary lagging root offset. Preserve sit/table action posture and existing scene games.
- Given desktop or mobile home view, when viewing/choosing awards, then both trophies are discoverable on the left rack with correct text labels.
- Given either trophy selected by click/tap/keyboard, when its card opens, then an interactive 3D model and verified event/date/finish/score/rating facts appear, unavailable facts aren't invented, background scene input pauses, and closing returns focus/control without console errors.
- Given final implementation, when parent completes visual inspection, then required evidence exists and no visible stair defects remain; no main push or publishing occurs.

## Implementation Notes

Investigation performed by parent and read-only subagent. No intent gaps or irreversible operations. Scope is explicitly authorized by the user's execution request; no extra planning approval needed. Primary code footprint is index.html only; parent owns workflow artifacts, HANDOFF.md, tests/evidence, and final commit. Prior ratings must remain 811 Regular / 814 Quick.

## Verification

Parent will use local Chrome/Playwright, inspect screenshot contact/posture, exercise normal UI controls and rotation/modal focus, compare original photo hashes/captions, check JS exceptions and the existing Three.js warning count, and run git diff --check. Any discovered defect triggers a fix and targeted repeat check.

## Spec Change Log

## Review Triage Log


### Worker verification notes

Both viewport UI suites passed, including all eight WASD/arrow directions, ascent/descent, normalized edge target, sit/chess/hoop/arcade actions, both award cards, keyboard/mouse/touch rotation, focus wrapping/restoration, and all dismissal paths. No console errors; one pre-existing duplicate Three.js warning per page. Max ankle reach .790 local versus .80 total leg length, zero center-support errors. Independent actual-mesh raycasts checked 13,260 planted shoe perimeter points ascending/descending: all within numerical precision of physical treads. First VQA defects were corrected before recapture. Before/after screenshots and scripts in /tmp/vihaan-walk-vqa; HANDOFF lists paths. Original photo bytes and captions checked unchanged. Parent has added repeatable Playwright checks under tests/. Review pending.

### Independent review triage (all three layers collected)

| Finding | Verdict | Evidence and route |
| --- | --- | --- |
| Blind 1: direct SIT/chess waypoints stall | high | Confirmed SIT from ground (-5,1) stalls against the new side guard. Patch with existing routed navigation. |
| Blind 2: trophy priority can intercept occluded object | maybe-false | Direct rack clicks/taps pass both default views; no specific reachable occluded interactive target was reproduced. Unverified medium; defer pending a camera/ray reproduction showing a nearer interactive surface. |
| Blind 3: blur clears queued actions | medium | New blur/visibility listeners call resetMovement() with default clearQueue=true. Patch to preserve destinations while clearing held keys. |
| Blind 4: resting heading not settled | medium | Position-only threshold can leave shoe yaw unchanged after a torso-only turn. Include heading in the existing rest selection/trigger. |
| Blind 5: physical perimeter misses corners | medium | Existing test checks four edge midpoints only. Add actual sole corners and retain independent mesh rays. |
| Blind 6: keyboard stair edges/reversal not checked | medium | Existing key assertions start on ground and scripted routes remain central. Add boundary/entry/reversal cases. |
| Blind 7: alternate action starting positions absent | medium | Existing SIT test starts on top landing; no left/right ground start. Add route completion checks. |
| Blind 8: handoff incomplete | low | Handoff is intentionally updated during ongoing work; final exact after paths/results still needed before commit. Direct document correction. |
| Blind 9: dependency setup missing | low | Tests document module override but no installation/version. Add exact verified Playwright version and isolated install command. |
| Edge 1: SIT from ground left stalls | high | Same confirmed root cause as Blind 1; same patch and alternate-start test. |
| Edge 2: chess teleport leaves old feet | high | Confirmed visible ankleReach 3.67 after chess→home→STAND movement. Reset cached foot/pelvis state on teleport, test immediate standing. |
| Edge 3: landing edge treated as floor | high | Physical landing Z[-2.7,-.45] exceeds sampler corridor; (-9,-.48) is a real landing point. Recognize full landing bounds then normalize safe targets. |
| Verification 1: no keyboard side-entry regression | medium | Pre-verified search found only ground key cases and central routes. Add blocked side entry and valid bottom entry checks. |

All confirmed code issues use existing functions/state and route as small patches; no intent or spec changes required. Tests/docs receive direct corrections. No review-driven changes to the frozen intent.

### Review patch verification follow-up

- Alternate SIT/chess starts on both sides, immediate standing after chess teleport, physical landing edge, bottom keyboard entry/reversal, rail boundaries, and blur queue preservation now pass.
- The new keyboard side test exposed a further medium issue: body rejection worked but foot anticipation could plant on a middle tread from outside. Routed as a small patch to the same boundary/foot-target logic, with adjacent click normalization checked for reachability.
- Expanded physical checks now sample eight sole perimeter points including corners, cover swing clearance as well as planted contact, require nonzero coverage, and assert both route endpoints. Current run: 33,328 points, no violations (see evidence JSON for authoritative count).
- Added a verified dependency installation command for Playwright 1.64.1. Key direction checks now allow one simulation second for natural turning/acceleration rather than requiring a large displacement during a half-second initial reversal.


### Final completion

All confirmed review findings patched and verified. Four browser checks passed; final mesh-contact report contains 33,328 corner/edge points with no violations. Exact before/after evidence, gallery, final verification results, and the one unverified picking-priority follow-up are recorded in HANDOFF.md. No push or publishing. Goku performs independent VQA and coordinates the next step.
