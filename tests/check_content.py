"""Validate research structure and publication boundaries without network access."""
import json
from pathlib import Path
from html.parser import HTMLParser

ROOT = Path(__file__).resolve().parents[1]
data = json.loads((ROOT / 'content/ballot.json').read_text())
ids = set()
for row in data['rows']:
    assert row['id'] not in ids, f"Duplicate ID: {row['id']}"
    ids.add(row['id'])
    assert row['options'] and 1 <= row['seats'] <= len(row['options'])
    for key in row['sources']:
        assert key in data['sources'], f"Missing source: {key}"
    for option in row['options']:
        assert option['name'] and option['description'] and option['why']
        assert option['prob'] is None or 0 <= option['prob'] <= 100
        if option.get('range'):
            lo, hi = option['range']
            assert 0 <= lo <= hi <= 100
for title, url in data['sources'].values():
    assert title and url.startswith('https://')

class PublicationCheck(HTMLParser):
    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == 'a' and attrs.get('target') == '_blank':
            assert 'noopener' in attrs.get('rel', '')
        if tag in ('link', 'script'):
            path = attrs.get('href') or attrs.get('src')
            if path and not path.startswith(('https:', 'http:', 'data:')):
                assert (ROOT / path).is_file(), path

index = (ROOT / 'index.html').read_text()
assert '<script id="saved-state" type="application/json">{}</script>' in index
for file in ('index.html', 'content/research.html'):
    PublicationCheck().feed((ROOT / file).read_text())
print(f"PASS: {len(ids)} contests, {sum(len(r['options']) for r in data['rows'])} options, {len(data['sources'])} shared sources; publication checks")
