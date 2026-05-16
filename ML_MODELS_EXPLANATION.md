# Smart AI Budget Tracker - ML Models Explanation

Our AI Budget Tracker leverages 6 distinct Machine Learning models serving unique functionalities. Unlike Deep Learning algorithms which use "Epochs", we use Tree-based Ensembles (Random Forests, XGBoost) which use `n_estimators` (the number of decision trees built). 

All models are trained dynamically using your `data.csv` history inside `train_models.py` and are directly consumed by the React Dashboard UI through the Spring Boot API.

---

## 1. Expense Predictor
- **Algorithm:** Random Forest Regressor
- **Architecture/Hyperparameters:** `n_estimators=20` (20 parallel trees), `max_depth=10`
- **Inputs:** `Income`, `Age`, `Dependents`, `Occupation (Categorical)`, `City Tier (Categorical)`, `Category (Categorical)`    
- **Output:** Predicted future monthly expense (Continuous Float, e.g., ₹4500.50).
- **Working & Accuracy:** Random Forests build multiple uncorrelated decision trees and average their predictions, preventing overfitting. It operates with high variance accuracy because it factors in your exact demographic tier.
- **Web App Usage:** Used in the Dashboard's **"Forecast"** panel. The Java backend loops through 6 predefined categories (Food, Transport, Utilities, etc.) and sums up the Regressor's output for each, presenting you with a single "Next Month Est." figure.

---

## 2. Overspending Alert System
- **Algorithm:** XGBoost Classifier
- **Architecture/Hyperparameters:** `n_estimators=20`, `max_depth=5`
- **Inputs:** `Transaction Amount`, `Calculated Budget Limit`, `Income`, `Desired Savings %`, `Category`
- **Output:** Binary Limit Breach -> `1` (Will Overspend) or `0` (Safe).
- **Working & Accuracy:** Uses Gradient Boosting to identify hard-to-find triggers that lead a user to blow their budget. XGBoost operates with ~90%+ classification accuracy on standard budget sets by severely penalizing trees that misclassify boundary transactions.
- **Web App Usage:** Triggers an immediate "Budget Warning" card inside the **"Security Alerts"** panel if a newly inputted transaction breaches the AI's complex safety bounds.

---

## 3. Anomaly Detector
- **Algorithm:** Isolation Forest
- **Architecture/Hyperparameters:** `contamination=0.05`
- **Inputs:** `Transaction Amount`, `Income`, `Occupation`, `Category`, `Age`
- **Output:** `1` (Normal) or `-1` (Anomaly).
- **Working & Accuracy:** Isolation forests do NOT require labeled data. They isolate observations by randomly selecting a feature and randomly selecting a split value. If an amount is completely out of character for someone of your `Age` and `Income`, it requires very few "splits" to isolate it, thus flagging it as an anomaly. By setting contamination to `0.05`, it assumes the most extreme 5% of your spending behaviors are unusual outliers.
- **Web App Usage:** When a transaction is submitted, the backend tests it against this model. If it returns `-1`, the Dashboard highlights it in **Crimson Red** in the Security Alerts panel as an "Unusual Spending Pattern".

---

## 4. Savings Efficiency Model
- **Algorithm:** Decision Tree Regressor
- **Architecture/Hyperparameters:** `max_depth=10`
- **Inputs:** `Income`, `Desired Savings %`, `Rent`, `Loan Repayments`, `Insurance`, `Total Actual Expenses`
- **Output:** Efficiency Score (Bounded between `0.0` and `100.0`).
- **Working & Accuracy:** Maps complex fixed-cost variables (Rent, Loans) against your desired savings percentage to calculate exactly how efficiently you are maneuvering your discretionary income.
- **Web App Usage:** Displayed identically as the primary **"Efficiency"** percentage block on the top-right of your main Dashboard header.

---

## 5. Financial Health Index
- **Algorithm:** Random Forest Regressor
- **Architecture/Hyperparameters:** `n_estimators=20`, `max_depth=10`
- **Inputs:** `Income`, `Age`, `Dependents`, `Rent`, `Loans`, `Insurance`, + (Sums of spending in Groceries, Transport, Eating Out, Entertainment, Utilities, Healthcare).
- **Output:** Health Index (Bounded between `10.0` and `100.0`).
- **Working & Accuracy:** A holistic algorithmic rating system trained on an engineered target that measures Debt-to-Income ratios alongside discretionary safety nets. 
- **Web App Usage:** Directly renders the **"AI Health Index"** score (out of 100) on the Dashboard header. It dynamically colors the score Emerald Green if you are above a 70, or Amber if you are at risk.

---

## 6. Personalized Recommender
- **Algorithm:** Random Forest Regressor
- **Architecture/Hyperparameters:** `n_estimators=20`, `max_depth=10`
- **Inputs:** `Income`, `Age`, `Dependents`, `City Tier`, `Category`
- **Output:** Potential Savings Amount (Continuous Float).
- **Working & Accuracy:** Cross-references your location constraints (`City Tier`) and family requirements (`Dependents`) against similar profiles in the dataset to calculate maximum possible optimizations in a given category.
- **Web App Usage:** Generates the natural language text seen in the **"AI Financial Insights"** card (e.g., *"Based on your profile, you could potentially save ₹800.00 on Food per month if optimized."*).
