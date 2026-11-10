---
title: "The Author's Room"
type: 'feature'
created: '2026-11-10'
status: 'in-review'
route: 'dispatch'
baseline_commit: 'c540ef1cc95bfc9ecefcf552e8cd871a29ce8d43'
review_loop_iteration: 0
context:
  - `{project-root}/AGENTS.md`
  - `{project-root}/FEATURE-BRIEF-authors-room.md`
  - `{project-root}/book-chapter-1-record.md`
  - `{project-root}/book-chapter-2-record.md`
---

<frozen-after-approval reason="human-owned intent — do not modify unless human renegotiates">

## Intent

**Problem:** Vihaan has finished two chapters of his 19-chapter human-body book, but his site has no place to show the book or let readers explore his finished writing.

**Approach:** Add a responsive Author's Room page in the visual family of the Game Room, with a book cover/progress area, all 19 chapter slots, and readable chapters 1 and 2. Add entry links from the homepage and shared site navigation.

## Boundaries & Constraints

**Always:** Use the two provided records as the only source for chapter content. Sentences marked `(his words)` must appear verbatim, including his conclusion as the final chapter text. `(his content)` points may become short, simple factual lines, never quotes. Show his estimate as “Vihaan's count: about 750 muscles.” Keep chapter facts and order faithful to the brief and records. Use local repo imagery only if suitable; otherwise make the requested illustrations with CSS/emoji. Keep third-grade readability, keyboard access, mobile layout, and no horizontal overflow.

**Never:** Do not use suggested wording or meta/session notes on the page; invent no sentence in Vihaan's voice; do not name unchosen body systems or organs; do not replace the 750 estimate with a textbook count; do not show intestines in the involuntary-muscle panel; do not fetch or hotlink images; do not publish, push, merge, or modify the listed unpublished branches. Keep the provided source records out of the website commit.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Direct chapter link | Load `authors-room.html#chapter-1` or `#chapter-2` | Matching finished chapter is brought into view with its title and content | Native anchor remains usable without JavaScript |
| Narrow viewport | 390px phone width | Cover, map, art, and reading sections fit without horizontal scrolling | Text wraps and cards stack |
| Planned chapter | Open any unfinished slot | Shows only the allowed generic label/status; no unchosen system or organ names | Do not render unavailable chapter content |

</frozen-after-approval>

## Code Map

- `gameroom.html`, `gameroom.css`, and `sublevel-os.css` -- reference page structure, type, spacing, cards, and navigation style. Reuse the visual family without loading Game Room behavior or changing its page.
- `index.html` -- homepage hero shortcut links, floating desktop nav, and mobile drawer; add Authors' Room discovery links alongside existing destinations.
- `sublevel-os.js` -- shared page-navigation data and both menu render paths; add the new destination in all matching locations.
- `FEATURE-BRIEF-authors-room.md`, `book-chapter-1-record.md`, `book-chapter-2-record.md` -- authoritative layout and source-content rules; the records distinguish verbatim lines from summaries and prohibited notes.
- `tests/` -- existing Playwright browser-check conventions and instructions; add a focused Authors' Room check with screenshots and a text/source trace artifact.

## Tasks & Acceptance

**Execution:**
- [x] `authors-room.html` and `authors-room.css` -- build the cover/progress, 19-slot map, chapter anchors, readable source-traced text, required illustrations, and responsive accessible layout.
- [x] `index.html` and `sublevel-os.js` -- add homepage and shared navigation links without changing unrelated content.
- [x] `tests/authors-room-browser.cjs` and `tests/README.md` -- verify desktop/mobile layout, anchors, nav routes, console/errors, and capture required VQA views; produce a sentence-to-record trace.
- [ ] `HANDOFF.md` -- record implementation, exact-word trace, screenshots, verification, local commit, and queue completion.

**Acceptance Criteria:**
- Given the homepage or any shared navigation menu, when the Authors' Room link is activated, then `authors-room.html` opens.
- Given the page, when a reader reviews its cover/map, then it shows 2 of 19 written; Part 1 has 7 body systems, Part 2 has 12 organs; chapters 1 and 2 are Finished, 3 is Up next (The Nervous System), and remaining slots use only the allowed generic labels.
- Given either chapter anchor, when opened, then the correct chapter text and art appear in order; each chapter's conclusion is last, all confirmed sentences match the record exactly, and summaries are short fact lines without quotation marks.
- Given chapter 2, when its estimate and illustrations render, then it says “Vihaan's count: about 750 muscles” and shows voluntary arm, involuntary stomach only, and cardiac heart panels with labels.
- Given 1440px desktop and 390px mobile viewports, when the page is loaded and navigated, then no JavaScript/console errors occur, links and chapter anchors work, and no horizontal overflow appears.

## Implementation Notes

- Created a self-contained, source-traced chapter page with native anchors and CSS/emoji diagrams. Kept confirmed (his words) lines verbatim; simplified only content summaries into concise fact lines.
- Added homepage quick-bar, desktop and mobile navigation links, and both shared-menu templates. Did not modify source record inputs.
- Browser verification passed at 1440×1000 and 390×844 after the final wording correction; all five required captures and the 25-line sentence trace were regenerated.
- Independent review fixes: shortened the periosteum summary, visibly labeled the ribs, marked 2/19 as “about 11%”, and added click checks for quick-bar and map links.

## Spec Change Log


## Review Triage Log

- `false` — Chapters 8–19 repeat “Organs”; the brief explicitly requires that exact generic label and prohibits naming unchosen organs.
- `low` — The periosteum content was supported but dense; split it into simple fact lines, and the final source-trace/browser run passed.
- `false` — The calcium/iron line directly repeats the supplied content point; changing the implied relationship would add unsupported interpretation.
- `low` — The bone art depicted ribs but had only a generic visible caption; added visible “Ribs” label, verified in the after capture.
- `false` — The cardiac-muscle line repeats wording from a record line marked as Vihaan's words; removing it would violate the verbatim rule.
- `false` — The brief requires labels “voluntary / involuntary / cardiac,” and the chapter record marks those lowercase labels as his words.
- `low` — The 2/19 progress was rounded to 11%; changed the cover label to “about 11%” and asserted it in the browser check.
- `false` — HANDOFF says review then commit in both places; the wording is redundant but not contradictory. It will be made consistent in the final status update.
- `low` — The homepage quick-bar link was not clicked by the test; added click-and-destination assertion and observed the link reach the page.
- `low` — Chapter map links were not activated by the test; added clicks for both finished links and verified each matching chapter becomes visible.
