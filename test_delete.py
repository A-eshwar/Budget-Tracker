import requests
import json
import uuid

session = requests.Session()
username = f"del_{uuid.uuid4().hex[:6]}"

# 1. Register
reg_resp = session.post("http://localhost:8081/api/auth/signup", json={
    "username": username,
    "email": f"{username}@demo.com",
    "password": "password"
})

# 2. Login to get token
resp = session.post("http://localhost:8081/api/auth/login", json={
    "username": username,
    "password": "password"
})

data = resp.json()
token = data.get("token")
if not token:
    print("Failed to login", data)
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 3. Add transaction
trans_data = {
    "amount": 555,
    "category": "Food",
    "description": "Delete me test",
    "transactionDate": "2026-03-15",
    "type": "EXPENSE"
}

resp = session.post("http://localhost:8081/api/transactions", json=trans_data, headers=headers)
j = resp.json()
print("Created:", j)
trans_id = j.get("id")

if not trans_id:
    print("Failed to create", j)
    exit(1)

# 4. Delete transaction
print("Deleting:", trans_id)
resp = session.delete(f"http://localhost:8081/api/transactions/{trans_id}", headers=headers)
print("Delete status:", resp.status_code, resp.text)

# 5. Verify it's gone
resp = session.get("http://localhost:8081/api/transactions", headers=headers)
transactions = resp.json()
found = any(t.get("id") == trans_id for t in transactions)
print("Is it still there?", found)
