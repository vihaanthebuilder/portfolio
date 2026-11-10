# Walk and trophy checks

Requires Node and Google Chrome. Verified with Playwright 1.64.1. No site build is needed.
Install the test dependency outside the site checkout and set its module path:

```sh
npm install --prefix /tmp/vihaan-test-deps --no-save playwright@1.64.1
export PLAYWRIGHT_MODULE=/tmp/vihaan-test-deps/node_modules/playwright
```

Start a server from the repository root:

```sh
python3 -m http.server 8876 --bind 127.0.0.1
```

In another terminal, from the same root:

```sh
node tests/walk-and-trophies.cjs
node tests/walk-physical-contact.cjs
node tests/walk-picking.cjs
node tests/walk-boundaries.cjs
```

If Playwright is installed outside this repo, set `PLAYWRIGHT_MODULE` to its
module directory. `VIHAAN_BASE_URL` defaults to `http://127.0.0.1:8876` and
`VIHAAN_VQA_DIR` defaults to `/tmp/vihaan-walk-vqa`.

The first check uses actual DOM keyboard, pointer, and emulated touch events
for cards and controls, with deterministic avatar stepping for long routes.
It saves both award cards at desktop/mobile sizes, checks focus and background
input, and measures planted-foot support and ankle reach.

The second check instruments a browser-only copy of index.html. It raycasts
edge midpoints and corners around each shoe sole against the rendered walkable meshes
through a full ascent/descent. It checks planted contact and swing clearance independently of the foot
height sampler. It does not modify the served source on disk.

Mandatory before/after stair and default-camera screenshots, capture scripts,
and the worker’s visual assessment are listed in HANDOFF.md. These automated
checks supplement that visual review; they do not replace it.

The third check clicks/taps both actual rack models in the default camera,
then clicks unobstructed floor and checks that the queued walking route completes.

The boundary check covers alternate SIT/chess starts, chess standing after
teleport, the wider landing edge, keyboard side rejection/entry/reversal/rails,
and preserving navigation while backgrounded.

# Author's Room checks

Requires Node, Playwright, and Google Chrome. Install Playwright outside the
site checkout so the static site has no new runtime dependency:

```sh
npm install --prefix /tmp/vihaan-authors-room-tools --no-save playwright@1.64.1
```

Start the static server from the repository root:

```sh
python3 -m http.server 8876 --bind 127.0.0.1
```

In another terminal, run:

```sh
PLAYWRIGHT_MODULE=/tmp/vihaan-authors-room-tools/node_modules/playwright node tests/authors-room-browser.cjs
```

The check covers the 1440px desktop and 390px mobile layouts, all 19 chapter
slots, chapter 1 and 2 native anchors, the three muscle panels, homepage and
shared-menu routes, browser errors, horizontal overflow, and a sentence-to-
record trace. Screenshots and trace output go to `/tmp/vihaan-authors-room/`.

# Game Room checks

Game Room verification uses Node's built-in assertions and Playwright with installed Google Chrome. It does not change any other page's statistics or contact private APIs.

Run the pure data matrix:

```sh
node tests/gameroom-model.cjs
node --check gameroom.js
node --check gameroom-model.js
```

Generate the initial committed snapshot from the existing public investigation (no network requests):

```sh
node scripts/refresh-lichess-snapshot.cjs --from-dir /tmp/vihaan-gameroom-data
```

Refresh all four public sources later (no token; 12-second endpoint limits; one max=50 games retry after HTTP429). A failed endpoint preserves the existing snapshot file. The snapshot contains raw endpoint responses, individual source URLs/timestamps, export bounds and computed UTC quest evidence. `null` puzzle/current/best values mean unknown. Daily puzzle counts never come from lifetime profile totals or Puzzle Streak mode.

```sh
node scripts/refresh-lichess-snapshot.cjs
```

Install the browser tool outside the repository so the static site's dependencies stay unchanged:

```sh
npm install --prefix /tmp/vihaan-gameroom-tools --no-save playwright@1.64.1
```

Google Chrome must already be installed. If using Playwright Chromium instead, run the following and set `CHROME_CHANNEL=chromium` when invoking the script:

```sh
/tmp/vihaan-gameroom-tools/node_modules/.bin/playwright install chromium
```

Start the static server in one terminal:

