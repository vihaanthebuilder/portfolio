---
title: 'Spelling Bee Trainer'
type: 'feature'
created: '2026-11-10'
status: 'done'
route: 'dispatch'
baseline_commit: '22587348075decc1577b2e63b9099072b4a7e7f1'
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/FEATURE-BRIEF-spelling-bee-trainer.md'
  - '{project-root}/HANDOFF.md'
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

Give Vihaan a friendly way to practice for his spelling bee, hear one word at a time, and build a real daily habit. Add a standalone, offline-capable trainer with three difficulty levels, ten-word rounds, hints, a saved Tricky Words list, and an honest device-local streak.

## Boundaries & Constraints

**Always:** Use plain HTML/CSS/JS with no framework, CDN, external image, or hotlink. Speak a word only after a user action and never render its spelling during an active prompt; reveal it after an answer or in the final score. Provide warm-up, bee-ready, and champion levels with at least 40 unique, manually authored entries each; every entry has a simple definition and a sentence that uses the word. Keep the official school list distinction visible. Store only completed ten-word practice days and missed-word progress locally; initialize empty data as zero. Be kind after wrong answers and when speech/storage is unavailable. Support keyboard, visible focus, responsive 390px layout, and working offline after load.

**Never:** Pre-fill streaks or scores, reveal the word while spelling, shame a wrong answer, use remote assets, or write/publish outside the local feature branch. Do not mix Authors' Room or other unpublished branch content into this change.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|---|---|---|---|
| Start level round | Select one of three levels | Random ten unique words; first word is spoken only after Start | Missing speech voice gives a kind fallback and keeps the answer hidden |
| Answer word | Enter exact spelling / submit blank or wrong spelling | Correct answer celebrates and reveals spelling; wrong answer shows target letters and marks exact-position matches, then saves tricky word | Blank answer invites another try without advancing |
| Ask for help | Tap repeat, definition, or sentence | Speaks the prompt again or reveals only the requested hint | No voice shows fallback; hint remains usable |
| Finish round | Complete ten prompts | Score card, round tricky words, daily goal and local streak update once | Duplicate completion/reload does not add a second day |
| Tricky practice | Empty, short, or full saved list | Empty state is kind; otherwise practice up to ten unique saved words, with short practice excluded from the ten-word daily goal | Corrupt or unavailable storage safely starts empty/in-memory |
| Return to page | Reload after round and wrong answer | Streak, seven-day dots, best streak, and tricky list persist | Invalid saved JSON is ignored without an exception |

</frozen-after-approval>

## Code Map

- `gameroom.html`, `gameroom.css` -- dark/gold family and `.gr-nav`, skip-link, focus, panel patterns; use styles as visual reference without loading its data code or remote fonts.
- `cruise-ship.html`, `cruise-ship.js` -- self-contained page navigation toggle and static offline page setup.
- `index.html` -- homepage quick bar, desktop top nav, and mobile drawer; add the new destination in each.
- `sublevel-os.js` -- shared site navigation data and two drawer render paths; add spelling-bee.html to all of them.
- `gameroom.js:23-45`, `notebook.html:164-179` -- defensive localStorage examples. Use separate versioned Bee keys, local calendar dates, empty initial state, and guard both reads and writes.
- `tests/README.md`, `tests/gameroom-browser.cjs` -- Playwright Chrome conventions, local server port 8876, persistence and responsive checks.
- No `assets/` folder or spelling trainer exists; create `assets/spelling-words.js` and a standalone page plus scoped CSS/JS.

## Tasks & Acceptance

**Execution:**
- [x] `assets/spelling-words.js` -- author 120+ unique practice entries (40+ per level), with correct child-readable definitions and example sentences; include family-editing comment. Implemented 122 unique entries: 40 Warm-Up, 41 Bee Ready, 41 Champion.
- [x] `spelling-bee.html`, `spelling-bee.css`, `spelling-bee.js` -- build accessible page, three levels, 10-word standard rounds, speech/hints, answer reveal and gentle correction, score card, short tricky practice, and responsive menu/layout without external requests.
- [x] `spelling-bee-model.js` -- implement testable random selection, local-date streak math, and tricky-word two-consecutive-correct rule with defensive storage helpers.
- [x] `index.html`, `sublevel-os.js` -- link the page from the homepage and both shared navigation paths.
- [x] `tests/spelling-bee-model.cjs`, `tests/spelling-bee-browser.cjs`, `tests/README.md` -- verify word-bank counts/data quality, model edges, speech available/unavailable, full desktop/phone rounds, hints, answer feedback, score, persistence, and screenshots. Model/data and browser suites passed; 118 browser assertions at 1440px and 390px, including rendered homepage/shared navigation and a full ten-word tricky round counting toward the daily goal.
- [x] `HANDOFF.md` -- implementation, verification, voice availability, screenshot paths, and local commit recorded.

