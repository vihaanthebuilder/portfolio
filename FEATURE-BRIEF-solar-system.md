# FEATURE BRIEF — Solar System (Vihaan's portfolio)

## Reference: the museum exhibit (photos from Nishant, Nov 15, 2026)

Vihaan used this at Science Museum Oklahoma — a big touch screen. Copy
its feel, not its code:

- **Zoom in and out is THE interaction.** Tap a planet and the camera
  zooms right into it (Earth fills the screen, clouds and city lights
  visible). Zoom back out to see the whole system again. A zoom slider
  on the side, like the exhibit's ZOOM bar.
- **Top tab bar:** INNER PLANETS | OUTER PLANETS | ASTEROIDS | COMETS |
  DWARF PLANETS. Tapping a tab shows that group's planet chips
  underneath (e.g. OUTER PLANETS shows Jupiter, Saturn, Uranus, Neptune).
  Tapping a chip zooms to that planet.
- **Fact card per planet, exactly these 6 stats** (same as the exhibit):
  Distance (AU), Mass (Earths), Day Length (hours), Orbit Year (days),
  Axial Tilt (degrees), Orbital Speed (km/s). Plus one fun fact line.
  Earth's card reads: 1 AU, 1 Earth, 24 hours, 365 days, 23.5 degrees,
  30.2 km/s — check every planet's 6 numbers against NASA.
- **System speed control** — a dial/slider like the exhibit's "SYSTEM
  SPEED 1.7 MINUTES PER SECOND": it sets how fast time runs.
- **Earth look:** day side bright with clouds and green/blue land, night
  side dark with city lights, thin blue atmosphere glow around the edge.

## What to build

One new page, `solar-system.html`, on Vihaan's portfolio site. A highly
detailed, animated 3D solar system that a 9-year-old can explore by
clicking planets.

## Open source reference (study it, do not copy it wholesale)

Best match found Nov 15, 2026: **elymas/solar-simulator**
(github.com/elymas/solar-simulator, MIT License).

- Three.js, real Keplerian orbits from NASA JPL orbital elements,
  2K planet textures, time controls, click-a-planet info panel, Moon,
  animated Earth clouds. Fully static, no backend, hosted on GitHub Pages.
- Its textures come from Solar System Scope under **CC BY 4.0** — if you
  use those textures, put one attribution line on the page.
- Second reference: **THREEx Planets / D3-Orrery** by ofrohn (BSD License)
  — three.js planet set with real surface textures, zoom and rotate.
- Rule: take the *approach* (orbits from real periods, textures, info
  panel). Write our own code for Vihaan's page. Keep it simple enough
  for a kid's site. Do not clone a whole repo into this project.

## What the page must have

1. **The Sun** at the centre, glowing, with light that falls on the
   planets.
2. **All 8 planets**, in order: Mercury, Venus, Earth, Mars, Jupiter,
   Saturn, Uranus, Neptune. Each one spins on its axis AND orbits the Sun.
3. **Real year lengths** (orbital periods): Mercury 88 days, Venus 225,
   Earth 365, Mars 687, Jupiter 12 years, Saturn 29 years, Uranus 84
   years, Neptune 165 years. Speed up time so the outer planets visibly
   move. Sizes and distances are squeezed so all planets fit on one
   screen — say so on the page in one kind line ("Sizes and distances
   are squeezed so you can see them all").
4. **Saturn's rings** (tilted, see-through at the edges) and **Uranus
   tilted on its side** (98 degrees, it rolls around the Sun).
5. **Earth's Moon** orbiting Earth. **Earth's clouds** as a thin second
   layer that drifts.
6. **Dwarf planets**: Pluto, Ceres, Eris, Makemake, Haumea — small,
   labelled, on their own far orbits.
7. **Asteroid belt** between Mars and Jupiter — many small grey rocks.
8. **Star background** — thousands of tiny stars, no plain black void.
9. **Orbit lines** — one thin circle per planet so Vihaan can see the path.
10. **Click a planet, see its facts.** A card shows exactly these 6
    stats, like the museum exhibit: Distance (AU), Mass (Earths), Day
    Length (hours), Orbit Year (days), Axial Tilt (degrees), Orbital
    Speed (km/s) — plus one fun fact line. Facts must be true — check
    each one against NASA (solarsystem.nasa.gov). Never invent a fact.
    If unsure, leave that fact out and write the planet name in
    HANDOFF.md under "Facts for Vihaan to check".
11. **Controls a kid can use**: Play / Pause button, a **system speed
    slider** ("minutes per second", like the exhibit), **zoom slider**
    on the side, **top tabs** (Inner Planets / Outer Planets / Asteroids
    / Comets / Dwarf Planets) with planet chips under them, drag to turn
    the view. Tap a planet or a chip to zoom into it; tap "Back to Sun"
    (or zoom all the way out) to see the whole system. Big buttons,
    touch friendly.
12. **"Follow" a planet**: tap "Follow" on a fact card and the camera
    follows that planet. Tap "Back to Sun" to return.

## Kid rules (Game Room rules apply)

- No scores, no timers, no fail state, no red for wrong anything.
- Kind words only. This is exploring, not a test.
- Works with mouse, touch, and keyboard (Tab to a planet, Enter to open
  its facts).
- Works at 1280x800 and at 390x844 (phone). No sideways scroll on phone.
- No console errors. No sound that starts by itself.

## Tech

- Three.js, the same way this repo already loads it if it does — check
  first. If the repo has no Three.js yet, use a pinned CDN module
  (three@0.160.0) with an import map, no build step, no backend.
- Files: `solar-system.html`, `assets/solar-system.js`,
  `assets/solar-system.css`, `assets/solar-system-data.js` (planet facts
  in one place, easy to check).
- Link the page from the Game Room and from the home page, next to the
  other games. One link each, same style as the other links.
- Branch `feature/solar-system` from `origin/main`, fresh worktree.
  Local commit only. No push, no publish — Goku publishes after the
  checks pass.

## Acceptance checks (do all of them)

- Open the page at 1280x800 and 390x844. All 8 planets are visible and
  moving. Saturn has rings. The Moon orbits Earth. The asteroid belt is
  there.
- Click every planet and every dwarf planet: the fact card opens, facts
  match NASA, no wrong numbers.
- Pause stops all motion. Speed slider changes the speed. Labels toggle
  works. Follow works and "Back to Sun" returns.
- Leave it running 2 minutes: no errors in the console, no planet
  drifts off its orbit line.
- Screenshots to `/tmp/vihaan-solar-system/`: desktop wide view, one
  fact card open (Earth), phone view.

## If something is too hard

- Drop the dwarf planets first, then the asteroid belt, then the clouds.
  Never drop the 8 planets, the Sun, or the fact cards. Record what
  was dropped in HANDOFF.md.
