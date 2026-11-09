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