**Acceptance Criteria:**
- Given any level, when a round starts, then it contains ten random non-repeating words and the current spelling is not visible until answer or score reveal.
- Given an answer and hint actions, when Vihaan repeats, requests definition/sentence, answers right, wrong, blank, or presses Enter, then the expected speech, hint, feedback, navigation, and letter-position marks work without shaming.
- Given speech has no available voice, when he starts or repeats a prompt, then the page shows a kind fallback, does not throw, and does not display the target spelling.
- Given empty, malformed, or valid local state, when the page loads and rounds finish, then streak starts honestly at zero, one full round counts once for that local day, missed days reset quietly, best/last-seven dots are accurate, and saved tricky words persist and leave after two consecutive correct answers.
- Given desktop 1440px and phone 390px, when the full round flow and navigation are used, then there are no console errors or horizontal overflow and required screenshots are saved.

## Implementation Notes

- Tricky practice uses up to ten unique words already saved. It may be shorter; it counts toward the daily goal only when all ten words are completed. This keeps the control useful before ten misses exist while preserving the daily goal's explicit ten-word requirement.

## Spec Change Log

- 2026-11-10: Clarified that any completed ten-word round, including Tricky Words practice, counts toward the daily goal; shorter tricky rounds do not.

## Review Triage Log

- **false** — The blind reviewer suggested waiting for `voiceschanged` before showing the no-voice fallback. `speak()` checks available voices after each user-initiated speech action, so a later repeat retries; the spec requires a kind fallback when no voice is available, which is present.
- **false** — The blind reviewer noted that asynchronous speech errors are not handled. The current missing-voice condition is detected synchronously through `getVoices()` and displays the required fallback; no asynchronous error state is specified or reproduced in this implementation.
- **false** — The blind reviewer noted that browser rounds use Warm-Up only. The same level-selection path filters the distinct authored bank by each level, and model tests verify all three levels have at least 40 entries and exercise selection; no level-specific runtime defect was found.
- **false** — The blind reviewer requested an offline-toggle browser test. All assets and data are local, and the browser suite records any external request as an error; the page’s practice flow has no network dependency after its local files load.
- **false** — The blind reviewer requested a browser test for blocked storage. Model tests exercise throwing reads and writes, while the page checks failed writes and displays its device-storage fallback message; no crash or lost in-memory practice path was found.
- **false** — The blind reviewer requested dated screen-reader labels for streak dots. Each dot already exposes its weekday and earned checkmark through text, and the streak container has an accessible label; no inaccurate or missing streak state was found.
- **false** — The blind reviewer noted extra letters are not represented by extra target chips. The submitted spelling remains visible in the disabled input and the target spelling is shown with exact-position marks, which provides the requested comparison.
- **false** — The blind reviewer questioned the “perseverance” definition. “Keep trying even when something is difficult” is a simple child-readable explanation of perseverance; it is not a spelling or meaning error.
- **false** — The blind reviewer described the “temperature” example as awkward. The sentence is grammatically clear and correctly uses the word; this is a stylistic preference rather than a defect.
- **false** — The blind reviewer requested a tablet-width check. The acceptance criteria name 1440px desktop and 390px phone, and responsive breakpoints are defined between those widths; no tablet-specific failure was observed.
- **patch** — A saved tricky list whose words no longer occur in the current practice bank left an enabled button that did nothing. The count area now explains the mismatch kindly and disables practice when no saved words can be played; the browser suite verifies this state.
- **patch** — Navigation tests checked source strings rather than rendered homepage/shared links. Browser coverage now checks visible desktop and mobile links on the homepage and a shared-navigation page at both viewport sizes.
- **patch** — The implementation counted only standard rounds toward the daily goal, even when a tricky round had ten words. The code and score copy now count any completed ten-word round; a browser case verifies a full tricky round updates the goal and stores exactly one day.

## Verification

**Commands:**
- `node tests/spelling-bee-model.cjs` -- all data/state cases pass (122 unique entries).
- `node --check spelling-bee.js && node --check spelling-bee-model.js && node --check assets/spelling-words.js && node --check tests/spelling-bee-browser.cjs` -- JavaScript parses.
- `PLAYWRIGHT_MODULE=/Users/Nishant/.npm/_npx/e41f203b7505f1fb/node_modules/playwright node tests/spelling-bee-browser.cjs` against local server -- 118 desktop and phone checks pass; screenshots/results saved to `/tmp/vihaan-spelling-bee/`.
- Installed headless Chrome reports the Speech Synthesis API but no available voices; the fallback passed, and the available-voice path passed using a local voice stub.
- `git diff --check` -- no whitespace errors.
