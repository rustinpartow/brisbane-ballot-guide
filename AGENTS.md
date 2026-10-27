# Brisbane ballot guide

This is a static independent voter guide for Brisbane, California's November 2026 election. Preserve the existing paper/green/blue visual style and all research, citations, profiles, forecast caveats and worksheet behavior. No framework or build pipeline is needed.

Read README.md for file responsibilities and preview commands. Research belongs in `content/ballot.json` and `content/research.html`; page-level methodology, election instructions and visible checked dates are in `index.html`. Do not change forecasts as a side effect of a refactor.

## Updating research

Check primary sources for ballot eligibility, certified rosters, measure text and voting instructions. Distinguish official records, campaign claims, analyst judgment and missing evidence. Preserve source URLs, explain material changes and date the review. Never present subjective sensitivity ranges as statistical confidence intervals. Multi-seat win probabilities describe inclusion among winners and may sum above 100%.

Keep shared citations in the JSON sources map and reference their keys from contests. Expanded profile citations remain next to their claims in research.html. Update profile odds and ballot odds together when a forecast changes. Update JSON metadata and the relevant visible source-check dates; do not claim all research was refreshed when only one section was checked.

Contest IDs and candidate option indexes are persistence identifiers. Do not rename IDs or reorder/delete options without a deliberate browser-state migration. Preserve the `brisbane-ballot-2026-v1` storage key unless implementing such a migration. Never commit personal saved-state data, worksheet exports or private notes. The site's embedded saved-state must stay empty.

## Validation and publishing

Run `python3 tests/check_content.py` and `node --check assets/app.js`. Start the HTTP preview described in README.md and verify the affected journey, including reload persistence. Check small phone widths, keyboard focus, all filters and source links. Test HTML download as an actual offline file: it must embed CSS, research, data, runtime, notes, selections and order, and remain downloadable again. Check print preview when changing styles.

GitHub Pages deploys the root of main on push. Keep paths relative so the site works under a repository URL. After pushing, verify the deployed revision and actual hosted behavior. Distinguish local checks from live deployment evidence. Publish only the intended website files; never include machine-specific credentials or unrelated projects.
