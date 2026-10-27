# Brisbane ballot guide

An independent November 2026 voter guide and personal worksheet. Static HTML, CSS and JavaScript; no build step or service account required.

## Edit the guide

- `content/ballot.json`: contests, candidate summaries, forecast probabilities, sensitivity ranges, methods and shared citations.
- `content/research.html`: expanded council profiles, evidence, research gaps and their citations. Edit as ordinary HTML.
- `index.html`: page introduction, methodology, voting instructions and dates.
- `assets/styles.css`: visual style and responsive/print rules.
- `assets/app.js`: filters, choices, order, notes, browser storage and offline HTML download.

Keep contest IDs and candidate option order stable: saved worksheet choices refer to them. Reordering the source options can attach an existing choice to the wrong candidate. Use the website's arrows for personal ordering.

Research and forecasts were imported unchanged from `Brisbane_Ballot_Guide_2026.html`. This migration does not independently validate election claims or estimates. Check official sources when updating the research, and update the visible checked dates as well as the JSON metadata. The council research has a separate October 27 check date.

## Preview and check

Run from this directory:

```sh
python3 -m http.server 8765 --bind 127.0.0.1
```

Open http://127.0.0.1:8765. Serve over HTTP; opening the website's index file directly cannot load its research files. Download HTML produces a self-contained file that works offline.

```sh
python3 tests/check_content.py
node --check assets/app.js
```

`tests/worksheet.js` is a Playwright CLI regression for keyboard focus and editable offline-copy persistence. In an isolated Playwright CLI session open the preview, then pass that file's contents to `run-code`. It writes synthetic browser-local worksheet data and downloads only to `/tmp`.

Before publishing, check desktop and mobile, every filter, search, competitive/chosen views, choice limits, notes after reload, option ordering, reset, print, and a downloaded HTML file opened offline. Personal notes stay in the visitor's browser and are embedded only in their own downloaded copy. They are never committed or uploaded by the site. Browser storage is specific to the origin: localhost notes do not transfer automatically to GitHub Pages.

## Publish

GitHub Pages serves the repository root from `main`. Pushes to `main` trigger GitHub's Pages deployment automatically; no dependencies or custom workflow are needed.

```sh
git add index.html content assets AGENTS.md README.md tests .gitignore .nojekyll
git commit -m "Update ballot research"
git push origin main
```

Wait for the Pages deployment to finish, then check the live guide and its download. Keep local screenshots, exported worksheets and preview logs out of Git.

The starting view shows six competitive candidate races and 22 measures. Category filters and “Show all 49 contests” retain access to the full original ballot. New candidate evidence is stored in each option’s `evidence` list; contest `office`, `decision` and `contextSources` fields provide plain-language introductions. The historical probability values are distinct from the newer research-check dates. See `docs/research-review-2026-10-27.md` for scope and remaining gaps.
