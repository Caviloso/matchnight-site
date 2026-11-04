# Matchnight: The Card Game

A small football card game to play on matchnightgame.com while Matchnight heads for early release.
It lives at **matchnightgame.com/the-cardgame/** and only ever touches this folder: nothing else on the site.

## What is in here

| Path | What it is |
|---|---|
| `index.html` | The page players see at /the-cardgame/: always the latest build. |
| `builds/` | Every build ever made, one file per version. Never edited after the fact. |
| `CHANGELOG.md` | One line per version: what changed. |
| `src/src.html` | The game's source: one HTML page with a few placeholders. |
| `src/nations.json` | The nations, players and cards. |
| `src/art/<key>-pic.webp` | The painted card art (4:3, 720 wide). |
| `src/logo.datauri.txt` | The Matchnight logo, ready to drop into the page. |
| `src/build.py` | Fills the placeholders and writes the build + index.html. |
| `src/runbot.js` | A test bot that plays full runs in a headless browser and reports errors. |

## Making a new build

1. Change `src/` (game code in `src.html`, cards in `nations.json`, art in `src/art/`).
2. Bump `BUILD = 'v…'` in `src.html`: fix = last number up, new feature = third number up.
3. `python3 the-cardgame/src/build.py` writes `builds/matchnight-the-card-game-<version>.html` and `index.html`.
   It refuses to overwrite an existing version with different content, so old builds stay as they were.
4. Test: copy `index.html` next to `runbot.js` as `page.html`, make a `shots/` folder, run `node runbot.js 3`; it must end with `errors []`.
5. Add a line to `CHANGELOG.md`, commit on a branch, open a pull request. The site only changes when Kevin merges it.

New painting: resize the 4:3 picture to `src/art/<key>-pic.webp` (720 wide), add the key to `PAINTED` in `src.html`
and a `.ph-<key> .c-pic { background-image: url("ART_<KEY>") }` rule; build.py fills `ART_<KEY>` in.

`index.html` carries `<meta name="robots" content="noindex">` (added by build.py) so search engines skip the page
until launch. To launch it properly, remove `NOINDEX` from build.py and rebuild.
