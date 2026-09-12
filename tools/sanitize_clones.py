from pathlib import Path
import json,re
from bs4 import BeautifulSoup,NavigableString

ROOT=Path(__file__).resolve().parents[1]; CLONES=ROOT/'clones'
CFG=json.loads((ROOT/'data'/'builder.json').read_text())
PRICE=re.compile(r'(?i)(?<![A-Za-z])(?:[$€£]\s*\d[\d,]*(?:\.\d{1,2})?|\d[\d,]*(?:\.\d{1,2})?\s*(?:USD|EUR|GBP|GHS))(?![A-Za-z])')
RULES=[
(r'(?i)pricing|prices?','services'),(r'(?i)starting\s+at','custom work'),(r'(?i)per\s+hour','per session'),
(r'(?i)deposit','booking note'),(r'(?i)budget','design direction'),(r'(?i)cost','session details'),
(r'(?i)request a quote|request pricing','send an enquiry'),(r'(?i)view pricing','view the work'),
(r'(?i)digital creative agency|creative agency|digital agency|creative studio|design agency|design studio','tattoo & visual art studio'),
(r'(?i)web design','custom tattoo design'),(r'(?i)digital design|digital products?','visual art'),
(r'(?i)brand identity|branding','art direction'),(r'(?i)campaigns?','art projects'),
(r'(?i)portfolio','selected work'),(r'(?i)projects?','artworks'),(r'(?i)our team|the team|team','artists'),
(r'(?i)about us','about the studio'),(r'(?i)contact us|get in touch|book now','book a session'),
(r'(?i)Buy Template|More Templates|Get Template|Website by Framer|Made in Framer|Framer template|Framer Templates','Seidu Tattoo Studio'),
]

def rewrite(s):
    s=PRICE.sub('custom work',str(s))
    for p,r in RULES:s=re.sub(p,r,s)
    s=re.sub(r'(?i)framer(?:\.com)?','Seidu Tattoo Studio',s)
    return s

def footer(soup):
    for x in soup.select('.abdul-anas-builder-footer'):x.decompose()
    f=soup.new_tag('footer',attrs={'class':'abdul-anas-builder-footer','aria-label':'Studio contact'})
    b=soup.new_tag('strong');b.string=CFG['displayName']
    p=soup.new_tag('p');p.string='Tattooing · Painting · Sketches · Visual Art'
    socials=soup.new_tag('div',attrs={'class':'builder-socials'})
    for label,key in [('Instagram','instagram'),('TikTok','tiktok'),('X','x'),('Facebook','facebook'),('YouTube','youtube'),('GitHub','github')]:
        a=soup.new_tag('a',href=CFG['social'][key],target='_blank',rel='noopener');a.string=label;socials.append(a)
    phones=soup.new_tag('div',attrs={'class':'builder-phones'})
    for n in (CFG['phonePrimary'],CFG['phoneSecondary']):
        a=soup.new_tag('a',href='tel:'+re.sub(r'[^+0-9]','',n));a.string=n;phones.append(a)
    f.extend([b,p,socials,phones]); old=soup.find('footer')
    if old:old.replace_with(f)
    elif soup.body:soup.body.append(f)

def sanitize(path):
    raw=path.read_text(encoding='utf-8',errors='ignore').replace('https://usercontent.com/','https://framerusercontent.com/')
    soup=BeautifulSoup(raw,'html.parser')
    for tag in list(soup.find_all(True)):
        a=getattr(tag,'attrs',{}) or {};ident=str(a.get('id','')).lower();cls=a.get('class',[])
        if isinstance(cls,str):cls=cls.split()
        if ident in {'__framer-badge-container','__abdul-hidden-badge-container'} or 'framer-badge' in {str(x).lower() for x in cls} or 'data-framer-badge' in a:tag.decompose()
    for node in list(soup.find_all(string=True)):
        if node.parent and node.parent.name not in {'script','style','noscript'}:
            new=re.sub(r'(?i)all rights reserved','',rewrite(node))
            if new!=str(node):node.replace_with(NavigableString(new))
    for tag in soup.find_all(['input','textarea']):
        for a in ('placeholder','value'):
            if tag.has_attr(a):tag[a]=rewrite(tag[a])
    for link in list(soup.find_all('link')):
        if 'canonical' in str(link.get('rel','')).lower():link.decompose()
    for tag in soup.find_all('title'):tag.string='Seidu Tattoo Studio | Tattoos & Visual Art | East Legon'
    for tag in soup.find_all('meta'):
        if tag.get('name')=='description' or tag.get('property') in {'og:description','twitter:description'}:tag['content']='Custom tattoos, paintings, sketches, and visual artwork by Seidu in East Legon.'
        elif tag.get('property')=='og:title' or tag.get('name')=='twitter:title':tag['content']='Seidu Tattoo Studio | Tattoos & Visual Art | East Legon'
    footer(soup);path.write_text(str(soup),encoding='utf-8')

for path in sorted(CLONES.glob('*.html')):sanitize(path)
