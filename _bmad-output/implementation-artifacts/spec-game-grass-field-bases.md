---
title: 'Grass Fields, Bases, Eggs, and Pet Challenges'
type: 'feature'
created: '2026-11-23'
status: 'in-review'
route: 'dispatch'
baseline_commit: '3795745dc05ea2125ce477efa790c27f13fc5849'
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/FEATURE-BRIEF-game-grass-field-bases.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Vihaan's World needs a new playable grass-fields game based on Vihaan's dictated brief. It must remain separate from Ahaan's World and the standalone LEGO grass world.

**Approach:** Add the game under the existing Play menu as a responsive, self-contained experience. Build connected fields, one-floor bases and upgrades, a speed-training loop, a water-run challenge that rewards eggs, egg placement and hatching, plus the shop and fuse machine at the field connection.

## Boundaries & Constraints

**Always:** Vihaan's World only. Big first grass field with bases on one floor; a narrower, extremely long connected second field; exactly one shop and one fuse machine side by side at the connection; a shop selling trails and auras; base treadmills add +1 speed each second while used; water is challenge one; every base has a floor-upgrade board and faster-treadmill board; every floor has eight egg spots; challenge completion awards eggs; placed eggs hatch after waiting into a brain rot or pet; the fuse machine combines two earned eggs into one upgraded egg. Keep touch, keyboard, and desktop interactions usable and label game state accessibly. Add a visible NEW marker for seven days and a Fresh Drops card with a live-feature screenshot on publish.

**Never:** Add any game content or links to Ahaan's World. Merge this with the LEGO grass-world page. Add unrequested currencies, real-money purchases, external services, or invented rewards. Duplicate the shop or fuse machine. Stack bases by default.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Water run | Player runs across the marked water challenge | Clear success feedback and one earned egg; misses can retry without losing existing eggs | Keep movement and retry controls available |
| Treadmill | Player stands on a base treadmill | Speed rises by one per second; leaving stops the gain | Clamp display and handle interrupted timers |
| Egg placement | Player selects an egg and an open spot | Egg occupies one of eight visible slots on that floor and begins a hatch timer | Full floor reports no open spots; egg is not consumed |
| Hatching | Timer finishes while an egg is placed | Egg becomes one brain rot or pet and is added to collection | Persist progress locally and recover safely from invalid saved data |
| Fuse machine | Player supplies eligible items | Follow the human-approved fusion recipe and show the resulting item | Explain missing/insufficient inputs without consuming anything |

</frozen-after-approval>

## Code Map

- `games.html` is the existing Play-menu arcade destination with self-contained tabbed games. Reuse its page conventions, but avoid adding this large world as another crowded arcade tab; create a dedicated page linked inside the existing Play group.
- `sub-navs.js` owns shared desktop and mobile menu destinations. Add the new game to the existing Play group, mark it NEW for seven days from its verified publish date, and preserve all other menu entries.
- `fresh-drops.html` stores newest-first cards with screenshot images and computes seven-day NEW badges from each card's publish date. Add the card and screenshot only at publish verification.
- `/Users/Nishant/dev-tools/browser-check` is the durable Playwright harness; existing scripts use its installed Playwright module and capture desktop/mobile evidence.
- `FEATURE-BRIEF-game-grass-field-bases.md` is an intentional untracked coordinator input. `_bmad/_bmad/` is also an intentional coordinator copy. Preserve both; do not stage or alter them.
- Current branch is `feature/game-grass-fields`, based on `origin/main`. No existing grass-fields gameplay or content was found. Avoid changes to Ahaan's repository/world and `FEATURE-BRIEF-grass-world.md` scope.

## Tasks & Acceptance

**Execution:**
- [ ] `grass-fields.html`, `grass-fields.css`, `grass-fields.js` — implement the connected, responsive playfield and touch/keyboard controls with local save state.
- [ ] `sub-navs.js` — add the dedicated game to Play and a seven-day NEW marker starting at verified publish date.
- [ ] `tests/grass-fields-browser.cjs` — cover core gameplay on desktop and mobile using the durable Playwright installation; report zero console/page errors.
- [ ] `fresh-drops.html`, `images/fresh-drops/grass-fields.png` — add one newest-first card linking to the Play entry with screenshot captured from the live feature.
- [ ] `HANDOFF.md` — record implementation, desktop/mobile checks, publish/live verification, and screenshot evidence without changing unrelated entries.

