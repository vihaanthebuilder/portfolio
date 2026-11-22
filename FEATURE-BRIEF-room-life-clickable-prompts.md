# Vihaan Room Life — clickable prompt pills

**Asked by:** Nishant, Sat Nov 21, 2026, 9:09 PM CT (typed from the Mac, with screenshot of the "Enter — Press Enter: Read Storybook 📖" pill): "also lick clicking instead of perssing enter should aslo work - like you can press the button on the screen" (read: clicking instead of pressing Enter should also work — you can press the button on the screen).
**Project:** Vihaan's World, Room Life (index.html home page, worker 0069, worktree `.worktrees/feature-room-life-scene`).
**Queue position:** With the Room Life fixes — after the jetpack flight fix, alongside the skateboard/feet/hoop brief. Can ship in the same publish as either if the worker prefers; otherwise its own small publish.

## What to build
Every interaction prompt pill in Room Life (e.g. "Press Enter: Read Storybook", "Press Enter to pet the dog", and any other Enter/key prompts) becomes a real on-screen button:

1. Clicking (desktop) or tapping (mobile) the pill triggers exactly the same action as pressing Enter — same result, same animation, same kind line.
2. Keyboard Enter keeps working exactly as now. Both routes, always.
3. The pill looks pressable: pointer cursor on hover, a gentle pressed state on click/tap. Keep the current pill styling (rounded, dark Enter chip) — just make the whole pill the button.
4. In Play together mode, each player's prompts stay correct: Vihaan's Enter actions (arrows + Enter) clickable on his pill; Ahaan's E-key actions (WASD + E) clickable on his pill if shown. Clicking must not steal the other player's input.
5. Touch targets at least 44px tall on mobile (390x844).

## Acceptance checks
- Click "Read Storybook" pill → storybook opens (same as Enter). Click pet-dog pill → dog tail wag + "Good dog!" (same as Enter).
- Enter key still triggers both. Mobile tap works on both pills.
- room-life-feature suite passes (update its prompt assertions to cover click as well as key); zero console/page errors.
- Publish on driver authority + live-verify + Fresh Drops entry WITH screenshot showing a pill being clicked (standing rule: no entry without its screenshot).

## Notes
- Sensory-friendly: gentle press feedback, no flashing.
- Do not copy code from Ahaan's Park repo; this is Vihaan's Room Life only.
