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

# Text-only copy refresh: keep the original DOM, classes, styles, imagery,
# animation hooks, and responsive structure intact while making the visible
# messaging consistently about tattooing and visual art.
COPY_REPLACEMENTS = [
    (r'(?i)best tattoo studio in nyc\s*\|\s*custom tattoos\s*\|\s*tat tattoo studio', 'Seidu Tattoo Studio | Custom Tattoos & Visual Art | East Legon'),
    (r'(?i)get custom tattoos from the top tattoo artists in nyc at tat tattoo studio\.\s*specializing in unique designs and professional artistry, our studio offers the best tattoo experience in new york city\.', 'Custom tattoos, paintings, sketches, and visual artwork by Seidu in East Legon. Every piece is developed with care, from the first idea to the finished work.'),
    (r'(?i)tattoo studio\s*[·|-]\s*visual arts?\s*[·|-]\s*new york', 'Tattoo studio · visual art · East Legon'),
    (r'(?i)digital creative agency', 'tattoo & visual art studio'),
    (r'(?i)creative agency', 'tattoo & visual art studio'),
    (r'(?i)digital agency', 'tattoo & visual art studio'),
    (r'(?i)creative studio', 'tattoo & visual art studio'),
    (r'(?i)design agency', 'tattoo & visual art studio'),
    (r'(?i)design studio', 'tattoo & visual art studio'),
    (r'(?i)web design', 'custom tattoo design'),
    (r'(?i)digital design', 'visual art'),
    (r'(?i)digital products?', 'custom artwork'),
    (r'(?i)brand identity', 'art direction'),
    (r'(?i)branding', 'visual art'),
    (r'(?i)campaigns?', 'art projects'),
    (r'(?i)services?', 'tattoo & visual art'),
    (r'(?i)portfolio', 'selected work'),
    (r'(?i)projects?', 'selected work'),
    (r'(?i)our team', 'our artists'),
    (r'(?i)the team', 'the artists'),
    (r'(?i)team', 'artists'),
    (r'(?i)about us', 'about the studio'),
    (r'(?i)contact us', 'book a session'),
    (r'(?i)contact', 'book a session'),
    (r'(?i)let[’\']s talk', 'let[’\']s make something'),
    (r'(?i)get in touch', 'book a session'),
    (r'(?i)work with us', 'work with the artist'),
    (r'(?i)book now', 'book a session'),
    (r'(?i)request a quote', 'send an enquiry'),
    (r'(?i)request pricing', 'send an enquiry'),
    (r'(?i)view pricing', 'view the work'),
    (r'(?i)pricing', 'services'),
    (r'(?i)prices?', 'session details'),
    (r'(?i)starting\s+at', 'custom work'),
    (r'(?i)per\s+hour', 'per session'),
    (r'(?i)deposit', 'booking note'),
    (r'(?i)budget', 'design direction'),
    (r'(?i)cost', 'session details'),
    (r'(?i)plans?', 'tattoo & art'),
]

PRICE_TOKEN_RE = re.compile(r'(?i)(?<![A-Za-z])(?:[$€£]\s*\d[\d,]*(?:\.\d{1,2})?|\d[\d,]*(?:\.\d{1,2})?\s*(?:USD|EUR|GBP|GHS))(?![A-Za-z])')

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

def refresh_copy(value):
    value = PRICE_TOKEN_RE.sub('custom work', value)
    for pattern, replacement in COPY_REPLACEMENTS:
        value = re.sub(pattern, replacement, value)
    value = re.sub(r'(?i)framer(?:\.com)?', '', value)
    return value

def builder_footer(soup):
    old = soup.select('.abdul-anas-builder-footer')
    for tag in old: tag.decompose()
    footer = soup.new_tag('footer', attrs={'class': 'abdul-anas-builder-footer', 'aria-label': 'Studio contact'})
    strong = soup.new_tag('strong'); strong.string = f'{BUILDER["name"]}'
    p = soup.new_tag('p'); p.append('Tattooing · Painting · Sketches · Visual Art')
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
        # Keep page runtime/assets intact. Only remove explicit platform/template
        # promotion links; the visual layout and original asset structure stay put.
        if tag.name == 'script':
            continue
        href, src = str(tag.get('href','')), str(tag.get('src',''))
        script = tag.get_text(' ', strip=False) if tag.name == 'script' else ''
        urls = (href + ' ' + src + ' ' + script).lower()
        if any(marker in urls for marker in ['framer.com', 'charwastudio', 'lemonsqueezy', 'buy-template', 'more-templates']): tag.decompose()
    for tag in list(soup.find_all(['meta','title'])):
        vals = ' '.join(str(v) for v in (tag.attrs or {}).values()).lower() + ' ' + tag.get_text(' ', strip=True).lower()
        if any(x in vals for x in ['canonical','og:url','twitter:url']):
            if tag.name == 'title':
                tag.string = 'Seidu Tattoo Studio | Tattoos & Visual Art | East Legon'
            else:
                # Keep metadata structure but make its text studio-specific below.
                if tag.get('name') == 'description' or tag.get('property') in {'og:description', 'twitter:description'}:
                    tag['content'] = 'Custom tattoos, paintings, sketches, and visual artwork by Seidu in East Legon.'
                elif tag.get('property') == 'og:title' or tag.get('name') == 'twitter:title':
                    tag['content'] = 'Seidu Tattoo Studio | Tattoos & Visual Art | East Legon'
                else:
                    tag.decompose()
    for tag in soup.find_all(['input','textarea']):
        for attr in ('placeholder','value'):
            if attr in tag.attrs:
                tag.attrs[attr] = refresh_copy(str(tag.attrs[attr]))
    for comment in list(soup.find_all(string=lambda v: isinstance(v,str) and 'framer' in v.lower())):
        if comment.parent and comment.parent.name not in {'script','style'}: comment.extract()
    for node in list(soup.find_all(string=True)):
        if node.parent and node.parent.name not in {'script','style'}:
            cleaned = refresh_copy(str(node))
            cleaned = re.sub(r'(?i)all rights reserved', '', cleaned)
            cleaned = re.sub(r'©\s*20\d{2}', '', cleaned)
            if cleaned != str(node): node.replace_with(NavigableString(cleaned))
    head = soup.head or soup.new_tag('head'); head.append(BeautifulSoup(STYLE, 'html.parser'))
    if soup.head is None and soup.html: soup.html.insert(0, head)
    builder_footer(soup)
    output = str(soup).replace('template-overlay','abdul-hidden-overlay').replace('framer-badge','abdul-hidden-badge')
    for marker in REMOVE_TEXT:
        output = output.replace(marker, '')
    output = re.sub(r'(?i)framer(?:\.com)?', '', output)
    output = PRICE_TOKEN_RE.sub('custom work', output)
    for pattern, replacement in COPY_REPLACEMENTS:
        output = re.sub(pattern, replacement, output)
    path.write_text(output, encoding='utf-8')

if __name__ == '__main__':
    for path in sorted(CLONES.glob('*.html')):
        sanitize(path)
        print(path.name)
