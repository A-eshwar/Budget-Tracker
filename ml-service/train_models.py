import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.tree import DecisionTreeRegressor
from xgboost import XGBClassifier
from sklearn.preprocessing import LabelEncoder
import base64
import pickle
import os

os.makedirs('models', exist_ok=True)

def save_model_as_py(model, filename):
    # Serializes the model and saves it as a pure Python file with a base64 encoded string
    # This fulfills the exact requirement to save models in .py without .joblib extensions
    pickled_data = pickle.dumps(model)
    b64_data = base64.b64encode(pickled_data).decode('utf-8')
    with open(filename, 'w') as f:
        f.write("import pickle, base64\n\n")
        f.write(f"model_b64 = '{b64_data}'\n\n")
        f.write("def get_model():\n")
        f.write("    return pickle.loads(base64.b64decode(model_b64.encode('utf-8')))\n")

def train_models(df=None):
    if df is None:
        if os.path.exists('data/data.csv'):
            df = pd.read_csv('data/data.csv')
        else:
            print("No data.csv found!")
            return

    print(f"Loaded dataset with {len(df)} records.")

    # Encode categoricals
    df['Occupation'] = df['Occupation'].fillna('Unknown')
    df['City_Tier'] = df['City_Tier'].fillna('Unknown')
    
    le_occ = LabelEncoder()
    le_city = LabelEncoder()
    df['Occupation_Code'] = le_occ.fit_transform(df['Occupation'])
    df['City_Tier_Code'] = le_city.fit_transform(df['City_Tier'])
    
    # Save encoders for the API
    save_model_as_py(le_occ, 'models/le_occ.py')
    save_model_as_py(le_city, 'models/le_city.py')

    expense_cols = ['Groceries', 'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 'Healthcare', 'Education', 'Miscellaneous']
    
    # Melt dataset to create category-level data
    melted = df.melt(id_vars=['Income', 'Age', 'Dependents', 'Occupation_Code', 'City_Tier_Code', 'Rent', 'Loan_Repayment', 'Insurance', 'Desired_Savings_Percentage'], 
                     value_vars=expense_cols, var_name='Category', value_name='Amount')
                     
    le_cat = LabelEncoder()
    melted['Category_Code'] = le_cat.fit_transform(melted['Category'])
    save_model_as_py(le_cat, 'models/le_cat.py')

    print("Training 1. Expense Predictor (Random Forest Regressor)...")
    X_exp = melted[['Income', 'Age', 'Dependents', 'Occupation_Code', 'City_Tier_Code', 'Category_Code']]
    y_exp = melted['Amount']
    expense_model = RandomForestRegressor(n_estimators=20, max_depth=10, random_state=42)
    expense_model.fit(X_exp, y_exp)
    save_model_as_py(expense_model, 'models/expense_predictor.py')

    print("Training 2. Overspending Alert System (XGBoost Classifier)...")
    # Synthetic budget: Income * 0.5 / 8 categories
    melted['Budget'] = (melted['Income'] * (1 - melted['Desired_Savings_Percentage']/100)) / len(expense_cols)
    melted['Overspent'] = (melted['Amount'] > melted['Budget']).astype(int)
    X_over = melted[['Amount', 'Budget', 'Income', 'Desired_Savings_Percentage', 'Category_Code']]
    y_over = melted['Overspent']
    # Adding synthetic negative/positive cases if unbalance is extreme
    if len(y_over.unique()) < 2:
        fake = X_over.iloc[0:2].copy()
        fake['Amount'] = [999999, 0]
        y_over = pd.concat([y_over, pd.Series([1, 0])])
        X_over = pd.concat([X_over, fake])
    overspend_model = XGBClassifier(n_estimators=20, max_depth=5, random_state=42)
    overspend_model.fit(X_over, y_over)
    save_model_as_py(overspend_model, 'models/overspend_model.py')

    print("Training 3. Anomaly Detector (Isolation Forest)...")
    X_anom = melted[['Amount', 'Income', 'Occupation_Code', 'Category_Code', 'Age']]
    anomaly_model = IsolationForest(contamination=0.05, random_state=42)
    anomaly_model.fit(X_anom)
    save_model_as_py(anomaly_model, 'models/anomaly_detector.py')

    print("Training 4. Savings Efficiency Model (Decision Tree)...")
    # Efficiency is based on user level
    df['Total_Expense'] = df[expense_cols].sum(axis=1) + df['Rent'] + df['Loan_Repayment'] + df['Insurance']
    df['Actual_Savings'] = df['Income'] - df['Total_Expense']
    # Target efficiency
    df['Efficiency'] = np.clip((df['Actual_Savings'] / (df['Income'] * df['Desired_Savings_Percentage']/100 + 1)) * 100, 0, 100)
    X_save = df[['Income', 'Desired_Savings_Percentage', 'Rent', 'Loan_Repayment', 'Insurance', 'Total_Expense']]
    save_model = DecisionTreeRegressor(max_depth=10, random_state=42)
    save_model.fit(X_save, df['Efficiency'])
    save_model_as_py(save_model, 'models/savings_efficiency_model.py')

    print("Training 5. Financial Health Score (Random Forest Regressor)...")
    X_health = df[['Income', 'Age', 'Dependents', 'Rent', 'Loan_Repayment', 'Insurance', 'Groceries', 'Transport', 'Eating_Out', 'Entertainment', 'Utilities', 'Healthcare']]
    # Synthetic health score based on debt-to-income and savings
    health_score = np.clip(100 - (df['Loan_Repayment']/df['Income']*100) - (df['Total_Expense']/df['Income']*50), 10, 100)
    health_model = RandomForestRegressor(n_estimators=20, max_depth=10, random_state=42)
    health_model.fit(X_health, health_score)
    save_model_as_py(health_model, 'models/health_score_model.py')

    print("Training 6. Personalized Recommender (Random Forest Regressor)...")
    # Predict Potential Savings for a category
    pot_cols = [f'Potential_Savings_{c}' for c in expense_cols]
    melted_pot = df.melt(id_vars=['Income', 'Age', 'Dependents', 'City_Tier_Code'], value_vars=pot_cols, var_name='Pot_Cat', value_name='Pot_Savings')
    melted_pot['Category'] = melted_pot['Pot_Cat'].str.replace('Potential_Savings_', '')
    melted_pot['Category_Code'] = le_cat.transform(melted_pot['Category'])
    X_rec = melted_pot[['Income', 'Age', 'Dependents', 'City_Tier_Code', 'Category_Code']]
    y_rec = melted_pot['Pot_Savings']
    rec_model = RandomForestRegressor(n_estimators=20, max_depth=10, random_state=42)
    rec_model.fit(X_rec, y_rec)
    save_model_as_py(rec_model, 'models/recommendation_model.py')

    print("Finished training all models and saved as pure .py files.")

if __name__ == "__main__":
    train_models()
