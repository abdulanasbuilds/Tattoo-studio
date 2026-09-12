# Tattoo Studio Clone Verification

## Scope

Seven supplied reference sites are available through the Home / Variants menu. Each variation points to a sanitized, page-faithful static capture of its supplied source. The sanitization removes visible template promotions, pricing/purchase badges, Framer badges, creator/template footer credits, and platform branding, then adds the requested Abdul Anas builder footer and the two configured phone numbers.

## Routes checked

| Variation | Route | Desktop screenshot | Mobile screenshot |
|---|---|---|---|
| TAT Studio | `?site=tatstudio` | `screenshots/tatstudio-desktop.png` | `screenshots/tatstudio-mobile.png` |
| Tattooverse | `?site=tattooverse` | `screenshots/tattooverse-desktop.png` | `screenshots/tattooverse-mobile.png` |
| Tattoxa | `?site=tattoxa` | `screenshots/tattoxa-desktop.png` | `screenshots/tattoxa-mobile.png` |
| Marrow | `?site=marrow` | `screenshots/marrow-desktop.png` | `screenshots/marrow-mobile.png` |
| David | `?site=david` | `screenshots/david-desktop.png` | `screenshots/david-mobile.png` |
| Uroki | `?site=uroki` | `screenshots/uroki-desktop.png` | `screenshots/uroki-mobile.png` |
| Spector | `?site=spector` | `screenshots/spector-desktop.png` | `screenshots/spector-mobile.png` |

## Automated checks

- All seven selector routes returned HTTP 200.
- All fourteen desktop/mobile screenshots were generated at 1440×1000 and 390×844.
- `python3 tools/audit_clones.py` passed for all fourteen clone files.
- Each final clone contains exactly one Abdul Anas builder footer and both configured phone numbers: `+233597896078` and `0503474172`.
- Preserved hydration scripts are retained where the source uses them; required `framerusercontent.com` asset/module URLs are not platform branding and remain intact for visual fidelity.
- A direct headless comparison against `https://tatstudio.framer.website/` confirms the live TAT Studio reference itself renders in the same blank state under this environment; the local clone preserves that source behavior instead of introducing an invented redesign.

## Evidence

See [desktop-contact-sheet.png](desktop-contact-sheet.png) for the seven desktop captures and the individual files in `screenshots/` for full-size desktop/mobile evidence.
