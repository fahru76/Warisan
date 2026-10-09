"""Read-only smoke test of the built Warisan.net app against the live Supabase project.

Proves the browser build talks to live Supabase (not fixtures), that the verified-artisan
`artisans!inner` embed works through PostgREST, and that checkout gates anonymous visitors.
Never signs in and never writes data.
"""
import os, time, json, urllib.request
from playwright.sync_api import sync_playwright

base = os.environ.get('VITE_SUPABASE_URL', '')
key = os.environ.get('VITE_SUPABASE_ANON_KEY', '')
assert base and key, 'Missing VITE_SUPABASE_* configuration'
APP = 'http://127.0.0.1:4174'


def rest(path):
    req = urllib.request.Request(f'{base}/rest/v1/{path}', headers={'apikey': key})
    with urllib.request.urlopen(req, timeout=30) as response:
        return json.load(response)


# Anonymous REST reads go through RLS, which only exposes published rows of verified artisans.
items = rest('craft_items?select=id,name&is_published=eq.true&order=name')
workshops = rest('workshops?select=id,title&is_published=eq.true&order=title')
assert items, 'Live catalogue is empty'
print(f'live rows visible to anon: {len(items)} craft items, {len(workshops)} workshops')

for _ in range(30):
    try:
        urllib.request.urlopen(APP, timeout=2)
        break
    except Exception:
        time.sleep(1)
else:
    raise RuntimeError('Preview server did not start')

DEMO_TEXT = 'Showing demo data'
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 900}, locale='en-US')
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))

    def visit(path):
        page.goto(APP + path, wait_until='networkidle')
        assert page.get_by_text(DEMO_TEXT).count() == 0, f'{path} fell back to demo data'

    visit('/')
    for item in items:
        page.get_by_text(item['name'], exact=True).first.wait_for(timeout=30000)
    print(f'PASS home: all {len(items)} live items rendered via the verified-artisan join')

    visit(f"/crafts/{items[0]['id']}")
    page.get_by_role('heading', name=items[0]['name']).first.wait_for(timeout=30000)
    print('PASS craft detail rendered')

    visit(f"/checkout/{items[0]['id']}")
    page.get_by_text('Please sign in or create an account to check out.').first.wait_for(timeout=30000)
    assert page.get_by_role('button', name='Pay with FPX').is_disabled(), 'Pay button must be disabled for anonymous visitors'
    print('PASS checkout: anonymous visitor is asked to sign in and cannot pay')

    if workshops:
        visit('/workshops')
        page.get_by_text(workshops[0]['title'], exact=True).first.wait_for(timeout=30000)
        print('PASS workshops rendered')

    assert not errors, errors
    print('PASS: built Warisan.net rendered live Supabase data without JavaScript errors')
    browser.close()
