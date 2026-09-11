from pathlib import Path
from bs4 import BeautifulSoup

BAD = ['Buy Template', 'More Templates', 'Create a free website with Framer', 'Framer template', 'template-overlay', 'framer-badge', 'framer.com', 'Made in Framer']
for path in sorted(Path('clones').glob('*.html')):
    text = path.read_text(errors='ignore')
    soup = BeautifulSoup(text, 'html.parser')
    hits = [item for item in BAD if item.lower() in text.lower()]
    has_credit = 'abdul anas' in text.lower()
    print(path.name, 'hits=' + (','.join(hits) if hits else 'none'), 'credit=' + str(has_credit), 'html=' + str(bool(soup.html)), 'body=' + str(bool(soup.body)))
    if hits:
        raise SystemExit(f'residual branding in {path.name}: {hits}')
    if not has_credit or not soup.html or not soup.body:
        raise SystemExit(f'invalid sanitized clone: {path.name}')
