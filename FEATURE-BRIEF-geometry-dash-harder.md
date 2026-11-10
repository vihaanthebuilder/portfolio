# FEATURE BRIEF — Geometry Dash: Harder (queued by Goku, Nov 9, 2026)

Requested by Vihaan himself (via Goku, Nov 9, 2026 ~3:17 PM CT). He picked the
difficulty style: DOUBLE SPIKES + TIGHT JUMPS.

STATUS: QUEUED. Do not start until the trophy-photo fix publish is fully
finished and verified live, and Goku dispatches this brief. One change at a
time.

## The job

Find the Geometry Dash-style game in this project (arcade / games area) and
make its level harder in exactly these two ways:

1. Double spikes: use two-spike-wide obstacles in the harder sections, so the
   player has to make one clean longer jump over both.
2. Tight jumps: narrower landing gaps / closer platform edges in the harder
   sections, so jumps need precise timing.

## Rules

- Keep the opening section easy (roughly the first 10 seconds unchanged), so
  players can learn before it gets hard.
- HARD BUT BEATABLE: verify with the game's own jump physics that every new
  jump is actually clearable (jump height and distance). No impossible jumps.
  Run a full playthrough check (automated if the game supports it, or a
  step-through of each obstacle) and record the result in HANDOFF.md.
- Change nothing else in the game: same character, same controls, same
  start/restart behaviour.
- Capture one screenshot of a new double-spike section for Goku and Vihaan
  to check.
- Commit locally on the feature branch. DO NOT publish or push to main —
  Vihaan reviews the screenshot first, then Goku coordinates publishing.
- Update HANDOFF.md with what changed and the beatable-check evidence.