**Acceptance Criteria:**
- Given the Play menu, when opened on desktop or phone, then the game appears under Play with a visible NEW marker for its first seven days.
- Given a new game, when explored, then two connected fields, single-floor bases, the adjacent shop and fuse machine, base treadmills, water-run challenge, upgrade boards, and eight egg spots per floor are visible and usable.
- Given challenge completion, treadmill use, upgrades, egg placement, hatching, and the approved fuse recipe, when used, then state changes are clear and persist across reload without inventing currency.
- Given desktop 1280×800 and mobile 390×844, when the durable browser harness exercises the game and navigation, then controls remain reachable, no horizontal overflow appears, and zero browser/console errors occur.
- Given the publish, when Fresh Drops is opened, then its newest card has the verified live screenshot, Try it destination, date, and correct seven-day NEW state.

## Implementation Notes

- Implemented the playable grass-fields page, Play-menu and homepage discovery, local save state, and focused desktop/mobile browser coverage. Water-crossing runs require three inputs and award one egg only on success; the long path has a separate no-reward run; egg hatching yields a brain rot or pet; two earned eggs fuse into one upgraded egg.
- Review fixes added visible trails/auras on runners, date-controlled NEW badge coverage, exact treadmill-rate checks at levels 1 and 2, and safe filtering of placements above unlocked floors. Durable harness passed at 1280×800 and 390×844 with no horizontal overflow or page/console errors. Captures: `/tmp/vihaan-grass-fields/desktop.png` and `/tmp/vihaan-grass-fields/mobile.png`.
- The initial scope was published via PR #13 / Pages run `45319126827` after this local implementation and before the brief expanded through Change 36. Its Fresh Drops screenshot/card and live browser verification were not completed. The updated requirements are tracked in `spec-grass-fields-changes-1-36.md`; this original spec remains in review until its follow-up release record is complete.

## Spec Change Log

## Review Triage Log

| Finding | Verdict and evidence / route |
|---|---|
| Blind: NEW epoch could expire before deployment | false — the feature and discovery links deploy together, and the epoch is Nov 23, the current requested release date. Date-controlled tests cover the start and exact seven-day boundary; confirm/update the epoch against the verified deployment date before release. |
| Blind: treadmill gain could continue after leaving | medium — reproduced while starting water/long runs or switching bases. Those actions now stop or switch the active session, with explicit stop controls; browser coverage verifies the transition. Patch. |
| Blind: long-path control only changed text | medium — reproduced; the run now visibly advances a runner to the end, offers reset, and awards no egg. Browser coverage verifies movement, finish, reset, and unchanged rewards. Patch. |
| Blind: shop cosmetics were not visible in-world | low — selecting either item previously changed only saved text; runner trail and aura classes now produce visible effects, covered by the browser check. Patch. |
| Blind: arrow keys could hijack navigation | medium — the document handler previously intercepted arrows while unrelated controls had focus; it now ignores those controls and the browser check exercises that case. Patch. |
| Blind: upgrades were unlimited by inputs or challenge | false — floor and treadmill upgrades have explicit caps (five floors and level ten); no cost or currency was specified, and adding one would violate the no-invented-currency constraint. |
| Blind: fuse decision remained unresolved | false — the locked intent explicitly records two earned eggs becoming one upgraded egg; implementation and browser assertion match it. |
| Edge: saved eggs above unlocked floors became unreachable | medium — reproduced with a saved slot on a locked floor; `safeLoad` now discards invalid placements using each base's unlocked-floor count, and a reload check covers it. Patch. |
| Edge: training persisted after leaving the treadmill | medium — same active-session defect as the Blind treadmill finding; starting a run or changing bases now stops/switches training and the browser check verifies it. Patch. |
| Edge: fused egg created an unrequested Super pet | medium — reproduced; fused eggs now hatch into the specified brain rot or pet outcomes, with explicit test coverage. Patch. |
| Edge: shop and fuse machine stacked at desktop | medium — confirmed at wide desktop; the connection now lays both cards side by side, while mobile also retains a two-column arrangement. Desktop computed layout and mobile browser checks pass. Patch. |
| Edge: badge could appear before verified publication | false — no public Grass Fields route exists before this feature deploys; deployment adds the page and badge logic together. The start-date gate and pre-date case are covered. |
| Verification gap: speed test did not assert the stated rate | medium — the original greater-than assertion could miss an incorrect rate; coverage now checks exact +1 and +2 ticks about one second apart. Patch. |
| Verification gap: NEW expiration was untested | medium — date-controlled tests now cover the Play and homepage badges before publication, within the seven-day period, and at expiration. Patch. |

## Verification

**Commands:**
- `PLAYWRIGHT_MODULE=/Users/Nishant/dev-tools/browser-check/node_modules/playwright node tests/grass-fields-browser.cjs` — expected: desktop/mobile gameplay acceptance passes and no page/console errors.
