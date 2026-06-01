import urllib.request
import json

# Test creating user through API Gateway (port 3000) instead of directly to loan service
data = json.dumps({
    'name': 'ViaGateway',
    'email': 'viagateway@example.com',
    'password': 'gatewayPassword789'
}).encode()

req = urllib.request.Request(
    'http://localhost:3000/users',  # Using API Gateway
    data=data,
    headers={'Content-Type': 'application/json'},
    method='POST'
)

try:
    r = urllib.request.urlopen(req)
    print('✅ Success via API Gateway! Status:', r.status)
    response = json.loads(r.read().decode())
    print('User:', response['name'], '-', response['email'])
    print('Password Hashed:', response['password'][:30] + '...')
except Exception as e:
    print('❌ Error:', type(e).__name__, '-', str(e)[:100])
