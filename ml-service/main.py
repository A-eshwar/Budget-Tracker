from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
import pandas as pd
import numpy as np
import os
import sys
import importlib.util
from typing import List
from train_models import train_models

app = FastAPI(title="Smart AI Budget Tracker ML Service")

MODELS_DIR = "models"
models = {}
encoders = {}

def load_py_model(filename):
    path = os.path.join(MODELS_DIR, filename)
    if os.path.exists(path):
        spec = importlib.util.spec_from_file_location("model_module", path)
        mod = importlib.util.module_from_spec(spec)
        spec.loader.exec_module(mod)
        return mod.get_model()
    return None

def load_models():
    model_files = {
        "expense_predictor": "expense_predictor.py",
        "overspending_alert": "overspend_model.py",
        "anomaly_detector": "anomaly_detector.py",
        "health_score": "health_score_model.py",
        "savings_efficiency": "savings_efficiency_model.py",
        "recommendation": "recommendation_model.py"
    }
    for key, filename in model_files.items():
        models[key] = load_py_model(filename)
        if not models[key]:
             print(f"Warning: model file {filename} not found!")
             
    # Load Encoders
    encoders["le_occ"] = load_py_model("le_occ.py")
    encoders["le_city"] = load_py_model("le_city.py")
    encoders["le_cat"] = load_py_model("le_cat.py")

@app.on_event("startup")
async def startup_event():
    load_models()

class ExpenseRequest(BaseModel):
    user_id: int
    income: float = 0.0
    age: int = 30
    dependents: int = 0
    occupation: str = "Professional"
    city_tier: str = "Tier_2"
    category_name: str = "Food"

class AnomalyRequest(BaseModel):
    amount: float
    income: float = 0.0
    occupation: str = "Professional"
    category_name: str = "Food"
    age: int = 30

class HealthRequest(BaseModel):
    user_id: int
    income: float = 0.0
    age: int = 30
    dependents: int = 0
    rent: float = 0.0
    loan_repayment: float = 0.0
    insurance: float = 0.0
    groceries: float = 0.0
    transport: float = 0.0
    eating_out: float = 0.0
    entertainment: float = 0.0
    utilities: float = 0.0
    healthcare: float = 0.0

class SavingsRequest(BaseModel):
    income: float = 0.0
    desired_savings_percentage: float = 20.0
    rent: float = 0.0
    loan_repayment: float = 0.0
    insurance: float = 0.0
    total_expense: float = 0.0

class OverspendRequest(BaseModel):
    amount: float
    income: float = 0.0
    desired_savings_percentage: float = 20.0
    category_name: str = "Food"

# Utility to safely encode categories
def encode_cat(encoder_name, value, default=0):
    if encoder_name in encoders and encoders[encoder_name] is not None:
        try:
            return encoders[encoder_name].transform([value])[0]
        except ValueError:
             return default
    return default

@app.post("/predict-expense")
def predict_expense(req: ExpenseRequest):
    if not models.get("expense_predictor"):
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    occ_code = encode_cat("le_occ", req.occupation)
    city_code = encode_cat("le_city", req.city_tier)
    cat_code = encode_cat("le_cat", req.category_name)
    
    features = pd.DataFrame([[req.income, req.age, req.dependents, occ_code, city_code, cat_code]], 
                            columns=['Income', 'Age', 'Dependents', 'Occupation_Code', 'City_Tier_Code', 'Category_Code'])
    prediction = models["expense_predictor"].predict(features)[0]
    return {"predicted_expense": round(float(prediction), 2)}

@app.post("/detect-anomaly")
def detect_anomaly(req: AnomalyRequest):
    if not models.get("anomaly_detector"):
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    occ_code = encode_cat("le_occ", req.occupation)
    cat_code = encode_cat("le_cat", req.category_name)
    
    features = pd.DataFrame([[req.amount, req.income, occ_code, cat_code, req.age]], 
                            columns=['Amount', 'Income', 'Occupation_Code', 'Category_Code', 'Age'])
    prediction = models["anomaly_detector"].predict(features)[0]
    is_anomaly = bool(prediction == -1)
        
    return {"is_anomaly": is_anomaly}

@app.post("/health-score")
def health_score(req: HealthRequest):
    if not models.get("health_score"):
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.income, req.age, req.dependents, req.rent, req.loan_repayment, req.insurance, 
                              req.groceries, req.transport, req.eating_out, req.entertainment, req.utilities, req.healthcare]], 
                            columns=['Income', 'Age', 'Dependents', 'Rent', 'Loan_Repayment', 'Insurance', 
                                     'Groceries', 'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 'Healthcare'])
    prediction = models["health_score"].predict(features)[0]
    return {"health_score": round(float(prediction), 2)}

@app.post("/savings-efficiency")
def savings_efficiency(req: SavingsRequest):
    if not models.get("savings_efficiency"):
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    features = pd.DataFrame([[req.income, req.desired_savings_percentage, req.rent, req.loan_repayment, req.insurance, req.total_expense]], 
                            columns=['Income', 'Desired_Savings_Percentage', 'Rent', 'Loan_Repayment', 'Insurance', 'Total_Expense'])
    prediction = models["savings_efficiency"].predict(features)[0]
    return {"savings_efficiency": round(float(prediction), 2)}

@app.post("/recommendations")
def recommendations(req: ExpenseRequest):
    if not models.get("recommendation"):
        raise HTTPException(status_code=500, detail="Model not loaded")
        
    city_code = encode_cat("le_city", req.city_tier)
    cat_code = encode_cat("le_cat", req.category_name)
    
    features = pd.DataFrame([[req.income, req.age, req.dependents, city_code, cat_code]], 
                            columns=['Income', 'Age', 'Dependents', 'City_Tier_Code', 'Category_Code'])
    
    val = models["recommendation"].predict(features)[0]
    rec = f"Based on your profile, you could potentially save ₹{round(val, 2)} on {req.category_name} per month if optimized."
    return {"recommendation": rec}

@app.post("/overspending-alert")
def overspending_alert(req: OverspendRequest):
    if not models.get("overspending_alert"):
        raise HTTPException(status_code=500, detail="Model not loaded")
    
    cat_code = encode_cat("le_cat", req.category_name)
    budget = (req.income * (1 - req.desired_savings_percentage/100)) / 8.0 # Rough approx
    
    features = pd.DataFrame([[req.amount, budget, req.income, req.desired_savings_percentage, cat_code]], 
                            columns=['Amount', 'Budget', 'Income', 'Desired_Savings_Percentage', 'Category_Code'])
    
    prediction = models["overspending_alert"].predict(features)[0]
    return {"will_overspend": bool(prediction == 1)}

@app.post("/train")
def train(payload: dict = None):
    # Triggers full retraining using data.csv
    try:
        train_models()
        load_models()
        return {"status": "success", "message": "Successfully retrained ML models from data.csv and saved as .py files."}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
