---
title: "Author's Room: Chapter 5 — The Large Intestine"
type: 'feature'
created: '2026-11-22'
status: 'done'
route: 'dispatch'
baseline_commit: '3795745dc05ea2125ce477efa790c27f13fc5849'
review_loop_iteration: 0
context:
  - `{project-root}/FEATURE-BRIEF-authors-room-ch5-ch6.md`
  - `{project-root}/chapter-5-large-intestine-draft.md` (coordinator-provided, verified source in the main checkout)
  - `{project-root}/_bmad-output/implementation-artifacts/spec-authors-room.md`
---

<frozen-after-approval reason="human-owned intent — publish Vihaan's verified chapter in his words">

## Intent

**Problem:** The Author's Room says seven of 24 chapters are finished and has no Chapter 5, although Vidhu has now read and confirmed the complete large-intestine chapter. Chapter 6 (healthy food) has not been dictated.

**Approach:** Add Chapter 5 to the Organs map and reading page using the complete verified draft word-for-word, with one picture showing the kid next to the large intestine. Update all book progress displays to eight of 24; record that Chapter 6 is waiting for Vidhu to dictate and do not create its text.

## Boundaries & Constraints

**Always:** Preserve every word, punctuation mark, and the confirmed final sentence from `chapter-5-large-intestine-draft.md`. Keep the existing Author's Room style and chapter structure. Leave Chapter 4 unchanged. Use one composed picture made from the existing kid and intestine images; make their side-by-side relationship clear. Keep Chapter 6 out of the page until dictated. Use the existing Words menu entry and show its NEW badge for seven days. Publish a Fresh Drops entry only with its live chapter screenshot.

**Map decision (Nishant, Nov 23, 2026):** Put book Chapter 5 in the next free Organs map slot, existing slot number 11. Slot number 11 and book chapter number 5 are distinct labels. Keep the Body Systems 05 card unchanged, preserve all 24 map cards, and do not renumber any slot.

**Never:** Paraphrase, shorten, add to, or correct Vihaan's chapter text; put the kid inside the intestine; add more than one illustration; infer Chapter 6 text; change the existing navigation; or modify unrelated pages.

## I/O & Edge-Case Matrix

| Scenario | Input / State | Expected Output / Behavior | Error Handling |
|----------|--------------|---------------------------|----------------|
| Read Chapter 5 | Open `authors-room.html#chapter-5` | Finished Chapter 5, exact title/body/final line, and one kid-beside-intestine picture are visible | Native hash remains usable without JavaScript |
| Book progress | Load the Author's Room | All progress displays say 8 of 24 / about 33%; Chapter 5 is finished and linked | Keep the total at 24 and Chapter 4 unchanged |
| Chapter 6 not dictated | Review the map and HANDOFF | No Chapter 6 text/article is added; HANDOFF says it is waiting for Vidhu to dictate | Do not invent a placeholder chapter article |

</frozen-after-approval>

## Code Map

- `authors-room.html` -- progress appears in the cover label, `<progress>`, map heading/tag; replace the generic Organs slot 11 with a finished link titled Large Intestine, and place the Chapter 5 article after Chapter 3. Keep slot number 11, Body Systems 05, and Chapter 4 unchanged.
- `authors-room.css` -- existing `.ar-art-grid` and `.ar-art-card` pattern; add only the small layout needed to compose the two approved local images as one picture if current styles do not suffice.
- `sub-navs.js`, `sub-navs.css` -- the existing Words menu already links to Author's Room and has a shared `subnav-new` badge style; date-gate the badge for this release without adding a new menu destination.
- `images/kid-100x70.png`, `images/large-intestine-100x70.png` -- existing source art; compose side by side in one accessible figure, kid adjacent to the intestine.
- `tests/authors-room-browser.cjs` -- existing desktop/mobile chapter, map, source-trace, and screenshot coverage. Its current 19-chapter / 3-readable-chapter expectations predate the current 24-chapter page; update them to 24 / 8 and assert the new Chapter 5 link, exact content, final line, and single composite figure.
- `fresh-drops.html` -- add a Nov 22 card after the existing same-day releases, linking to the existing Author's Room and using a screenshot captured from the live Chapter 5 page.
- `HANDOFF.md` -- correct the stale Chapter 5 stub warning; record the exact picture composition, Chapter 6 wait, verification, publish, screenshot, and live checks.

## Tasks & Acceptance

**Execution:**
- [x] `authors-room.html` -- add exact Chapter 5 text, use existing Organs slot 11 for its finished map link, and update every hardcoded progress value to 8/24 / about 33%.
- [x] `authors-room.html`, `authors-room.css` -- present exactly one accessible composition of the kid standing next to the large intestine; keep it separate from chapter text.
- [x] `sub-navs.js`, `tests/authors-room-browser.cjs` -- show NEW beside Author's Room in the existing Words menu through day seven, then remove it.
- [x] `tests/authors-room-browser.cjs` -- update stale expectations and verify chapter word-for-word, map/hash route, all counts, one picture, desktop/mobile layout, and zero page/resource errors.
- [x] `HANDOFF.md` -- retain the Chapter 6 wait-for-dictation note and record build, live screenshot, Fresh Drops, and publication results.
- [x] `fresh-drops.html`, `images/fresh-drops/authors-room-chapter-5.png` -- after live capture, add the dated card linking to the existing Author's Room.

