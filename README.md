# ↺ OR ↻

**回すだけ。外へ、外へ。**

赤玉は常に外へ押される。ハマった段の回転リングが、↺/↻ に合わせて赤玉を運ぶ。外側のリングの切れ目に届けば「ポン！」と次の段へ。切れ目が同じ方向に並んでいれば、何枚でも続けて抜ける。

This is a mobile-first, minimalist mechanical ring puzzle. **No switches, no timers, no enemies.** Only the holes and your choice of direction.

## Play

- 10 selectable stages, 16 discrete angles per ring.
- Touch buttons (↺ / ↻), or left/right arrow keys.
- Restart, Undo, optional hint, progress saved in localStorage, sound toggle.
- **OUT IN N** is a minimum-move goal, *not* a move limit. Any escape is valid; matching the solver's shortest count earns PERFECT.
- Stage 009 (BAIT) tests whether the tempting long opening is actually the correct route.

## Run locally

Node.js 20+ required. No external dependencies.

```bash
npm run dev
```

Open **http://localhost:5173/**.

You can also test on an Android phone over the same Wi-Fi by using `http://<your-PC-LAN-IP>:5173/`.

## Tests

```bash
npm test
```

The exact breadth-first solver in `engine.mjs` checks stage minima, and the tests confirm the first 10 stages' advertised solutions.

## Publish

It is a static website with no build step. To make a public playable link, open **Settings → Pages** and publish the repository root of branch `main`. This should expose the game at `https://madowaku.github.io/ccw-or-cw/` once GitHub Pages has successfully deployed. The link should not be treated as live before deployment completes.

## Physics / design contract

The bead is continuously pushed radially outward, while a small mechanical catcher on its *current inner ring* carries it tangentially. The next outer ring contains the target gap, so that target gap stays stationary while the current ring rotates. This avoids the impossible situation of a ball revolving in perfect lockstep with its own target hole.

In v0.1, physics is **discrete**: the angular positions are integers 0–15, and animation interpolates between them. The red bead moves toward the **first gap** in the selected direction, then immediately cascades through any farther aligned gaps. Only the ring carrying the bead rotates; the outer rings wait their turn.

The next gate is human playtesting on a 360×800 Android display: verify that the current ring physically appears to rotate (not only the bead), that ↺/↻ is unambiguous, and that Stage 009 produces a real puzzle insight. Browser screenshot and Android touch QA are **not yet completed**.

Title: **↺ OR ↻**. Repository: `ccw-or-cw`.
