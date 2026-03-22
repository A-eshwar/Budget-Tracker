import requests

# Test anomaly detection
try:
    anomaly_resp = requests.post("http://localhost:8000/detect-anomaly", json={
        "amount": 25000.0,
        "month": 3,
        "day_of_week": 2
    })
    print("Anomaly Detection (25000):", anomaly_resp.json())
except Exception as e:
    print("Error during anomaly detection:", e)

# Test model training
try:
    train_data = [{
        "user_id": 1,
        "amount": 150.0,
        "category": "Food",
        "date": "2026-03-16",
        "type": "EXPENSE",
        "month": 3,
        "day_of_week": 1
    }]
    train_resp = requests.post("http://localhost:8000/train", json=train_data)
    print("Model Training:", train_resp.json())
except Exception as e:
    print("Error during model training:", e)