**Acceptance Criteria:**
- Given the Organs map, when a reader opens Chapter 5, then its exact verified text appears and ends with “Without the large intestine you would not be alive.”
- Given the chapter illustration, when the figure is viewed, then it shows one picture with the kid standing right next to the large intestine.
- Given the book cover and map, when progress is read, then every hardcoded count is 8 of 24 / about 33%, Chapter 5 is finished and linked, and Chapter 4 is unchanged.
- Given Chapter 6 has no dictated text, when the page and handoff are reviewed, then no Chapter 6 article or invented wording appears and HANDOFF records that it is waiting for Vidhu to dictate it.
- Given desktop 1440×1000 and mobile 390×844, when the page loads and Chapter 5 is opened, then layout and link work without horizontal overflow or unexpected browser errors; after publishing, the page and Fresh Drops card pass the same live checks.

## Implementation Notes

- Reconnaissance confirms `authors-room.html` currently has 24 map slots but seven finished chapters and progress labels 7/24, `value="7"`, and about 29%. Chapter 4 is a finished title-only Organs row; slot 11 is the first generic Organs placeholder. Use slot 11 for Chapter 5 while preserving its slot number, all 24 cards, Body Systems 05, and the Chapter 4 row.
- The authoritative full text was verified in the main checkout's `chapter-5-large-intestine-draft.md`, read aloud by Vidhu Nov 22, including the additional confirmed final sentence. Chapter 6 has no text.
- The implementation branch is `feature/authors-room-ch5-ch6`, created cleanly from `origin/main` at `3795745dc05ea2125ce477efa790c27f13fc5849`. The pre-existing Author's Room spec describes the original page; its source-only rules remain useful, but its old 19-chapter counts do not apply.
- No unresolved intent gap remains. Nishant's map decision fixes slot 11 while keeping Body Systems 05 and all 24 map cards unchanged. His Nov 24 direction also requests the existing Words menu item's seven-day NEW tag. The brief explicitly authorizes merge/push and live publication after checks; this is the only external side effect. Footprint is the existing Author's Room page/style, shared menu badge logic, browser suite, HANDOFF/spec, and the Fresh Drops card plus captured image. No new dependency or navigation destination is needed.
- The review found and fixed the pre-publication NEW badge boundary, and the browser suite now tests it. Its route assertions account for the repository's `/portfolio` base path. Chapter 5 main deploy succeeded in workflow-dispatch run `45354512062`; the Fresh Drops commit deployed in run `45360230348`. Final live desktop/mobile verification passed for both the chapter and Fresh Drops, with zero browser/resource errors.

## Verification

## Review Triage Log

- **medium — patch:** Blind Hunter, Edge Case Hunter, and Verification Gap Reviewer found that a clock before Nov 24 still satisfied the upper-bound-only NEW condition. Confirmed by evaluating the negative age against `< 7 days`; added a nonnegative lower bound and a browser assertion at 2026-11-23 23:59:59 UTC.
- **medium — patch:** Blind Hunter found the browser check newly required an untracked Chapter 5 draft file absent from a clean checkout. Confirmed `git status` showed the draft untracked; changed the browser check to use a tracked test constant containing the verified chapter text, so test execution no longer depends on that coordinator input file.
- **false:** Blind Hunter noted there was no pre-release badge test. Confirmed this was a distinct missing assertion for the date-boundary behavior; the added pre-release assertion now covers it, along with the date guard above.
- **false:** Blind Hunter said implementation was presented as complete while publication and Fresh Drops remained. HANDOFF explicitly leaves them pending, and they are sequential steps after local review; they are not falsely marked complete.
- **false:** Blind Hunter noted the Fresh Drops card and live screenshot were absent. The brief requires those only after live capture; this review precedes publication, and HANDOFF marks both pending.
- **false:** Blind Hunter said HANDOFF lacked a concrete next action. It records implementation/local verification complete and explicitly identifies publish, live screenshot, Fresh Drops, and final live checks as the remaining steps, matching the user's requested sequence.
- **false:** Verification Gap Reviewer reported the same pre-release badge defect as the other layers. The cited branch condition was verified and fixed under the first entry; duplicate reports share that root cause.

**Commands:**
- `PLAYWRIGHT_MODULE=/Users/Nishant/dev-tools/browser-check/node_modules/playwright AUTHORS_ROOM_BASE_URL=http://127.0.0.1:<port> AUTHORS_ROOM_VQA_DIR=/tmp/vihaan-authors-room-ch5-ch6 node tests/authors-room-browser.cjs` -- expected: desktop/mobile pass, verbatim Chapter 5, 8/24 counts, one image, zero unexpected errors, and captures/report.
- `git diff --check` -- expected: clean whitespace check.
- After authorized publish, run the focused browser suite against `https://vihaanthebuilder.github.io/portfolio` and verify the Fresh Drops card/image at desktop and mobile; expected: live page and links load with no overflow or unexpected errors.
