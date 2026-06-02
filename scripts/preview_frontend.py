import requests

urls = ['http://127.0.0.1:3000/', 'http://localhost:3000/']
for url in urls:
    try:
        r = requests.get(url, timeout=5)
        print('URL:', url)
        print('Status:', r.status_code)
        txt = r.text
        print('Length:', len(txt))
        snippet = txt[:800]
        print('\n--- HTML snippet ---\n')
        print(snippet)
        print('\n--- Search checks ---')
        print("contains '/shops/':", '/shops/' in txt)
        print("contains 'Local Shops':", 'Local Shops' in txt)
        print("contains 'Local Shops' (lower):", 'local shops' in txt.lower())
        break
    except Exception as e:
        print('Failed to fetch', url, e)
