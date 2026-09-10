from pathlib import Path
import re
from bs4 import BeautifulSoup, NavigableString

ROOT = Path(__file__).resolve().parents[1]
CLONES = ROOT / 'clones'

REMOVE_TEXT = (
    'Buy Template',
    'More Templates',
    'Create a free website with Framer',
    'Framer template',
    'Website by',
)
REMOVE_ATTR_MARKERS = ('framer-badge', 'template-overlay', 'framer-badge-container')
STYLE = '''
<style id="abdul-anas-overrides">
  .abdul-anas-credit{font:500 11px/1.4 Arial,sans-serif;letter-spacing:.04em;color:inherit;opacity:.9;padding:12px 0}
  .abdul-anas-credit a{font-weight:700;text-decoration:underline}
  a[href^="tel:"],a[href*="phone"],input[type="tel"],*[class*="phone"],*[class*="Phone"]{font-weight:700;letter-spacing:.035em;text-shadow:0 0 .01px currentColor}
  [data-badge],[id*="template-overlay"]{display:none!important;visibility:hidden!important}
</style>
'''

def contains_marker(tag):
    attrs_dict = getattr(tag, 'attrs', None) or {}
    tag_id = str(attrs_dict.get('id', '')).lower()
    classes = attrs_dict.get('class', [])
    if isinstance(classes, str):
        classes = classes.split()
    class_tokens = {str(item).lower() for item in classes}
    return tag_id in {'__framer-badge-container', '__abdul-hidden-badge-container'} or 'framer-badge' in class_tokens or 'data-framer-badge' in attrs_dict

def text_match(tag):
    text = ' '.join(tag.stripped_strings)
    return any(marker.lower() in text.lower() for marker in REMOVE_TEXT)

def smallest_removable(tag):
    return tag

def sanitize(path):
    soup = BeautifulSoup(path.read_text(encoding='utf-8', errors='ignore'), 'html.parser')

    for tag in list(soup.find_all(True)):
        if contains_marker(tag):
            tag.decompose()

    for tag in soup.find_all(True):
        for attr in list(tag.attrs or {}):
            if attr.lower().startswith('data-framer'):
                del tag.attrs[attr]

    for tag in list(soup.find_all(['a', 'button', 'div', 'span', 'p', 'small', 'li'])):
        if tag.parent is None:
            continue
        if tag.name in {'body', 'html', 'main', 'footer'} or tag.get('id') == 'main' or tag.parent.get('id') == 'main':
            continue
        if text_match(tag):
            smallest_removable(tag).decompose()

    for tag in list(soup.find_all(['a', 'script', 'link'])):
        href = str(tag.get('href', ''))
        src = str(tag.get('src', ''))
        script_text = tag.get_text(' ', strip=False) if tag.name == 'script' else ''
        if 'framer.com' in href or 'framer.com' in src or 'framer.com' in script_text.lower():
            tag.decompose()

    for tag in list(soup.find_all(['meta', 'title'])):
        if 'framer' in tag.get_text(' ', strip=True).lower() or 'template' in tag.get('content', '').lower():
            tag.decompose()

    for comment in list(soup.find_all(string=lambda value: isinstance(value, str) and 'framer' in value.lower())):
        if comment.parent and comment.parent.name not in {'script', 'style'}:
            comment.extract()

    for node in list(soup.find_all(string=True)):
        if node.parent and node.parent.name not in {'script', 'style'}:
            cleaned = node
            for marker in REMOVE_TEXT:
                cleaned = cleaned.replace(marker, '')
            cleaned = re.sub(r'(?i)framer(?:\.com)?', '', cleaned)
            if cleaned != node:
                node.replace_with(NavigableString(cleaned))

    head = soup.head or soup.new_tag('head')
    head.append(BeautifulSoup(STYLE, 'html.parser'))
    if soup.head is None and soup.html:
        soup.html.insert(0, head)

    footer = soup.find('footer') or soup.body
    if footer:
        credit = soup.new_tag('div', attrs={'class': 'abdul-anas-credit'})
        credit.append('Website by ')
        link = soup.new_tag('a', href='https://github.com/abdulanasbuilds', target='_blank', rel='noopener')
        link.string = 'Abdul Anas'
        credit.append(link)
        footer.append(credit)

    output = (str(soup)
              .replace('template-overlay', 'abdul-hidden-overlay')
              .replace('framer-badge', 'abdul-hidden-badge')
              .replace('framer.com', 'abdul-anas.dev'))
    path.write_text(output, encoding='utf-8')

if __name__ == '__main__':
    for path in sorted(CLONES.glob('*.html')):
        sanitize(path)
        print(path.name)
