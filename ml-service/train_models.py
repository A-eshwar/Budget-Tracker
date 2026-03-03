import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBClassifier
import joblib
import os

# Create models directory
os.makedirs('models', exist_ok=True)

def train_models(df=None):
    if df is None:
        if os.path.exists('data/transactions.csv'):
            df = pd.read_csv('data/transactions.csv')
        else:
            print("No data found for training.")
            return

    df['date'] = pd.to_datetime(df['date'])
    
    # Stable category mapping
    CATEGORIES = ['Food', 'Transportation', 'Shopping', 'Entertainment', 'Health', 'Bills', 'Education', 'Investment', 'Others', 'Salary']
    cat_map = {cat: i for i, cat in enumerate(CATEGORIES)}
    df['category_code'] = df['category'].map(lambda x: cat_map.get(x, 8)) # Default to 'Others'
    
    # 1. Expense Predictor (Next Month)
    # Simple feature engineering: aggregate by user, month, category
    monthly_expenses = df.groupby(['user_id', 'month', 'category'])['amount'].sum().reset_index()
    monthly_expenses['category_code'] = monthly_expenses['category'].map(lambda x: cat_map.get(x, 8))
    
    X = monthly_expenses[['user_id', 'month', 'category_code']]
    y = monthly_expenses['amount']
    
    expense_model = RandomForestRegressor(n_estimators=100)
    expense_model.fit(X, y)
    joblib.dump(expense_model, 'models/expense_predictor.joblib')
    print("Trained Expense Predictor")

    # 2. Overspending Alert (XGBoost)
    # Target: Will exceed budget? (Synthesize a budget for training)
    # Important: Only count expenses, not income (Salary)
    expenses_df = df[df['category'] != 'Salary']
    if expenses_df.empty:
        print("No expenses found for overspending model.")
    else:
        monthly_total = expenses_df.groupby(['user_id', 'month'])['amount'].sum().reset_index()
        monthly_total['budget'] = 40000 
        monthly_total['overspent'] = (monthly_total['amount'] > monthly_total['budget']).astype(int)
        
        if len(monthly_total['overspent'].unique()) < 2:
            print("Warning: Only one class in overspent data. Adding synthetic contrast.")
            # Create a fake entry to satisfy binary classification if needed
            fake_entry = monthly_total.iloc[0].copy()
            fake_entry['overspent'] = 1 - fake_entry['overspent']
            monthly_total = pd.concat([monthly_total, pd.DataFrame([fake_entry])], ignore_index=True)

        X_over = monthly_total[['user_id', 'month', 'amount']]
        y_over = monthly_total['overspent']
        
        overspend_model = XGBClassifier()
        overspend_model.fit(X_over, y_over)
        joblib.dump(overspend_model, 'models/overspend_model.joblib')
        print("Trained Overspending Alert Model")

    # 3. Anomaly Detection (Isolation Forest)
    X_anomaly = df[['amount', 'month', 'day_of_week']]
    anomaly_model = IsolationForest(contamination=0.03)
    anomaly_model.fit(X_anomaly)
    joblib.dump(anomaly_model, 'models/anomaly_detector.joblib')
    print("Trained Anomaly Detector")

    # 4. Financial Health Score
    if not expenses_df.empty:
        monthly_total = expenses_df.groupby(['user_id', 'month'])['amount'].sum().reset_index()
        X_health = monthly_total[['user_id', 'amount']]
        y_health = np.clip(100 - (monthly_total['amount'] / 600), 0, 100)
        
        health_model = RandomForestRegressor()
        health_model.fit(X_health, y_health)
        joblib.dump(health_model, 'models/health_score_model.joblib')
        print("Trained Financial Health Score Model")

        # 5. Savings Efficiency
        y_savings = np.clip((60000 - monthly_total['amount']) / 600, 0, 100)
        savings_model = DecisionTreeRegressor()
        savings_model.fit(X_health, y_savings)
        joblib.dump(savings_model, 'models/savings_efficiency_model.joblib')
        print("Trained Savings Efficiency Model")

    # 6. Personalized Recommendation
    recommendation_model = RandomForestRegressor()
    recommendation_model.fit(X, y)
    joblib.dump(recommendation_model, 'models/recommendation_model.joblib')
    print("Trained Personalized Recommendation Model")

if __name__ == "__main__":
    train_models()
