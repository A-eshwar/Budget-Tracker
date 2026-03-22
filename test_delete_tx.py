import requests
import uuid

session = requests.Session()
username = f"test_{uuid.uuid4().hex[:6]}"

# 1. Register
print(f"Registering as {username}...")
resp = session.post("http://localhost:8081/api/auth/signup", json={
    "username": username,
    "email": f"{username}@demo.com",
    "password": "password"
})

# 2. Login
print("Logging in...")
resp = session.post("http://localhost:8081/api/auth/signin", json={
    "username": username,
    "password": "password"
})
if resp.status_code != 200:
    print("Login failed:", resp.status_code, resp.text)
    exit(1)

jwt_token = resp.json().get("jwt")
headers = {
    "Authorization": f"Bearer {jwt_token}",
    "Content-Type": "application/json"
}

# 3. Create a transaction
print("Creating a transaction...")
resp = session.post("http://localhost:8081/api/transactions", headers=headers, json={
    "amount": 100,
    "category": "Food",
    "description": "Test delete target",
    "transactionDate": "2026-03-16",
    "type": "EXPENSE"
})

if resp.status_code != 200:
    print("Create failed:", resp.status_code, resp.text)
    exit(1)

tx_id = resp.json().get("id")
print("Successfully created transaction ID:", tx_id)

# 4. Try to delete it
print("Deleting transaction...")
resp = session.delete(f"http://localhost:8081/api/transactions/{tx_id}", headers=headers)
print("Delete Status:", resp.status_code)
if resp.status_code == 400:
    print("Delete Error Context:", resp.text)

# 5. Verify it is gone
resp = session.get("http://localhost:8081/api/transactions", headers=headers)
remaining = []
if resp.status_code == 200:
    remaining = [t["id"] for t in resp.json()]
print("Remaining transaction IDs:", remaining)
