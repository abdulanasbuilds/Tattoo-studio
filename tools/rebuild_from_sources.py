from pathlib import Path
import shutil

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path('/home/ubuntu/source_pages')
MAPPING = {
    'spector': 'spector_framer_website_.html',
    'tatstudio': 'tatstudio_framer_website_.html',
    'tattooverse': 'tattooverse_framer_website_.html',
    'tattoxa': 'tattoxa_framer_website_.html',
    'marrow': 'marrowtattoo_framer_website_.html',
    'david': 'frank_pineapples_641527_framer_app_.html',
    'uroki': 'urokitattoostudio_framer_website_.html',
}
for name, source_name in MAPPING.items():
    src = SOURCE / source_name
    if not src.exists():
        raise FileNotFoundError(src)
    shutil.copyfile(src, ROOT / 'clones' / f'{name}-v74e2db6.html')
    shutil.copyfile(src, ROOT / 'clones' / f'{name}.html')
    print(name)

import subprocess
subprocess.run(['python3', str(ROOT / 'tools' / 'sanitize_clones.py')], check=True, cwd=ROOT)

audit = subprocess.run(['python3', str(ROOT / 'tools' / 'audit_clones.py')], cwd=ROOT)
raise SystemExit(audit.returncode)
