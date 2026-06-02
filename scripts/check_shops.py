import requests

base='http://127.0.0.1:8000'
try:
    o=requests.get(base+'/openapi.json', timeout=5)
    print('openapi', o.status_code)
    paths = o.json().get('paths', {})
    for p in sorted(paths):
        if '/shops' in p:
            print('PATH:', p, '->', list(paths[p].keys()))
except Exception as e:
    print('ERR openapi', e)

shop_id='99a53f63-d026-4420-a41c-71ed209e329e'
for path in [f'/api/shops', f'/api/shops/{shop_id}', f'/api/shops/{shop_id}/products', f'/api/shops/{shop_id}/categories']:
    try:
        r=requests.get(base+path, timeout=5)
        print(path, r.status_code)
        try:
            print(r.json())
        except Exception:
            print(r.text[:200])
    except Exception as e:
        print('ERR', path, e)
