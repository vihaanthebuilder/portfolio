---
title: 'Explore your LEGO cruise ship, one deck at a time'
type: 'feature'
created: '2026-11-09'
status: 'done'
route: 'dispatch'
baseline_commit: '1bb1da1004a781774b0e6a84e230b9fd559d1aba'
review_loop_iteration: 0
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/FEATURE-BRIEF-cruise-ship-explorer.md'
---

<frozen-after-approval reason="user-authorized brief execution">

## Intent

Give Vihaan a friendly, interactive side view of his LEGO cruise ship (also called the Titanic), with four selectable decks and their true build status. Match the Game Room's dark/gold style and confident, second-person, third-grade-readable tone.

## Boundaries & Constraints

Always use the full brief as factual authority: 4 decks, room for125 minifigure guests, Deck1 Finished, Deck2 Now Building, Deck3/4 Planned. Include every listed room/activity and the finished lounges' hidden prizes. Keep roller coaster, fair rides and tiny phone charger in separate Captain's Plans, coming soon with deck undecided. No identifiable real ship photo was found; use a clearly labeled code-native illustration.

Never include prices, invented ship facts, fake photographs, sound or heavy new dependencies. Other pages change ONLY by adding navigation/LEGO links; do not modify counts, galleries, games or chess content. Keep changes on feature/cruise-ship-explorer from main; no commit/branch switch/push/merge by implementation agent. Parent owns HANDOFF, final VQA/review and local commit. No publication is authorized.

## I/O & Edge-Case Matrix

| State/input | Expected behavior |
|---|---|
| Initial page | Deck2 visibly selected; corresponding panel shows Now Building and its exact contents |
| Pointer/touch on each deck | Highlight and panel agree; correct name/status/items, no invented amenities |
| Keyboard | Every deck reachable/selectable, visible focus; Space/Enter do not unexpectedly scroll |
| Phone/narrow width | Side view remains recognizable with usable deck targets; details stack, no overflow |
| Reduced motion | No unnecessary animation; all interactions remain functional |
| JavaScript disabled | Ship facts remain readable; no falsely working controls or missing factual information |

</frozen-after-approval>

## Code Map

- `gameroom.html:11–21`, `gameroom.css`: reuse font loading, dark/gold tokens and gr-nav/gr-main/gr-panel/eyebrow/button/footer conventions. Do not load gameroom.js (expects chess DOM/API). New page can load gameroom.css then a scoped cruise stylesheet.
- `gameroom.html:21`: standalone nav; add one Cruise Ship link here, without changing styles or chess behavior.
- `sublevel-os.js:1638`: NAV_ITEMS plus two mobile drawer templates around1700/1950; additive Cruise Ship link in all three. Do not import the 3D bundle on the new page.
- `index.html`: own hardcoded desktop nav, mobile drawer and optional hero quick bar. Add destination only.
- `lego.html` after hero around1078, before workspace tabs: visible additive explorer CTA avoids existing filtering/card systems.
- Shared nav collapses up to1250px; Game Room nav collapses up to1050px. Check widths1251 and1051 for the extra link; prefer a compact label/inline styling on the added link over modifying existing page layout. Source images contain unrelated boats only; no cruise photo used.

## Tasks & Acceptance

**Execution:**
- [ ] `cruise-ship.html`: new page with concise ship story, stats strip, large four-deck side-view SVG/CSS explorer and details panel. Finished/Now Building/Planned labels must be textual, not color-only. Default to Deck2. Separate Captain's Plans. Include all facts readably even without JS (progressive enhancement/static fallback). Familiar navigation/footer and correct metadata.
- [ ] `cruise-ship.css`: scoped responsive layout and generous targets; dark panels/gold accents, illustrated LEGO ship cues, clearly distinguished decks/statuses, obvious selection/focus. Gentle state transition only, prefers-reduced-motion respected. Keep existing pages' CSS unchanged.
- [ ] `cruise-ship.js`: lightweight selection and new-page menu control; keep focus on clicked/key-selected deck, announce meaningful changes accessibly without dumping duplicate content. Use native controls or correct SVG keyboard semantics; same panel and selection for keyboard/touch/pointer. No external data or sound.
- [ ] `index.html`, `sublevel-os.js`, `gameroom.html`, `lego.html`: ONLY additive nav/discovery links. Link Cruise Ship adjacent to LEGO where natural. Retain all destinations and existing functionality. Handle compact labeling on the new links if needed to fit without unrelated style changes.
- [ ] `tests/cruise-ship-browser.cjs`, append to `tests/README.md`: reproducible meaningful Playwright Chrome integration checks for the matrix, every exact deck fact/status, separate undecided plans, no prices, no new console exceptions, no overflow, keyboard focus, reduced motion and existing navigation at1440/1251/1051/390. Parent runs final browser verification and visually inspects captures under /tmp/vihaan-cruise-ship/ after implementation; agent may run syntax checks after code is complete.

**Acceptance Criteria:**
- Given the brief, when each deck is selected, then panel and ship highlight agree with its finished/building/planned state, all required contents appear, and captain-only ideas are never assigned a deck.
- Given desktop/mobile and keyboard/touch, when exploring all four decks, then controls remain usable and focused, selection is apparent, text fits and there is no horizontal page overflow.
- Given the repository baseline, when diffed, then changes on existing runtime files are additions of links only; no existing page data or behavior is changed.
- Given final verification, when parent records completion, then desktop/mobile screenshots and test outcomes, photo decision, remaining family decisions and local commit hash are recorded in HANDOFF. Main/remote and other feature branches remain unchanged.

## Implementation Notes

- New page matrix passed at1440/1251/1051/390 plus no-JavaScript and reduced motion. Final run stopped on existing homepage nav right control exceeding1440px after link addition; scope-preserving correction under investigation.
- Resolved: top-bar link is a compact ⚓ icon; gameroom.html reverted to main (its nav has no spare width). Pre-existing main overflows at 1251px (topnav) and 1051px (Game Room) recorded, not fixed. Final suite 22/22.

One cohesive user-facing page; no irreversible actions and no unresolved intent questions. The full brief already authorizes implementation. Parent retains coordination files and commit ownership. Return changed files and any incomplete/risky work without committing.

## Spec Change Log

## Review Triage Log

## Verification

Use installed Chrome and Playwright via PLAYWRIGHT_MODULE, local server8876 (if already running reuse it). Screenshots should include desktop/mobile full page and explorer/default Deck2 plus planned state evidence. Root performs final browser run, reads unified diff including new files and conducts independent reviews before local commit.
