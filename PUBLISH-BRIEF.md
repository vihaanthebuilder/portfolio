# PUBLISH BRIEF — Vihaan's Portfolio

Issued by Goku (coordinator) on Nov 9, 2026, on the user's instruction:
"Have vihaan port published". This supersedes the earlier hold on publishing.

## Starting state (worker-verified earlier today)

- Branch `feature/3d-trophy-cabinet-showcase`, baseline commit `9ff6e2f` on top
  of `e9def6c` (= GitHub main at last check).
- Uncommitted at baseline: modified `images/chess-trophy.jpg`, untracked
  `images/outstanding-performance-trophy.jpg`, untracked `HANDOFF.md` — all
  preserved IN that baseline commit.
- Git identity in this checkout: use the same explicit
  `Codex Worker <codex@localhost>` identity as the baseline commit.

## Tasks, in order

1. Fix the stale ratings FIRST (user-verified facts): current USCF is
   **811 Regular / 814 Quick** (Oct 24, 2026). Replace stale "715" current-rating
   text in `chess.html` AND `index.html` (hero line and Hall of Fame card
   included). Preserve legitimate historical results: tournament recaps and
   the "+130 Surge" story stay as history. If a line's tense is ambiguous,
   leave the number and flag it in HANDOFF.md instead of guessing.
2. Commit everything ready on this branch, including the rating fix and any
   uncommitted work from today's session.
3. Push the branch to origin.
4. Merge the branch into `main` (fast-forward if possible) and push `main`.
   Publishing happens only via `main` — `.github/workflows/pages.yml`
   deploys the repo root on push to main.
5. Verify: fetch https://vihaanthebuilder.github.io/portfolio/ and confirm
   the hero shows 811 and no "715" remains as a current rating. Pages can
   take a few minutes; retry the fetch up to 3 times over ~10 minutes.
6. Update HANDOFF.md with: commit hashes, merge result, deploy verification
   outcome, and anything left unpublished and why.

## Deliberately NOT in this publish (coordinator ruling — do not "fix" silently)

- The trophy caption mismatch: both trophy images are the same
  "OUTSTANDING PERFORMANCE" photo, while the site captions one as a 1st Place
  championship trophy. Publishing as-is; the family decides the photo/caption.
- `images/robo_pawn.jpg` stays unused for now; the family decides its use.

## Rules

- Report state in HANDOFF.md before and after. If a push or merge conflicts,
  STOP and write the exact blocker in HANDOFF.md — do not force-push.
- No content changes beyond the rating fix in step 1.
