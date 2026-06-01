import urllib.request
import json

data = json.dumps({
    'name': 'AnotherUser',
    'email': 'another@example.com',
    'password': 'mySecurePassword456'
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
    response = json.loads(r.read().decode())
    print('User Name:', response['name'])
    print('User Email:', response['email'])
    print('Password Hash (first 20 chars):', response['password'][:20], '...')
    print('Full Response:', json.dumps(response, indent=2))
except Exception as e:
    print('Error:', e)
