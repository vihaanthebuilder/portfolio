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
