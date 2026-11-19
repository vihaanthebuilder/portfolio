# Applying Sally's UX review to the Room Life scene

## Source and scope

The reference `sally-ux-review-2026-11-12.md` is Sally's review of Ahaan's
portfolio pages, not a review of Vihaan's 3D model or room. It gives useful
context for this work: the reader is in grade 3; use sensory-friendly motion,
no sound before it is requested, visible focus, readable contrast, and kind
feedback. It contains no direct verdict about avatar proportions or plant
design. The scene observations below apply those principles to the Room Life
captures; they are not attributed to Sally as direct comments.

## Proportions and walking

- Compared with the grade-three reader context and nearby stair treads, dog,
  and arcade cabinet, the avatar close-up reads as a child: compact torso,
  larger head, and short stature against the room. The capture shows intended
  sneaker trim with no detached white shin patch.
- A trial at global scale 0.94 failed the existing planted-foot reach check,
  so the validated scale 1.06 remains. Childlike proportions come from the
  avatar geometry rather than shrinking every body part and breaking gait.
- Cardinal walking turns toward its travel direction while preserving straight
  root paths on level ground and stairs. No extra camera shake or sound was
  added; flight is user-triggered and can be switched off.

## Plant variety and placement

- The fourteen small planters include upright sword-like leaves, broad leaves,
  branching foliage, rosettes, and a flower. Their geometry has seven distinct
  silhouette signatures; the three large plants use ficus, palm, and bird of
  paradise forms.
- The original bird-of-paradise large planter sat under the mezzanine slab,
  which hid the leaf tips and made the silhouette harder to read. It was moved
  to open floor at `(11.1, 1.25)`, outside the slab footprint and away from
  the central walking strip. The updated close-up shows the full silhouette;
  it is part of `/tmp/vihaan-room-life-fixes/sally-reference-final/`.
- The small clusters stay beside the stair and room edges. The wide view keeps
  the main floor, dog approach, and stair route legible; no planter was added
  to the clear center path.

## Other reviewed details

- The rail has a support at each tread and a continuous landing rail.
- The trophy plaque is warm and encouraging without a score or demand. The
  framed windows show a soft sky and green horizon. Both stay outside the
  walking route.
- The phone view keeps both players and the dog visible, the dog tap target
  inside the viewport, and the action bar within the screen width.

## Result

The scene passes this Sally-guided review against the available reference
principles. The proportions and plant judgments are local visual findings, not
Sally's direct approval. Captures are under
`/tmp/vihaan-room-life-fixes/review-final-mobile/` and
`/tmp/vihaan-room-life-fixes/final-captures/`.
