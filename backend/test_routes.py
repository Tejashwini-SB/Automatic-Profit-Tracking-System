import urllib.request, urllib.parse, json, sys

BASE = 'http://127.0.0.1:8000'

def request(method, path, data=None, token=None, form=False):
    url = BASE + path
    headers = {'Content-Type': 'application/json'}
    if form:
        headers['Content-Type'] = 'application/x-www-form-urlencoded'
        body = urllib.parse.urlencode(data).encode()
    elif data:
        body = json.dumps(data).encode()
    else:
        body = None
    if token:
        headers['Authorization'] = 'Bearer ' + token
    req = urllib.request.Request(url, data=body, headers=headers, method=method)
    try:
        with urllib.request.urlopen(req) as r:
            return r.status, json.loads(r.read())
    except urllib.error.HTTPError as e:
        return e.code, json.loads(e.read())

# 1. Root
s, r = request('GET', '/')
print('[1] GET /  =>', s, r)

# 2. Register
s, r = request('POST', '/auth/register', {'email': 'test@profit.com', 'password': 'Test1234!'})
print('[2] POST /auth/register =>', s, r)

# 3. Login
s, r = request('POST', '/auth/login', {'username': 'test@profit.com', 'password': 'Test1234!'}, form=True)
print('[3] POST /auth/login =>', s)
token = r.get('access_token')

# 4. Add Purchase (adds product + records purchase)
s, r = request('POST', '/purchase', {'name': 'Rice', 'quantity': 100, 'cost_price': 50.0, 'selling_price': 70.0}, token=token)
print('[4] POST /purchase =>', s, r)

# 5. Add Sale
s, r = request('POST', '/sale', {'product_name': 'Rice', 'quantity': 10, 'total_sale': 700.0}, token=token)
print('[5] POST /sale =>', s, r)

# 6. Total Profit
s, r = request('GET', '/total-profit', token=token)
print('[6] GET /total-profit =>', s, r)

# 7. Export Report
req = urllib.request.Request(BASE + '/export-report', headers={'Authorization': 'Bearer ' + token})
with urllib.request.urlopen(req) as resp:
    ct = resp.headers['Content-Type']
    print('[7] GET /export-report =>', resp.status, 'Content-Type:', ct)

print('')
print('ALL ROUTES OK')
