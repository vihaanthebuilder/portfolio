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
