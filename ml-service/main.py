from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import joblib
import pandas as pd
import numpy as np
import os
from typing import List
from train_models import train_models

app = FastAPI(title="Smart AI Budget Tracker ML Service")

# Load models
MODELS_DIR = "models"
models = {}

def load_models():
    model_files = {
        "expense_predictor": "expense_predictor.joblib",
        "overspending_alert": "overspend_model.joblib",
        "anomaly_detector": "anomaly_detector.joblib",
        "health_score": "health_score_model.joblib",
        "savings_efficiency": "savings_efficiency_model.joblib",
        "recommendation": "recommendation_model.joblib"
    }
    for key, filename in model_files.items():
        path = os.path.join(MODELS_DIR, filename)
        if os.path.exists(path):
            models[key] = joblib.load(path)
        else:
            print(f"Warning: model file {filename} not found!")

@app.on_event("startup")
async def startup_event():
    load_models()

class ExpenseRequest(BaseModel):
    user_id: int
    month: int
    category_id: int
    category_name: str = "this category"

class AnomalyRequest(BaseModel):
    amount: float
    month: int
    day_of_week: int

class HealthRequest(BaseModel):
    user_id: int
    amount: float

class TransactionData(BaseModel):
    user_id: int
    amount: float
    category: str
    date: str
    type: str # INCOME/EXPENSE
    month: int
    day_of_week: int

@app.post("/predict-expense")
async def predict_expense(req: ExpenseRequest):
    if "expense_predictor" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.user_id, req.month, req.category_id]], 
                            columns=['user_id', 'month', 'category_code'])
    prediction = models["expense_predictor"].predict(features)[0]
    return {"predicted_expense": round(float(prediction), 2)}

@app.post("/detect-anomaly")
async def detect_anomaly(req: AnomalyRequest):
    if "anomaly_detector" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.amount, req.month, req.day_of_week]], 
                            columns=['amount', 'month', 'day_of_week'])
    # IsolationForest returns -1 for anomalies and 1 for normal
    prediction = models["anomaly_detector"].predict(features)[0]
    return {"is_anomaly": bool(prediction == -1)}

@app.post("/health-score")
async def health_score(req: HealthRequest):
    if "health_score" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.user_id, req.amount]], columns=['user_id', 'amount'])
    prediction = models["health_score"].predict(features)[0]
    return {"health_score": round(float(prediction), 2)}

@app.post("/savings-efficiency")
async def savings_efficiency(req: HealthRequest):
    if "savings_efficiency" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.user_id, req.amount]], columns=['user_id', 'amount'])
    prediction = models["savings_efficiency"].predict(features)[0]
    return {"savings_efficiency": round(float(prediction), 2)}

@app.post("/recommendations")
async def recommendations(req: ExpenseRequest):
    if "recommendation" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.user_id, req.month, req.category_id]], 
                            columns=['user_id', 'month', 'category_code'])
    # In this demo, recommendation is a simple factor derived from predicted expense
    val = models["recommendation"].predict(features)[0]
    rec = f"You are likely to spend ₹{round(val, 2)} on {req.category_name}. Consider reducing it by 10% to save ₹{round(val*0.1, 2)}."
    return {"recommendation": rec}

@app.post("/overspending-alert")
async def overspending_alert(req: HealthRequest):
    if "overspending_alert" not in models:
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    # Needs user_id, month (dummy here), total_amount
    features = pd.DataFrame([[req.user_id, 3, req.amount]], columns=['user_id', 'month', 'amount'])
    prediction = models["overspending_alert"].predict(features)[0]
    return {"will_overspend": bool(prediction == 1)}

@app.post("/train")
async def train(transactions: List[TransactionData]):
    if not transactions:
        raise HTTPException(status_code=400, detail="No transactions provided")
    
    # Convert list of objects to DataFrame
    data = []
    for t in transactions:
        data.append({
            "user_id": t.user_id,
            "amount": t.amount,
            "category": t.category,
            "date": t.date,
            "type": t.type,
            "month": t.month,
            "day_of_week": t.day_of_week
        })
    df = pd.DataFrame(data)
    
    # Run training
    try:
        train_models(df)
        # Reload models after training
        load_models()
        return {"status": "success", "message": f"Trained on {len(transactions)} transactions"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
