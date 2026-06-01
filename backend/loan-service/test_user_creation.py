import urllib.request
import json

data = json.dumps({
    'name': 'TestUser',
    'email': 'testpass@example.com',
    'password': 'password123'
}).encode()

req = urllib.request.Request(
    'http://localhost:3001/users',
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    r = urllib.request.urlopen(req)
    print('Success! Status:', r.status)
    print('Response:', r.read().decode())
except Exception as e:
    print('Error:', e)
