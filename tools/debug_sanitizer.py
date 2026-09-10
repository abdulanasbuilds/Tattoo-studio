from pathlib import Path
from bs4 import BeautifulSoup
from sanitize_clones import text_match, smallest_removable

soup = BeautifulSoup(Path('/home/ubuntu/reference-captures/marrowtattoo_framer_website_.html').read_text(errors='ignore'), 'html.parser')
for tag in list(soup.find_all(['a', 'button', 'div', 'span', 'p', 'small', 'li'])):
    if tag.parent is None or tag.name in {'body', 'html', 'main', 'footer'} or tag.get('id') == 'main':
        continue
    if text_match(tag):
        print(tag.name, tag.get('id'), tag.get('class'), len(str(tag)), 'parent=', tag.parent.name, tag.parent.get('id'))
