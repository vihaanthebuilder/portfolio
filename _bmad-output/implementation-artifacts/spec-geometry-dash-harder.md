---
title: Geometry Dash double spikes and tight jumps
type: feature
created: 2026-11-09
status: done
route: oneshot
baseline_commit: a4b4afc7c3d8ac4eab89306302d66886bdbb2da5
---

<frozen-after-approval reason="Vihaan chose double spikes and tight jumps; user directed execution of Goku's full brief">

## Intent

Change only the later level geometry in games.html's Geometry Dash mini-game: add two-spike-wide obstacles and narrower landing platforms/closer edges. Preserve at least the first ten seconds of the original opening, including what scrolls into view at nominal 60fps. Keep character, controls, physics, start/restart and all other games unchanged. No new pit mechanics or unrelated polish.

Prove a complete winning playthrough with the game's own update/jump/collision functions; record timing and clearance evidence for every new obstacle. Capture an actual browser screenshot of a double-spike section for Vihaan. Update HANDOFF.md throughout. Commit locally on feature/geometry-dash-harder using Codex Worker <codex@localhost>; no push or publication. Trophy photo correction was verified live before this dispatched brief.

</frozen-after-approval>

## Implementation Notes

- games.html geoDash IIFE owns all level construction, physics, drawing, and controls. Modify only pattern and constructor's new geometry tokens; keep update(), draw(), jump(), start()/reset() and input handlers intact.
- Existing physics: SIZE 24, SPEED 2.7px/frame, GRAV .62, JUMP -10.6, UNIT 40. Canvas width 380. Paired spikes use existing obstacle.n/rendering/collision path with n=2. Existing ground has no pits; tight landings will use narrower platforms and nearby hazards.
- Preserve original prefix through index43 (world X2100); at frame600 camera X1620, viewport right X2000, before new geometry is visible.
- Node verification will extract the production IIFE into a stub DOM/canvas VM, search jump/no-jump states, and replay the resulting complete path without copying physics. Browser will replay those inputs through the same production update using temporary instrumentation only for evidence. No debug/autoplay feature shipped to the child.

- Final geometry: 10 pairs and 10 narrow platforms, original finish X5540 retained. First changed object visible at 12.10 seconds at nominal 60fps. Production diff is only comments, pattern and new construction tokens.
- Node winning witness: frame2052, 26 jumps, all ten new platforms landed and all ten pairs cleared. Minimum spike collision-threshold clearance 8.08px. Each later jump swept ±12 input frames while holding others fixed; 3–22 tested successful frames, tightest three consecutive frames (~50ms at 60fps). These are conditional tested windows, not an exhaustive measure of all possible strategies.
- Chrome independently replayed the sequence through actual canvas mouse handlers, reached real 100% win, and captured the paired spikes. A second mobile page used normal requestAnimationFrame scheduling and verified camera advancement, ArrowUp, touch jump, crash, and restart advancement. Space also passed. No page exceptions.
- Proof SHA-256 binds browser replay to the current geoDash source. No production test hooks or autoplay. Detailed results and screenshots are under /tmp/vihaan-geodash-harder and referenced in HANDOFF.md; tests/README.md documents server, dependencies, command order and artifacts.

## Review Triage Log

- Low — timing tolerance was not measured beyond a single winning sequence. Verified proof coverage gap; added actual-physics ±12-frame full-win sweeps for each later input and recorded successful frames. No product change needed.
- Medium — deterministic browser replay bypassed normal loop scheduling. Verified test gap; added a separate page with ordinary RAF and Start/restart camera advancement assertions; passed.
- Medium — touch and ArrowUp were untested. Verified missing cases; normal mobile-emulation page now exercises both production handlers; passed.
- Medium — browser could reuse stale proof JSON. Verified missing source binding; proof now includes source SHA-256 and browser refuses a mismatch. Current matched proof passed.
- Low — new test invocation lacked complete server/dependency/order guidance. Added Geometry Dash section in tests/README.md with all prerequisites, commands and outputs. No deferred findings.