```sh
python3 -m http.server 8876 --bind 127.0.0.1
```

In another terminal, run mandatory real API verification and all deterministic edge cases:

```sh
NODE_PATH=/tmp/vihaan-gameroom-tools/node_modules node tests/gameroom-browser.cjs --live
```

Or run the full matrix with saved public responses replacing live APIs (reproducible even when Lichess is offline):

```sh
NODE_PATH=/tmp/vihaan-gameroom-tools/node_modules node tests/gameroom-browser.cjs
```

Fixture browser clocks start at Nov10 2026 03:40UTC, matching the investigation date. Live checks use the actual browser time and derive expected ratings, games, review selection, chart and quest from the real API response bodies. Exact historical assertions remain fixture-only. The installed Chrome runs headless; contexts use that binary’s actual navigator.userAgent with only HeadlessChrome replaced by Chrome for Lichess compatibility. results.json records both identities honestly. Mandatory spotlight captures require a visible real external cg-board, correct piece orientation and controls within the frame. For the tall phone spotlight only, capture height expands while retaining390px width so Chrome paints the entire cross-origin iframe; layout checks still use390×844. no replay response is fabricated. Public export requests allow30 seconds per attempt; browser readiness allows70seconds including one smaller retry. Deterministic edge cases cover blocked API fallback, missing history/games, 429→50, partial refresh provenance, known/unknown quest days, persistent verified record, malformed games, coach exclusion and HTML injection strings. The external board is never mocked and always has an ordinary same-game Watch link. Console/network errors record URLs, failures and available stacks. Only exact deliberately blocked fixture requests, the deliberate429 request, and deliberately blocked nonexistent synthetic fixture replay IDs are exempted. Unexpected real resource or application errors fail. Existing index/chess dog.bin404 and duplicate-Three warning are recorded separately. Index/chess navigation is checked at1440,1100 and390px, including the open menu where used.

Outputs under `/tmp/vihaan-gameroom-vqa/`:

- `desktop-header.png`, `mobile-header.png`
- `desktop-quest.png`, `mobile-quest.png` (additional Daily Quest evidence)
- `desktop-climb.png`, `mobile-climb.png`
- `desktop-recent.png`, `mobile-recent.png`
- `desktop-best.png`, `mobile-best.png`
- `desktop-fallback.png`, `mobile-fallback.png`
- `results.json`: assertions, actual source dates/URLs, expected network messages and any errors.

The parent performs this final browser run and visually inspects the eight section captures and fallback evidence before recording exact paths in HANDOFF. Screenshot existence alone is not visual verification. The automated run also checks existing index/chess Game Room navigation at desktop, medium (1100px), and mobile widths.

# Cruise Ship Explorer checks

Use the installed Chrome and the external Playwright installation described above.
Reuse the local static server on port8876, or start it from the repository root:

```sh
python3 -m http.server 8876 --bind 127.0.0.1
PLAYWRIGHT_MODULE=/tmp/vihaan-test-deps/node_modules/playwright node tests/cruise-ship-browser.cjs
```

`VIHAAN_BASE_URL` defaults to `http://127.0.0.1:8876`;
`VIHAAN_VQA_DIR` defaults to `/tmp/vihaan-cruise-ship`.
The suite uses the installed Chrome channel (override with `CHROME_CHANNEL`).
It records Chrome's real identity and replaces only HeadlessChrome in the
context user agent for existing Game Room compatibility.

Checks cover exact contents/statuses for all decks, default Deck2, matching
highlight/panel, pointer/touch and real keyboard activation, retained focus and
visible focus rings, no prices, separate undecided Captain's Plans, reduced
motion, no-JavaScript facts and anchor navigation, and navigation at1440,
1251,1051 and390px. All existing destinations are checked on index, LEGO,
chess and Game Room (Game Room's nav is unchanged from main and has no cruise
link). Where main itself already overflows (shared top bar at 1251px, Game Room
at 1051px) the right edge is recorded in `knownBaselineOverflow` instead of failing. The Game Room's public API responses use its existing
snapshot fixture during these navigation-only checks; its dedicated browser
suite owns real API verification. Existing-page network/console messages are
recorded separately; page exceptions and cruise-page console errors fail.

