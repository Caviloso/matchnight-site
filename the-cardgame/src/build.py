# Builds Matchnight: The Card Game into one self-contained HTML page.
#
#   python3 the-cardgame/src/build.py            (run from anywhere)
#
# Reads src.html and fills its placeholders:
#   LOGO_URI      <- logo.datauri.txt (the Matchnight logo as a data URI)
#   NATIONS_JSON  <- nations.json
#   ART_<KEY>     <- art/<key>-pic.webp (the 4:3 card paintings, about 720 wide)
# The version comes from  BUILD = 'vX.X.X.X'  in src.html. It writes:
#   builds/matchnight-the-card-game-vX.X.X.X.html   the kept copy of this version (build history)
#   index.html                                       the page at matchnightgame.com/the-cardgame/
# An existing build of the same version is never overwritten with different content: bump BUILD in src.html
# first (fix = last number up, new feature = third number up), or pass --force to replace it on purpose.
import base64, json, os, re, sys

HERE = os.path.dirname(os.path.abspath(__file__))
GAME = os.path.dirname(HERE)  # the-cardgame/
NOINDEX = '<meta name="robots" content="noindex">'  # keeps search engines off the page until launch

src = open(os.path.join(HERE, 'src.html'), encoding='utf-8').read()
build = re.search(r"BUILD = '(v[0-9]+\.[0-9]+\.[0-9]+\.[0-9]+)'", src).group(1)
logo = open(os.path.join(HERE, 'logo.datauri.txt'), encoding='utf-8').read().strip()
nat = json.load(open(os.path.join(HERE, 'nations.json'), encoding='utf-8'))
out = src.replace('LOGO_URI', logo).replace('NATIONS_JSON', json.dumps(nat, ensure_ascii=False, separators=(',', ':')))
art = os.path.join(HERE, 'art')
for f in sorted(os.listdir(art)):
    m = re.match(r'([a-z]+)-pic\.webp$', f)
    if not m:
        continue
    ph = 'ART_' + m.group(1).upper()
    if ph in out:
        uri = 'data:image/webp;base64,' + base64.b64encode(open(os.path.join(art, f), 'rb').read()).decode()
        out = out.replace(ph, uri)
left = sorted(set(re.findall(r'ART_[A-Z]+|LOGO_URI|NATIONS_JSON', out)))
assert not left, f'placeholders without a file: {left}'

kept = os.path.join(GAME, 'builds', f'matchnight-the-card-game-{build}.html')
if os.path.exists(kept) and open(kept, encoding='utf-8').read() != out and '--force' not in sys.argv:
    sys.exit(f'{os.path.basename(kept)} already exists with different content: bump BUILD in src.html (or use --force)')
open(kept, 'w', encoding='utf-8').write(out)

page = out.replace('<title>', NOINDEX + '\n<title>', 1) if NOINDEX not in out else out
open(os.path.join(GAME, 'index.html'), 'w', encoding='utf-8').write(page)
print(f'{build}: {len(out):,} bytes -> builds/{os.path.basename(kept)} and index.html')
