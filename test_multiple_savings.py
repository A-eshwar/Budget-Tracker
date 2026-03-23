import requests
import uuid

session = requests.Session()
username = f"test_sav_{uuid.uuid4().hex[:6]}"

# 1. Register
reg_resp = session.post("http://localhost:8081/api/auth/signup", json={
    "username": username,
    "email": f"{username}@demo.com",
    "password": "password"
})

# 2. Login
resp = session.post("http://localhost:8081/api/auth/signin", json={
    "username": username,
    "password": "password"
})
token = resp.json().get("token")
if not token:
    print("Login failed", resp.text)
    exit(1)

headers = {"Authorization": f"Bearer {token}"}

# 2.5 Add Income
inc_resp = session.post("http://localhost:8081/api/transactions", json={
    "amount": 5000,
    "category": "Salary",
    "description": "Salary",
    "transactionDate": "2026-03-01",
    "type": "INCOME"
}, headers=headers)

# 3. Create First Saving
s1_resp = session.post("http://localhost:8081/api/savings", json={
    "amount": 200,
    "month": 4,
    "year": 2026,
    "description": "Saving 1"
}, headers=headers)
s1_id = s1_resp.json().get("id")
print("Added Saving 1:", s1_resp.json())

# 4. Create Second Saving (Same month/year)
s2_resp = session.post("http://localhost:8081/api/savings", json={
    "amount": 300,
    "month": 4,
    "year": 2026,
    "description": "Saving 2"
}, headers=headers)
s2_id = s2_resp.json().get("id")
print("Added Saving 2:", s2_resp.json())

# 5. Get all savings
list_resp = session.get("http://localhost:8081/api/savings", headers=headers)
print("Total Savings Count:", len(list_resp.json()))

# 6. Delete Saving 1
del_resp = session.delete(f"http://localhost:8081/api/savings/{s1_id}", headers=headers)
print("Delete Saving 1 Status:", del_resp.status_code)

# 7. Get all savings after delete
final_resp = session.get("http://localhost:8081/api/savings", headers=headers)
print("Remaining Savings Count:", len(final_resp.json()))
for s in final_resp.json():
    print("Remains:", s)
