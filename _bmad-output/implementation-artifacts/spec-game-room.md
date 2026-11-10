---
title: 'Your Game Room: confidence and a daily chess habit'
type: 'feature'
created: '2026-11-09'
status: 'done'
route: 'dispatch'
baseline_commit: 'a4b4afc7c3d8ac4eab89306302d66886bdbb2da5'
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/FEATURE-BRIEF-game-room.md'
---

<frozen-after-approval reason="user-authorized brief execution">

## Intent

Build a welcoming Game Room that gives Vihaan evidence he can succeed and a daily practice habit. Follow the complete brief and its amendments: confidence first, Daily Quest second, factual public data with a dated fallback.

## Boundaries & Constraints

Always work on feature/game-room from main; additive page/nav/chess link changes only. Keep US Chess 811/814 distinct from live Lichess. Use no token. Exclude jishi03 case-insensitively from all celebrated best-win calculations. Keep family-stated Kanishk evidence prominent and unlinked. Preserve existing trophy photos and other pages' statistics.

Never publish, commit, switch branches, or modify HANDOFF as implementation agent: parent handles coordination, review, evidence, local commit and later Goku publishing dispatch. Do not incorporate the three other unpublished branches. Never infer daily streak from lifetime puzzle totals or Puzzle Streak mode. No shame, leaderboards, invented history or guaranteed championship.

## I/O & Edge-Case Matrix

| State | Expected behavior |
|---|---|
| Four public APIs succeed | Render fresh source-labeled ratings, games, chart and practice evidence |
| Lichess blocked/timeout | Fully render dated committed snapshot; external embed has an ordinary Watch link |
| Games returns 429 | Retry once with max=50; bounded failure falls back |
| Empty public history | Explain absence; optional clearly labeled game-derived Classical trail, never fake history |
| Sparse activity | Unknown daily puzzles/streak, check your Lichess app; missing data is not zero |
| jishi03 or malformed/empty games | Exclude coach spotlight; safe empty states, no unsafe HTML/URLs |

</frozen-after-approval>

## Code Map

- `chess.html`: reuse OS workspace language; add prominent Game Room link only. Saved ratings remain untouched.
- `sublevel-os.css` and `sublevel-os.js`: shared dark Geist OS, injected desktop NAV_ITEMS and two mobile drawer templates. Add Game Room nav to each; avoid new Three dependencies. `index.html` has its own desktop/mobile nav and quick links.
- `/tmp/vihaan-gameroom-data/evidence-summary.md`: read investigation and official references. Raw profile.json, rating-history.json, activity.json, games.ndjson and retrieval-metadata.json are real build-time inputs, available there.
- Public history currently []; latest 200 rated games span Apr15–Nov5, 118 wins. Best eligible game lJcdbKwT vs KSM2023 (1992). These examples are evidence, not hardcoded computed outputs.
- Activity sparse UTC intervals: only Oct24 puzzle evidence. UTC quest days make aggregates usable; label UTC day. No verified complete-day streak currently. perfs.streak means a separate game mode.
- New page/styles/controller/pure model can live at `gameroom.html`, `gameroom.css`, `gameroom.js`, `gameroom-model.js`; no build system or heavy dependency.

## Tasks & Acceptance

**Execution:**
- [x] `data/vihaan-lichess-snapshot.json` and `scripts/refresh-lichess-snapshot.*`: reproducible public-only generation including raw endpoint data, retrieval timestamps, source URLs, sample bounds and computed quest state. Initial snapshot uses existing raw evidence to avoid unnecessary requests; refresh tool supports 429→50. Snapshot current/best streak null if unknown.
- [x] `gameroom-model.js`: reusable pure calculations for own color/result, scoped totals, eligible best win, openings, history/trail and UTC quest evidence. Count completed rated games; label sample and weekly rated scope. Treat missing fields honestly. Cache verified best record without converting unknown to zero; state coverage limits.
- [x] `gameroom.html`, `gameroom.css`, `gameroom.js`: polished responsive dark OS page with readable type, gold proof/quest accents and no added 3D imports. Header/belief anchor, then Daily Quest, Your Climb, wins/By Numbers, Recent Games, Best Win embed, treasure-map review and Road to State. Make all brief facts visible. Show provisional ratings, member date, source freshness and sample bounds. Safe textContent and validated game URLs. Render snapshot first then bounded live fetches; partial results cannot falsely relabel saved sections live. Accessible canvas/SVG chart summary and responsive table/cards. Use real Outstanding Performance photograph for Tulsa proof.
- [x] `index.html`, `sublevel-os.js`, `chess.html`: additive discovery links in desktop/mobile navigation and chess page. Handle extra nav width without overlap; don't alter gameplay or ratings.
- [x] `tests/gameroom-model.cjs`, browser verification script and `tests/README.md`: meaningful matrix checks and reproducible Chrome/Playwright setup. Parent performs final browser/VQA run after code is ready; implementation agent may syntax/unit-check after implementation.

