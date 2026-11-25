---
title: 'Room Life clickable prompt pills'
type: 'feature'
created: '2026-11-24'
status: 'done'
route: 'dispatch'
review_loop_iteration: 0
baseline_commit: 'b4ffb022032d943be8d295ac6a2a4f8017e3cdc3'
context:
  - `{project-root}/FEATURE-BRIEF-room-life-clickable-prompts.md`
---

<frozen-after-approval reason="human-owned intent — activate Room Life interactions from their visible prompts">

## Intent

**Problem:** Room Life's visible interaction prompt is not tested as a button, has a mobile target shorter than the requested 44px, and pressing Enter while it is focused may dispatch the action twice. The brief also names a Storybook prompt, but no Storybook action or route exists in this repository.

**Approach:** Preserve the existing prompt button and route activation through its current player-owned interaction dispatchers. Make pointer and keyboard activation single-fire, retain the existing text and visual style with a gentle pressed state, and ensure a 44px minimum touch target on mobile.

## Boundaries & Constraints

**Always:** Keep keyboard controls working. A Vihaan prompt uses Vihaan's Enter action; an Ahaan prompt uses Ahaan's E action. Reuse `data-player` ownership and existing interaction functions; don't synthesize Enter on click. Keep the existing rounded pill and dark key chip. Use subtle, non-flashing press feedback and at least 44px mobile height. Do not copy code from Ahaan's Park repo.

**Never:** Change room movement, proximity thresholds, action priority, or actor ownership. Do not add a Storybook action until its intended target/behavior is confirmed. Do not change unrelated Room Life controls.

**Scope decision (Nishant, Nov 24, 2026):** Cover only the existing Room Life prompts; do not add a Storybook action.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Activate Vihaan prompt | Visible dog/vehicle/trophy prompt; pointer click, tap, Enter, or Space | Same nearby Vihaan action exactly once | Ignore activation if prompt is hidden or no longer owned by Vihaan |
| Activate Ahaan prompt | Play Together; dog is nearer to Ahaan; click/tap or E | Dog pets once as Ahaan; Vihaan stays unaffected | Ignore Ahaan activation when Play Together is off |
| Mobile target | 390×844 viewport | Prompt remains visible, has at least 44px height, and activates by tap | No horizontal overflow or console/page errors |

</frozen-after-approval>

## Code Map

- `index.html` -- `#world-interaction` button and styles near lines 872–879 / 1530; `updateWorldInteraction()` selects the nearest prompt and sets `data-player` near 4496–4510; `interactNearVihaan()` and `interactNearAhaan()` preserve the correct actions; global keyboard routing near 6100 and the button click listener near 6151. Keep action ownership and key routing intact. Existing button click routing is already present; the discovered defects are unverified behavior, double activation for focused Enter, missing touch size, and pressed feedback.
- `tests/room-life-feature.cjs` -- existing desktop/mobile and two-player flow. It currently clicks the 3D dog target, then separately tests Enter and E; extend it to click/tap the visible prompt, assert player ownership and action parity, exercise keyboard activation while focused, measure touch size, and preserve zero-error assertions.
- `images/fresh-drops/` and `fresh-drops.html` -- later publish artifact: capture the live prompt in an active pointer/tap state and add the required dated release card after deploy verification.

## Tasks & Acceptance

**Execution:**
- [x] `index.html` -- make native button activation and global Enter handling produce one owner-correct action; add gentle `:active` feedback and a mobile 44px minimum target.
- [x] `tests/room-life-feature.cjs` -- verify click/tap matches Enter/E for the visible prompt, focused Enter/Space fires once, player ownership is preserved, mobile target size meets 44px, and no browser errors occur.
- [ ] `HANDOFF.md` -- record the chosen Storybook scope, implementation, screenshots, test results, and publish state.
- [ ] `fresh-drops.html`, `images/fresh-drops/room-life-clickable-prompts.png` -- after publish, add the live screenshot showing a prompt being clicked and link to the existing Room Life.

**Acceptance Criteria:**
- Given an existing Vihaan interaction prompt, when clicked or tapped, then it performs the same action and animation as Enter exactly once.
- Given an Ahaan-owned dog prompt in Play Together, when clicked or tapped, then it performs the same pet action as E for Ahaan without triggering Vihaan's action.
- Given the visible prompt has keyboard focus, when Enter or Space activates it, then exactly one action runs and keyboard controls elsewhere remain unchanged.
- Given a 390×844 viewport, when the prompt appears, then its hit target is at least 44px high and the page has no horizontal overflow or unexpected browser errors.

## Implementation Notes

- The existing `#world-interaction` was already a button with click routing by `data-player`. Kept that routing, recalculated the live prompt before each click, guarded hidden/feedback-state clicks, and made `petDog()` clear ownership while “Good dog!” feedback is shown.
- Native focused button activation now bypasses global Enter/Space gameplay handling, allowing the browser's native click to perform exactly one owner-routed action. The prompt has a 44px minimum height, touch-action hint, subtle pressed state, and visible keyboard focus ring.
- Extended `tests/room-life-feature.cjs` to click/tap Vihaan dog, quad, and trophy prompts and Ahaan's dog prompt; assert actor-specific effects and “Good dog!” feedback; exercise a synthetic hidden-button click, check the mobile height, and verify focused Enter/Space mount/dismount behavior. Full suite passed at 1280×800 and 390×844 with zero errors. Captures: `/tmp/vihaan-room-life-clickable-prompts/review-fixes/`.

## Review Triage Log

- **medium — patch:** Blind Hunter found that a click could use stale `data-player` between proximity updates. Confirmed prompt ownership was frame-updated; the click handler now recalculates the current prompt before dispatch and returns if it is hidden.
- **low — patch:** Blind Hunter found the Ahaan click assertion checked facing but not dog feedback parity with E. Added an assertion that tapping/clicking the E-owned prompt also shows “Good dog!”.
- **low — patch:** Blind Hunter found the new suite did not click a vehicle prompt. Added desktop click/mobile tap coverage that mounts the quad from its visible prompt.
- **low — patch:** Blind Hunter found the hidden-prompt guard had no regression assertion. Added a synthetic click while the prompt is hidden and confirmed no quad action runs.
- **false:** Blind Hunter questioned whether the Storybook prompt exists without an action. Repository search across Room Life source and history found no Storybook prompt, action, or route, and Nishant explicitly limited this brief to existing prompts; no Storybook feature is in scope.

## Verification

**Commands:**
- `PLAYWRIGHT_MODULE=/Users/Nishant/dev-tools/browser-check/node_modules/playwright VIHAAN_BASE_URL=http://127.0.0.1:<port> VIHAAN_VQA_DIR=/tmp/vihaan-room-life-clickable-prompts node tests/room-life-feature.cjs` -- expected: existing scene regressions plus prompt click/key parity pass at desktop and mobile, with zero unexpected errors.
- `git diff --check` -- expected: clean whitespace check.
- After publish, run the same focused browser check against `https://vihaanthebuilder.github.io/portfolio` and verify Fresh Drops card/screenshot live at desktop and mobile.