Captures include desktop/mobile full page, default Deck2 explorer, planned
Deck3 explorer, mobile without JavaScript, and all existing-page navigation
widths. `results.json` records assertions, errors and exact capture paths.
The parent must run this suite and visually inspect the captures before
recording completion in HANDOFF.md; capture existence is not visual approval.

# Spelling Bee Trainer checks

The spelling trainer is plain HTML/CSS/JS and has no external runtime assets.
The model/data checks use Node's built-in assertions:

```sh
node tests/spelling-bee-model.cjs
node --check spelling-bee.js
node --check spelling-bee-model.js
node --check assets/spelling-words.js
```

For desktop and phone browser flows, install or reuse Playwright outside the
site checkout and start the static server from the repository root:

```sh
npm install --prefix /tmp/vihaan-test-deps --no-save playwright@1.64.1
python3 -m http.server 8876 --bind 127.0.0.1
PLAYWRIGHT_MODULE=/tmp/vihaan-test-deps/node_modules/playwright node tests/spelling-bee-browser.cjs
```

The browser script uses installed Chrome, locally stubs available and missing
speech voices, completes full rounds at 1440×1000 and 390×844, checks hints,
hidden active words, letter-position feedback, daily-goal persistence, and the
two-consecutive-correct tricky-word rule. Captures and `results.json` go to
`/tmp/vihaan-spelling-bee/` by default. The local voice stub verifies the
speech integration path; it does not establish which voices a real device has.

# Geometry Dash harder checks

From the repository root, with Node and Git available (including baseline commit
`a4b4afc7c3d8ac4eab89306302d66886bdbb2da5` in local history), run:

```sh
node tests/geodash-harder.cjs
```

This extracts the actual Geometry Dash functions into a stub DOM/canvas, finds
and replays a full winning route that lands on every new narrow platform, and
records per-pair clearance and timing tolerance. It also verifies the preserved
opening, unchanged gameplay functions, and unchanged finish position. No npm
dependency is needed for this physics check.

For the real Chrome replay, first start the local server from the repository
root in a separate terminal:

```sh
python3 -m http.server 8876 --bind 127.0.0.1
```

Install/use the Playwright 1.64.1 dependency as documented above, with Google
Chrome installed, then run from the repository root:

```sh
export PLAYWRIGHT_MODULE=/tmp/vihaan-test-deps/node_modules/playwright
export VIHAAN_VQA_DIR=/tmp/vihaan-geodash-harder
node tests/geodash-harder.cjs
node tests/geodash-browser.cjs
```

`VIHAAN_BASE_URL` defaults to `http://127.0.0.1:8876`. The browser proof validates
that the saved physics proof matches the current game source before replaying.
It captures `double-spikes-game.png`, `double-spikes-canvas.png`, and completion
screenshots, then checks real animation scheduling, restart, and mouse, Space,
ArrowUp, and touch input. These checks add no autoplay/debug controls to the site.

Results are saved under `/tmp/vihaan-geodash-harder/` by default (or
`VIHAAN_VQA_DIR`): `beatable-proof.json`, `jump-frames.json`, and
`browser-proof.json`, alongside the screenshots. Run the Node proof before the
browser proof whenever games.html changes.

# Chess-vs-robot piece input

From the repository root, start the local server on port 8876 as described
above. With Google Chrome and Playwright installed, run:

```sh
PLAYWRIGHT_MODULE=/tmp/vihaan-test-deps/node_modules/playwright node tests/chess-robot-input.cjs
```

`VIHAAN_BASE_URL` can override the server URL. `VIHAAN_VQA_DIR` overrides the
artifact directory, which defaults to `/tmp/vihaan-chess-robot-fix`.

The check uses actual mouse pointer capture and emulated mobile touch to drag
e2→e4, waits for the robot reply, then drags a previously selected knight
g1→f3 and waits for another reply. It saves moved-piece screenshots and
`verification.json`. It also checks click/tap, illegal and off-board drops,
robot-piece rejection, touch cancellation, and New Game. It does not call the
chess engine directly to submit moves. The exact originally reported gesture
is not confirmed; baseline click/tap worked and dragging was reproduced broken.

Chess mobile input is verified with Chrome touch emulation only; Safari/iOS
and real hardware have not been exercised. The screenshot is the popup grid,
not the small decorative 3D table board.
