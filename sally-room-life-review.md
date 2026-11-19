# Sally UX review — Room Life scene fixes

Review basis: Sally's project guardrails in `sally-ux-review-2026-11-12.md` and
visual inspection of Playwright captures from the Room Life scene at desktop
1280×800 and phone 390×844. This is a recorded UX pass, not a claim that Sally
personally approved the changes.

## Character and play

- The close-up reads as a child: round head, compact torso, short visual reach
  beside the stair tread and dog. The tested smaller global scale made the
  planted-foot reach fail, so the original 1.06 scale stays; the proportions
  come from the existing head/torso geometry.
- The white boot artifact was the lower shin segment using the shoe's white
  material. Matching it to the denim leaves the intended white sneaker trim
  intact and removes the detached white patch.
- Cardinal walking faces its travel direction promptly and keeps the measured
  root path straight on flat ground and stairs. The fast turn eases smoothly;
  no new camera shake or sound was added.
- Vihaan and Ahaan's labels, red/blue shirts, and red/blue quads read as a pair
  in the Play Together capture. The blue quad now tracks Ahaan's position as
  he walks, so the seated/pedaling pose has a visible vehicle underneath.
- Flight remains user-triggered through Shift/Q or the visible action buttons.
  The button labels and `aria-pressed` state name the mode; there is no autoplay.

## Room details

- The fourteen small plants use different silhouettes: upright fronds, broad
  leaves, branching foliage, rosettes, and a flower form. The three large
  planters have distinct ficus, palm, and bird-of-paradise shapes. Their pots
  remain outside the tested stair and dog interaction paths; a few sit in the
  mezzanine's natural shade, but none cover the route.
- The stair handrail now has a support at each tread and a continuous landing
  rail. The supports align with the stair run in the wide capture.
- The plaque text is warm and encouraging, fully legible below the shelves,
  and makes no demand or score claim. The windows show a simple sky and green
  horizon with warm framing; their sill and nearby plant stay clear of the
  walkway.
- Phone capture keeps both players and the dog in view, the dog tap target is
  inside the viewport, and the action controls fit without horizontal scroll.

## Result

The reviewed scenes meet the brief's gentle, readable direction. Keep the
child-scale geometry and the denim shin. Final captures are in
`/tmp/vihaan-room-life-fixes/review-final-mobile/` and the earlier close-up set
is in `/tmp/vihaan-room-life-fixes/final-captures/`.
