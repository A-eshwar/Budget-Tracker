import requests
import json
import time
import subprocess
import os

def test_ml_service():
    print("Testing ML Service...")
    base_url = "http://127.0.0.1:8000"
    
    # Wait for service to start (if we were running it)
    # For now, we'll just test the logic or assume it's running
    
    tests = [
        ("/predict-expense", {"user_id": 1, "month": 3, "category_id": 1}),
        ("/detect-anomaly", {"amount": 5000.0, "month": 3, "day_of_week": 1}),
        ("/health-score", {"user_id": 1, "amount": 1500.0}),
        ("/savings-efficiency", {"user_id": 1, "amount": 1500.0}),
        ("/recommendations", {"user_id": 1, "month": 3, "category_id": 1}),
        ("/overspending-alert", {"user_id": 1, "amount": 2500.0})
    ]
    
    for endpoint, data in tests:
        try:
            response = requests.post(f"{base_url}{endpoint}", json=data)
            print(f"Endpoint: {endpoint}")
            print(f"Status: {response.status_code}")
            print(f"Response: {response.json()}")
            print("-" * 20)
        except Exception as e:
            print(f"Error testing {endpoint}: {e}")

if __name__ == "__main__":
    test_ml_service()
