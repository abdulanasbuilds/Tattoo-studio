# Variant architecture

Each variant is a presentation layer over the same shared business data. The runtime renderer lives in `app/renderer.js`; these entry points document the stable extension seams for future route-level overrides.

- `v1/pages/home.js` — Obsidian Editorial home composition
- `v2/pages/home.js` — Gallery White home composition
- `v3/pages/home.js` — Rust & Ritual home composition
- `v4/pages/home.js` — Ink Index home composition
- `v5/pages/home.js` — Electric Flash home composition

Shared primitives live in `/components`. Business content lives in `/data`. To add a future variant, add its config and a new folder without copying the shared page data.
