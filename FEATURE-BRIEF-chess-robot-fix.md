# FEATURE BRIEF — Fix the chess-vs-robot game (queued by Goku, Nov 9, 2026)

STATUS: LOCAL FIX READY FOR REVIEW — dispatched through HANDOFF.md after
Lichess Classical 1605. Popup drag failure reproduced and fixed locally;
original reported input surface/gesture awaits coordinator confirmation.
No publishing or push.

Reported by Vihaan himself (Nov 9, 2026): the chess game against the robot
is broken. His words for the symptom: "The pieces won't move" — the board
opens, but the pieces will not move.

## The job (when dispatched)

- Find the chess-vs-robot game on the site and reproduce the bug: board
  loads, pieces do not move.
- Find the cause and fix only that. Change nothing else in the game or on
  the page.
- Verify in a browser: a piece can be selected and moved, and the robot
  replies. Capture a screenshot showing a moved piece for Goku and Vihaan.
- Commit locally on its own feature branch. DO NOT publish or push to
  main — Goku coordinates publishing.
- Update HANDOFF.md with the cause, the fix, and the verification.
