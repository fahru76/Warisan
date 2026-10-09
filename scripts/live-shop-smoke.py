import os, time, json, urllib.request
from playwright.sync_api import sync_playwright
base = os.environ['VITE_SUPABASE_URL']
key = os.environ['VITE_SUPABASE_ANON_KEY']
assert base and key, 'Missing VITE_SUPABASE_* configuration'
req = urllib.request.Request(base + '/rest/v1/craft_items?select=id,name&is_published=eq.true', headers={'apikey': key})
with urllib.request.urlopen(req, timeout=30) as response:
    items = json.load(response)
assert items, 'Live catalogue is empty'
for attempt in range(30):
    try:
        urllib.request.urlopen('http://127.0.0.1:4174', timeout=2)
        break
    except Exception:
        time.sleep(1)
else:
    raise RuntimeError('Preview server did not start')
with sync_playwright() as p:
    browser = p.chromium.launch()
    page = browser.new_page(viewport={'width': 1280, 'height': 900})
    errors = []
    page.on('pageerror', lambda error: errors.append(str(error)))
    page.goto('http://127.0.0.1:4174', wait_until='networkidle')
    page.get_by_text(items[0]['name'], exact=True).first.wait_for(timeout=30000)
    assert not errors, errors
    print('PASS: built Warisan.net rendered a live Supabase catalogue item without JavaScript errors')
    browser.close()
