---
title: 'Grass Fields complete build — Changes 1–51'
type: 'feature'
created: '2026-11-24'
status: 'in-progress'
route: 'build'
context:
  - '{project-root}/AGENTS.md'
  - '{project-root}/FEATURE-BRIEF-game-grass-field-bases.md'
  - '{project-root}/HANDOFF.md'
---

## Intent

**Problem:** The published Grass Fields game covers only the original small release, while Vidhu's current brief defines a much larger playable game.

**Approach:** Extend the existing Play-menu page in Vihaan World only. Implement the field/base progression, egg and companion loop, second strip, Guardian branch and bosses, three sequential 15-stage kick strips, obbies, teleports, timed eggs, and Cosmos finale. Keep the source brief and `_bmad/_bmad/` coordinator copy intact.

## Boundaries & Constraints

**Always:** Preserve the 0.1 starting speed and distinct second-strip speed levels. The kick-power strips are Multiverse 1–15, Infinity 16–30, and Cosmos 31–45. Use explicit kick powers and speeds exactly where the brief provides them. No ads. No teleport into obbies or kick-power strips. A failed challenge returns to the lobby. Publish only to Vihaan World; Fresh Drops needs a screenshot captured from the live build.

**Never:** Delete or move the updated brief or coordinator copy; publish to Ahaan World; treat the second-strip level numbers as the Change 47 speed values.

## Implementation Fallbacks

- Section 4 Tsunami uses the earlier booster/lava-gap mechanic; section 5 Prehistoric uses the earlier tsunami-chase mechanic.
- Change 39's “×10” applies to kick-power requirements for Multiverse, using the original 1–15 power ladder. Special eggs map to Cosmos stages 43–45 as the final third-strip stages 13–15 fallback. Goku-provided Multiverse names remain replaceable.
- Boss 1 is peaceful; bosses 2–8 chase after egg theft. Bosses use generic egg-guardian cards and return one ordinary egg on a successful escape.
- Three visible oversized brain-rot Guardians represent the unspecified count. They chase only after the player steals an egg from their section, then stop at the safe zone. The Guardian branch uses level 6 and a three-step return.
- Change 47 speeds are implemented as dictated through section 45. Section 16 uses 360,000; the stray “700” is not used. Section 15 overlap is treated as Easy; sections 16–30 are Medium and Cosmos 31–45 is Hard.
- Cosmos stage 45 unlocks a rest area after the final stage. It provides one Possible egg, then a tsunami chase. Tsunami size and speed use the completed-stage ratio (45/15 = 3×). If caught, return to lobby and keep the collected egg.
- Timed good eggs use the named rare egg families and known special sections as eligible locations; the banner lists egg, area, and strip.
- The three obby eggs use Divine, Mythic, and Epic, in longest-to-shortest order. Economy/shop values use the existing implementation defaults.
- Change 48 weights start at 1 kg and rise by 5 kg per egg-family rank; the displayed values stay within 1–1000 kg. Weight is display-only for now.
- Change 49 keeps eight first-floor spaces, then unlocks Floor 2 after eight upgrades with one egg space; seven more upgrades add one space each. A ladder scrolls to Floor 2. Egg and pet display capacity share the same spaces pending Vidhu's answer. Third-floor repetition is not implemented.
- Change 50 uses separate green money for pets and gold money for brain rots. Brain rots earn $1/second; pet income starts at $1/second and uses rarity and section rank as a simple scaling fallback. Sales pay one unit in the companion's currency; obby prizes and style purchases use green money.
- Change 51 adds two empty, visually distinct strips beside the second challenge strip, not connected to it or the Brain Rot branch. Their size and names use a compact reserved-space fallback.

## Code Map

- `grass-fields.html` — game layout, four base cards, fields, shop/fuse, second strip, Guardian branch, kick strips, collections, and obbies.
- `grass-fields.css` — responsive field layout and expansion cards; keep mobile width at 390px without horizontal overflow.
- `grass-fields.js` — saved game state, all progression, challenge/failure actions, egg rewards, training and unlocks.
- `tests/grass-fields-browser.cjs` — durable Playwright harness for desktop/mobile and gameplay checks. Use the shared installation at `/Users/Nishant/dev-tools/browser-check`.
- `sub-navs.js`, `index.html`, and `fresh-drops.html` — existing Play navigation, NEW date, and Fresh Drops release surfaces. Update only after the local build and pre-publish checks pass.

## Tasks & Acceptance

**Execution:**
- [x] `grass-fields.html`, `grass-fields.css`, `grass-fields.js` — implement Changes 1–51 with the fallbacks above.
- [x] `tests/grass-fields-browser.cjs` — cover desktop/mobile layout, key systems, floors and ladders, empty strips, Cosmos finale, and zero page/console errors.
- [ ] `HANDOFF.md` — retain local status, verification evidence, and remaining Vidhu decisions.
- [ ] Publish to Vihaan World; add Fresh Drops screenshot; set seven-day NEW date; live-check desktop and mobile.

**Acceptance Criteria:**
- Given a new save, when desktop or mobile loads Grass Fields, then four bases, all field systems, three 15-stage kick strips, the branch/bosses, obbies, and permitted teleports render without horizontal overflow or console/page errors.
- Given sufficient speed and kick power, when stages are completed in sequence, then the player can finish Cosmos 45, collect the rest-area egg, and complete or fail the scaling tsunami chase according to the recorded fallback.
- Given the current local build, when the durable browser harness runs at 1280×800 and 390×844, then all checks pass with zero errors.
- Given the eventual deployment, when the live page and Fresh Drops are checked, then the entry uses a live screenshot and the NEW label lasts seven days from the verified publication date.

## Remaining Vidhu Decisions

- Change 39's precise meaning for “×10” and the original section mapping of special eggs after the strips were renamed.
- The stray “700” heard after section 16 and whether medium begins at 16 due to the section 15 overlap.
- What happens when the Lucky Block falls, a zombie catches it, or a comet hits it; kick threshold interpretation if different from the listed kick power.
- Exact position and contents of the post-Cosmos rest area, and what happens if a tsunami catches the player.
- Which sections are “good sections” for the five-minute egg event.
- Which exact eggs are first-, second-, and third-best for the obbies.
- How many Guardians there are; whether boss 1 chases; and confirmation of the spelling “Indestructible”.
- Egg weights: exact value per rarity and whether weight affects gameplay.
- Floor progression: whether a third floor repeats the same 8-upgrade rule and whether egg spaces and pet display spaces should be separate.
- Change 50 income rates: exact pet income by section and rarity, whether brain-rot income varies by section/rarity, and whether their production rates differ. Shop prices and sale values also need Vidhu's numbers.
- Change 51 empty-strip dimensions and names.
- Other unresolved brief choices: meaning of ×10; stray “700”; section 15 tier overlap; outcomes for falling/caught Lucky Block and tsunami; Cosmos rest-area placement/content; eligible timed good-egg sections; which eggs are best for the three obbies; Guardian count; boss 1 chase; and confirmation of “Indestructible”.

## Verification

**Commands:**
- `node --check grass-fields.js` — JavaScript parses.
- `node --check tests/grass-fields-browser.cjs` — browser harness parses.
- `git diff --check` — no whitespace errors.
- `PLAYWRIGHT_MODULE=/Users/Nishant/dev-tools/browser-check/node_modules/playwright node tests/grass-fields-browser.cjs` — desktop/mobile acceptance and captures.
