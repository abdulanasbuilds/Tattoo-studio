# Tattoo Studio Reference Variants

This project is intentionally reference-faithful. The Home / Variants menu exposes the seven supplied websites directly, page for page, while applying one shared builder footer and removing platform/template promotion.

## Reference variants

- TAT Studio — `?site=tatstudio`
- TattooVerse — `?site=tattooverse`
- Tattoxa — `?site=tattoxa`
- Marrow — `?site=marrow`
- David — `?site=david`
- Uroki — `?site=uroki`
- Spector — `?site=spector`

## Builder brand configuration

The footer is generated consistently across every clone from [`data/builder.json`](data/builder.json). To rebrand the builder, edit `displayName`, `handle`, phone numbers, and social URLs in that file, then regenerate the clones:

```bash
python3 tools/sanitize_clones.py
```

Each page footer displays **BUILD BY ABDUL ANAS**, `@abdulanasbuilds`, `+233597896078`, and `0503474172`, with links to the configured social profiles. The original template/platform badges, purchase links, pricing promotions, and creator credits are removed.

## Run locally and verify

Run locally with any static server, for example:

```bash
python3 -m http.server 4173
python3 tools/audit_clones.py
```

The current homepage is a thin local selector around the exact supplied reference pages so visual comparison remains one-to-one. All seven clone routes are static, directly addressable, and checked for valid HTML, preserved content, local image assets, and the shared builder footer.
