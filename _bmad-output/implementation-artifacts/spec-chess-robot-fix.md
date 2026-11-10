---
title: Restore chess piece movement for drag gestures
type: bugfix
created: 2026-11-09
status: done
route: oneshot
baseline_commit: a4b4afc7c3d8ac4eab89306302d66886bdbb2da5
---

<frozen-after-approval reason="User dispatched chess-robot brief; fix the reproduced movement failure only">

## Intent

Reproduce and correct the chess-vs-robot input failure with no engine, game rule, appearance, or unrelated page changes. On the visible popup grid, ordinary desktop click and mobile tap already move e2→e4 and get a robot reply. Dragging that same piece to e4 leaves history empty and no selection. Implement the missing drag submission using the existing onSquareClick legal-move path, while retaining click/tap controls. Goku has been asked which board Vihaan used; the exact reported gesture is not confirmed, so record this observed reproduction rather than inventing a confirmed user action.

Validate a dragged piece moves, the robot replies, repeated legal input works, invalid/off-board drops do not submit illegal moves, click and touch remain functional, and New Game still works. Capture a moved-piece screenshot for Goku/Vihaan. Work locally on feature/chess-robot-fix from main, preserving the independent unpublished Geometry Dash/Lichess branches and coordinator handoff note. Explicit commit identity Codex Worker <codex@localhost>; no push, merge to main, or publication.

</frozen-after-approval>

## Implementation Notes

- The popup render builds .chm-sq elements with only click listeners. Add per-square pointer capture on movable white pieces, use actual drop coordinates to resolve destination before render replaces squares, and send source/destination through existing onSquareClick. Suppress the compatibility click after a drag, while taps still use the original click handler. Touch source needs touch-action:none so dragging is not canceled by browser scrolling.
- No engine changes. Baseline JSON/screenshots under /tmp/vihaan-chess-robot-fix prove click/tap work and drag does not. There is no 3D-board input handler in chess mode; this is separately noted, not silently built as another feature.

- Production diff is confined to square input listeners and touch gesture policy inside render(). Chess engine, move validation, rules, bot search, and all other rendering remain unchanged.
- Browser regression passed desktop mouse and Chrome mobile touch: e2→e4 drag + bot reply, invalid/off-board/robot-piece drops rejected, previously selected knight g1→f3 second drag + bot reply, New Game, touch cancellation, and original click/tap movement. Moved-piece screenshots and verification JSON under /tmp/vihaan-chess-robot-fix; exact paths in HANDOFF.md.
- games.html and chess.html equal main; neither d8f2eb2 nor 66d4f2d is an ancestor. No push or publication.

## Review Triage Log

- Low — source/legal highlights do not appear during a held drag. Real cosmetic feedback limitation, but the reproduced defect is failure to submit on drop and this now passes. Rejected extra gesture UI state/animation under the brief's focused fix; re-rendering to show engine selection during capture also risks dropping the captured node. Not claiming a floating drag preview.
- Medium — only one successful drag was originally tested. Verified coverage gap; added previously selected g1→f3 second drag after robot reply. Both mouse/touch paths passed.
- Low — Chrome touch emulation is not Safari/iOS verification. Recorded scope explicitly in README/HANDOFF; no broad real-device claim. Safari/iOS remains untested, not a reproduced defect.
- False on final tree — missing test invocation/setup. tests/README.md now has a Chess-vs-robot section, exact command, local server/module/browser prerequisites and artifact paths, with the shared Playwright install instructions above. Documentation was added while review ran.
- Medium — queued/in-progress statuses and original gesture ambiguity. Updated brief to local fix ready for review and handoff to final evidence. Retained explicit uncertainty: popup click/tap already worked; popup dragging failed and is fixed. Coordinator still needs to confirm this matches Vihaan's exact symptom; no speculative 3D-input feature added.