**Acceptance Criteria:**
- Given real profile/games, when loaded, then Classical is API-derived, 118 sample wins appear for the current snapshot, US Chess is separate, and recent10/review5/watch links and best-win caption/iframe agree with the model.
- Given no cached history, when viewed, then chart source is explicitly game-derived with missing-public-history explanation, or an honest unavailable state. No invented start/current line.
- Given sparse UTC activity, when today's quest renders, then puzzles say check your Lichess app; current/best and seven dots distinguish unknown from completed. Verified games and weekly reps remain visible and non-shaming. Known synthetic complete days can earn/extend a streak; saved verified best persists.
- Given desktop/mobile, when all key sections and menus are viewed, then no horizontal overflow/overlap or new console errors; keyboard links and headings work. All brief-required sections exist in live and fallback modes.
- Given successful final verification, when parent records completion, then eight exact desktop/mobile captures (header, climb, recent, best embed) and fallback evidence under /tmp/vihaan-gameroom-vqa are listed in HANDOFF with source dates and remaining family decisions.

## Implementation Notes

- Initial browser run found two issues under investigation: real Chrome games export returns404 although Python reproduces200; official iframe renders PGN text and emits an lpvEmbed error. Mandatory live/VQA acceptance remains pending. Fixture assertions otherwise completed; do not claim pass.

Footprint is one cohesive page plus its data, links and verification. No irreversible action during implementation. User already authorized execution; no unresolved intent question. API coverage limitations are handled under the brief's honesty rule.

## Spec Change Log

## Review Triage Log

| Finding | Verdict and evidence / route |
|---|---|
| Blind1 snapshot stalls | medium — start awaits unbounded fetch; add timeout. Patch. |
| Blind2 return/midnight stale | medium — refresh only starts on load; returning from practice leaves stale quest. Patch existing refresh lifecycle. |
| Blind3 earned days evicted | medium — only best persists; a long verified run shrinks when activity ages out. Preserve verified earned days in existing cached record. Patch. |
| Blind4 known incomplete unknown | medium — complete:false yields current:null; quiet reset needed. Patch. |
| Blind5 UTC reset | low — UTC labeled but Chicago reset not prominent; add actual local reset time. Patch text. |
| Blind6 game start vs completion | false — export has no documented completion timestamp; brief says games/day from pull, page explicitly labels completed-game start day and also uses activity. No invented lastMoveAt completion. |
| Blind7 board orientation | low — best is Black and default faces White. Patch official orientation parameter. |
| Blind8 frozen live assertions | medium — normal future account progress breaks --live. Compute live expectations from actually received data; retain exact fixture checks. Patch. |
| Blind9 resource failures exempted | medium — all live failed resources get exemption; expected only deliberate fixture failures. Patch source-aware reporting. |
| Blind10 medium nav untested | medium — changed breakpoint lacks browser coverage. Add existing-page checks at1100 plus desktop/mobile. Patch. |
| Edge1 snapshot timeout | medium — same demonstrated wait as Blind1. Patch grouped. |
| Edge2 quiet reset | medium — same known-incomplete result as Blind4. Patch grouped. |
| Edge3 activity date overflow | low — finite out-of-range interval reaches dayKey and throws. Direct date-bound guard patch. |
| Edge4 profile date overflow | low — finite out-of-range createdAt reaches formatter. Direct date-bound guard patch. |
| Verification1 review identities | medium — count-only assertions survive Win-for-Loss mutation. Add mixed fixture IDs/order/links. Patch. |
| Verification2 populated history | medium — derived:false-only assertion survives constant-rating mutation. Add exact dates/ratings and browser endpoints. Patch. |
| Parent mobile chart labels | medium — inspected mobile-climb capture: axis text ~4px. Responsive SVG coordinates/font sizes. Patch. |
| Parent final embed VQA | medium — source route requires /gameId/black (analysis-only color query is ignored); mobile iframe needs taller aspect ratio and screenshot viewport must fit whole cross-origin frame. Source route, actual king orientation and controls verified. Patch. |
| Parent embed/live failure | medium — headless UA serves PGN/404; normal Chrome UA renders cg-board. Normal UA verification plus streamed-export timeout correction; must prove real board and data, never mock successful live. Patch. |


## Verification

- Parent initial live and fixture runs exposed headless negotiation/stream timeout, then a harness-only counter bypass during an activity override. Normal Chrome identity and30s export proved real200-game stream and cg-board. Harness keeps activity override through the counted route; final full run passed with15 checks, real four-source live fetch on both widths, zero unexpected errors and12 captures. Targeted footer CSS/dated-fallback verification passed afterward. No successful-live responses mocked.

Use Node pure-model assertions and Playwright Chrome against local port 8876. Test live API, blocked Lichess fallback, empty history, 429→50, unknown/known quest fixtures, coach exclusion and empty/malformed inputs. Parent records actual outcomes and inspects screenshots, not merely their existence.

Final parent VQA: inspected all eight required captures plus quest/fallback evidence. Real board orientation/control checks pass. No unresolved/deferred new findings. HANDOFF records exact paths, source limits, browser identity and branch isolation.
