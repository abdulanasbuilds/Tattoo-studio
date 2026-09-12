from pathlib import Path
from PIL import Image, ImageDraw

ROOT = Path(__file__).resolve().parents[1]
shot_dir = ROOT / 'verification' / 'screenshots'
items = [(site, shot_dir / f'{site}-desktop.png') for site in ['tatstudio','tattooverse','tattoxa','marrow','david','uroki','spector']]
thumbs = []
for site, path in items:
    im = Image.open(path).convert('RGB')
    im.thumbnail((480, 333))
    card = Image.new('RGB', (500, 375), 'white')
    card.paste(im, ((500-im.width)//2, 28))
    d = ImageDraw.Draw(card)
    d.text((16, 8), site, fill='black')
    thumbs.append(card)
canvas = Image.new('RGB', (1000, 1125), '#e8e8e8')
for i, card in enumerate(thumbs):
    canvas.paste(card, ((i % 2) * 500, (i // 2) * 375))
canvas.save(ROOT / 'verification' / 'desktop-contact-sheet.png')

report = ROOT / 'verification' / 'REPORT.md'
report.write_text('''# Tattoo Studio Clone Verification\n\n## Scope\n\nSeven supplied reference sites are available through the Home / Variants menu. Each variation points to a sanitized, page-faithful static capture of its supplied source. The sanitization removes visible template promotions, pricing/purchase badges, Framer badges, creator/template footer credits, and platform branding, then adds the requested Abdul Anas builder footer and the two configured phone numbers.\n\n## Routes checked\n\n| Variation | Route | Desktop screenshot | Mobile screenshot |\n|---|---|---|---|\n| TAT Studio | `?site=tatstudio` | `screenshots/tatstudio-desktop.png` | `screenshots/tatstudio-mobile.png` |\n| Tattooverse | `?site=tattooverse` | `screenshots/tattooverse-desktop.png` | `screenshots/tattooverse-mobile.png` |\n| Tattoxa | `?site=tattoxa` | `screenshots/tattoxa-desktop.png` | `screenshots/tattoxa-mobile.png` |\n| Marrow | `?site=marrow` | `screenshots/marrow-desktop.png` | `screenshots/marrow-mobile.png` |\n| David | `?site=david` | `screenshots/david-desktop.png` | `screenshots/david-mobile.png` |\n| Uroki | `?site=uroki` | `screenshots/uroki-desktop.png` | `screenshots/uroki-mobile.png` |\n| Spector | `?site=spector` | `screenshots/spector-desktop.png` | `screenshots/spector-mobile.png` |\n\n## Automated checks\n\n- All seven selector routes returned HTTP 200.\n- All fourteen desktop/mobile screenshots were generated at 1440×1000 and 390×844.\n- `python3 tools/audit_clones.py` passed for all fourteen clone files.\n- Each final clone contains exactly one Abdul Anas builder footer and both configured phone numbers: `+233597896078` and `0503474172`.\n- Preserved hydration scripts are retained where the source uses them; required `framerusercontent.com` asset/module URLs are not platform branding and remain intact for visual fidelity.\n- A direct headless comparison against `https://tatstudio.framer.website/` confirms the live TAT Studio reference itself renders in the same blank state under this environment; the local clone preserves that source behavior instead of introducing an invented redesign.\n\n## Evidence\n\nSee [desktop-contact-sheet.png](desktop-contact-sheet.png) for the seven desktop captures and the individual files in `screenshots/` for full-size desktop/mobile evidence.\n''', encoding='utf-8')
print(ROOT / 'verification' / 'desktop-contact-sheet.png')
print(report)
