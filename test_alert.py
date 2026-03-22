import requests
import datetime

base_url = "http://localhost:8081/api"

username = f"test_{int(datetime.datetime.now().timestamp())}"
# Login
login_res = requests.post(f"{base_url}/auth/signin", json={"username": username, "password": "password"})
if login_res.status_code != 200:
    print(f"Registering {username}")
    requests.post(f"{base_url}/auth/signup", json={"username": username, "password": "password", "email": f"{username}@example.com"})
    login_res = requests.post(f"{base_url}/auth/signin", json={"username": username, "password": "password"})

token = login_res.json().get("token")
if not token:
    print("Login failed:", login_res.json())
    exit(1)
headers = {"Authorization": f"Bearer {token}"}

# Create Budget for Month 3, 2026
budget_payload = {
    "category": "Food",
    "amount": 500.0,
    "month": 3,
    "year": 2026
}
requests.post(f"{base_url}/budgets", json=budget_payload, headers=headers)
print("Budget created/updated")

# Create Transaction
tx_payload = {
    "amount": 600.0,
    "category": "Food",
    "description": "Large Dinner",
    "transactionDate": "2026-03-20",
    "type": "EXPENSE"
}
tx_res = requests.post(f"{base_url}/transactions", json=tx_payload, headers=headers)
print("Transaction created:", tx_res.status_code)

# Get Alerts
alerts_res = requests.get(f"{base_url}/alerts/unread", headers=headers)
print("Unread Alerts:", alerts_res.json())
