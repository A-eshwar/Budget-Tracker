import requests
import json
import time
from datetime import datetime

BASE_URL = "http://localhost:8081/api"

# Login to get token
def login():
    res = requests.post(f"{BASE_URL}/auth/signin", json={
        "username": "testuser_alerts",
        "password": "password"
    })
    
    if res.status_code != 200:
        # try registering
        requests.post(f"{BASE_URL}/auth/signup", json={
            "username": "testuser_alerts",
            "email": "testuser_alerts@demo.com",
            "password": "password"
        })
        res = requests.post(f"{BASE_URL}/auth/signin", json={
            "username": "testuser_alerts",
            "password": "password"
        })
    print("Login Response:", res.status_code)
    try:
        return res.json().get("token")
    except:
        return None

def test():
    token = login()
    if not token:
        print("Failed to login")
        return

    headers = {"Authorization": f"Bearer {token}"}

    print("\n--- 1. Set Budget ---")
    month = datetime.now().month
    year = datetime.now().year
    # Clean up old budgets just in case or just post
    budget = {
        "category": "Food",
        "amount": 1000,
        "month": month,
        "year": year
    }
    # Create or update budget
    res = requests.post(f"{BASE_URL}/budgets", json=budget, headers=headers)
    print("Budget setup:", res.status_code)

    print("\n--- 2. Add Income ---")
    res = requests.post(f"{BASE_URL}/transactions", json={
        "amount": 50000,
        "category": "Salary",
        "description": "Monthly Salary",
        "transactionDate": datetime.now().isoformat(),
        "type": "INCOME"
    }, headers=headers)
    print("Income added:", res.status_code)

    print("\n--- 3. Add Expense (Exceeding Budget) ---")
    res = requests.post(f"{BASE_URL}/transactions", json={
        "amount": 1500,  # > 1000 budget
        "category": "Food",
        "description": "Lunch with friends",
        "transactionDate": datetime.now().isoformat(),
        "type": "EXPENSE"
    }, headers=headers)
    print("Expense added:", res.status_code)

    print("\n--- 4. Check Alerts ---")
    res = requests.get(f"{BASE_URL}/alerts", headers=headers)
    print("Alerts:", res.status_code)
    try:
        # Avoid direct print of json if it contains unicode Windows can't handle
        print(json.dumps(res.json(), ensure_ascii=True))
    except Exception as e:
        print("Error parsing alerts json:", e)

    print("\n--- 5. Check AI Insights ---")
    # Wait for ML training trigger to not interfere
    time.sleep(2)
    res = requests.get(f"{BASE_URL}/insights", headers=headers)
    print("Insights Status:", res.status_code)
    try:
        data = res.json()
        print("Health Score:", data.get('healthScore'))
        print("Savings Efficiency:", data.get('savingsEfficiency'))
        print("Recommendations:", data.get('recommendations').encode('ascii', 'ignore').decode('ascii'))
    except Exception as e:
        print("Error parsing insights:", e)

if __name__ == "__main__":
    test()
