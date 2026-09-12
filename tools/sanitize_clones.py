from pathlib import Path
import re
import json
from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
CLONES = ROOT / 'clones'
_config = json.loads((ROOT / 'data' / 'builder.json').read_text())
BUILDER = {
    'name': _config['displayName'],
    'handle': _config['handle'],
    'phone_primary': _config['phonePrimary'],
    'phone_secondary': _config['phoneSecondary'],
    **_config['social'],
}
REMOVE_TEXT = (
    'Buy Template', 'More Templates', 'Create a free website with Framer',
    'Framer template', 'Framer Templates', 'Website by Framer', 'Made in Framer', 'Get Template',
    'Charwastudio', 'Created by',
)
STYLE = '''<style id="abdul-anas-overrides">
.abdul-anas-builder-footer{margin:0;padding:clamp(32px,6vw,90px) clamp(20px,5vw,80px);background:#111;color:#fff;text-align:center;display:grid;gap:18px;position:relative;z-index:20;font-family:Arial,sans-serif}
.abdul-anas-builder-footer strong{display:block;font-size:clamp(28px,6vw,76px);line-height:.95;letter-spacing:.02em;font-weight:900}
.abdul-anas-builder-footer p{margin:0;font-size:clamp(14px,2vw,22px);font-weight:700;letter-spacing:.03em}
.abdul-anas-builder-footer a{color:inherit;text-decoration:underline;text-underline-offset:3px}
.abdul-anas-builder-footer .builder-socials{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 18px;font-size:14px;font-weight:700}
.abdul-anas-builder-footer .builder-phones{display:flex;flex-wrap:wrap;justify-content:center;gap:10px 24px;font-size:16px;font-weight:800;letter-spacing:.04em}
a[href^="tel:"],input[type="tel"],*[class*="phone"],*[class*="Phone"]{font-weight:700;letter-spacing:.035em;text-shadow:0 0 .01px currentColor}
[id*="abdul-hidden-badge"],[data-abdul-hidden-badge],[data-badge],[id*="template-overlay"]{display:none!important;visibility:hidden!important}
</style>'''

def contains_badge(tag):
    attrs = getattr(tag, 'attrs', None) or {}
    tag_id = str(attrs.get('id', '')).lower()
    classes = attrs.get('class', [])
    if isinstance(classes, str): classes = classes.split()
    tokens = {str(x).lower() for x in classes}
    return tag_id in {'__framer-badge-container', '__abdul-hidden-badge-container'} or 'framer-badge' in tokens or 'data-framer-badge' in attrs

def text_match(tag):
    text = ' '.join(tag.stripped_strings).lower()
    return any(marker.lower() in text for marker in REMOVE_TEXT)

def builder_footer(soup):
    old = soup.select('.abdul-anas-builder-footer')
    for tag in old: tag.decompose()
    footer = soup.new_tag('footer', attrs={'class': 'abdul-anas-builder-footer', 'aria-label': 'Website builder contact'})
    strong = soup.new_tag('strong'); strong.string = f'BUILD BY {BUILDER["name"]}'
    p = soup.new_tag('p'); p.append('Socials: ')
    handle = soup.new_tag('a', href=BUILDER['instagram'], target='_blank', rel='noopener'); handle.string = BUILDER['handle']; p.append(handle)
    socials = soup.new_tag('div', attrs={'class': 'builder-socials'})
    for label, key in [('Instagram','instagram'),('TikTok','tiktok'),('X','x'),('Facebook','facebook'),('YouTube','youtube'),('GitHub','github')]:
        a = soup.new_tag('a', href=BUILDER[key], target='_blank', rel='noopener'); a.string = label; socials.append(a)
    phones = soup.new_tag('div', attrs={'class': 'builder-phones'})
    for number in [BUILDER['phone_primary'], BUILDER['phone_secondary']]:
        a = soup.new_tag('a', href='tel:' + re.sub(r'[^+0-9]', '', number)); a.string = number; phones.append(a)
    footer.extend([strong, p, socials, phones])
    existing = soup.find('footer')
    if existing:
        existing.replace_with(footer)
    elif soup.body:
        soup.body.append(footer)

def sanitize(path):
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')
    for tag in list(soup.find_all(True)):
        if contains_badge(tag): tag.decompose()
    for tag in soup.find_all(True):
        for attr in list(tag.attrs or {}):
            if attr.lower().startswith('data-framer'): del tag.attrs[attr]
            elif tag.name not in {'script', 'link'} and isinstance(tag.attrs.get(attr), str) and 'framer.com' in tag.attrs[attr].lower():
                tag.attrs[attr] = tag.attrs[attr].replace('jane@framer.com', 'jane@example.com').replace('framer.com', 'example.com')
    for tag in list(soup.find_all(['a','button','div','span','p','small','li'])):
        if tag.parent is None or tag.name in {'body','html','main','footer'} or tag.get('id') == 'main' or tag.parent.get('id') == 'main': continue
        if text_match(tag):
            tag.decompose()
    for tag in list(soup.find_all(['a','script','link'])):
        # Keep the original page scripts: several Framer captures hydrate their
        # visible page from these modules. Visible promotions and badges are
        # removed structurally below, without breaking the reference layout.
        if tag.name == 'script':
            continue
        href, src = str(tag.get('href','')), str(tag.get('src',''))
        script = tag.get_text(' ', strip=False) if tag.name == 'script' else ''
        urls = (href + ' ' + src + ' ' + script).lower()
        if any(marker in urls for marker in ['framer.com', 'charwastudio', 'lemonsqueezy', 'buy-template', 'more-templates']): tag.decompose()
    for tag in list(soup.find_all(['meta','title'])):
        vals = ' '.join(str(v) for v in (tag.attrs or {}).values()).lower() + ' ' + tag.get_text(' ', strip=True).lower()
        if any(x in vals for x in ['canonical','og:url','twitter:url','framer','template']): tag.decompose()
    for tag in soup.find_all(['input','textarea']):
        for attr in ('placeholder','value'):
            if attr in tag.attrs:
                tag.attrs[attr] = re.sub(r'(?i)framer(?:\.com)?', 'example.com', str(tag.attrs[attr]))
    for comment in list(soup.find_all(string=lambda v: isinstance(v,str) and 'framer' in v.lower())):
        if comment.parent and comment.parent.name not in {'script','style'}: comment.extract()
    for node in list(soup.find_all(string=True)):
        if node.parent and node.parent.name not in {'script','style'}:
            cleaned = node
            for marker in REMOVE_TEXT: cleaned = cleaned.replace(marker, '')
            cleaned = re.sub(r'(?i)all rights reserved', '', cleaned)
            cleaned = re.sub(r'©\s*20\d{2}', '', cleaned)
            cleaned = re.sub(r'(?i)framer(?:\.com)?', '', cleaned)
            if cleaned != node: node.replace_with(NavigableString(cleaned))
    head = soup.head or soup.new_tag('head'); head.append(BeautifulSoup(STYLE, 'html.parser'))
    if soup.head is None and soup.html: soup.html.insert(0, head)
    builder_footer(soup)
    output = str(soup).replace('template-overlay','abdul-hidden-overlay').replace('framer-badge','abdul-hidden-badge')
    # Hydration payloads can retain promotion copy as string data even after
    # visible nodes are removed; scrub those exact phrases while preserving
    # the rest of the original runtime.
    for marker in REMOVE_TEXT:
        output = output.replace(marker, '')
    path.write_text(output, encoding='utf-8')

if __name__ == '__main__':
    for path in sorted(CLONES.glob('*.html')):
        sanitize(path)
        print(path.name)
