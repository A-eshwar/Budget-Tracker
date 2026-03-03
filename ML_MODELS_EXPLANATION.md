# AI Smart Budget Tracker - ML Models Explanation

The AI Budget Tracker uses a suite of Machine Learning models to provide personalized financial insights. These models are built using Python with libraries like **Scikit-learn**, **XGBoost**, and **FastAPI**.

## 1. Expense Predictor
- **Algorithm**: Random Forest Regressor
- **Purpose**: Forecasts your spending for the next month based on historical trends.
- **How it works**: It analyzes your past transactions, grouping them by category and month. It learns the seasonality and typical spending volume to estimate future costs.

## 2. Financial Health Score
- **Algorithm**: Random Forest Regressor
- **Purpose**: Provides a metric from 0 to 100 representing your overall financial wellbeing.
- **How it works**: It calculates the ratio of your spending against a baseline. Lower spending relative to "ideal" thresholds results in a higher score.

## 3. Savings Efficiency
- **Algorithm**: Decision Tree Regressor
- **Purpose**: Measures how effectively you are saving money relative to your total income/spending.
- **How it works**: It compares your actual spending against a "savings potential" target (simulated as 3000 in this version).

## 4. Anomaly Detection
- **Algorithm**: Isolation Forest
- **Purpose**: Identifies unusual or suspicious transactions that deviate significantly from your normal behavior.
- **How it works**: It looks for "outliers"—transactions with amounts or frequencies that are mathematically distinct from your usual patterns.

## 5. Overspending Alert
- **Algorithm**: XGBoost Classifier
- **Purpose**: A binary classifier that predicts if you are likely to exceed your budget for the current month.
- **How it works**: It monitors your current spending pace and compares it against historical budget adherence.

## 6. Personalized Recommendations
- **Algorithm**: Random Forest (Regression-based)
- **Purpose**: Generates actionable advice on where to cut costs.
- **How it works**: It identifies the categories where you are predicted to spend the most and suggests a 10% reduction target.

---
> [!NOTE]
> For new users, these models reflect a **baseline state** until enough transaction data is collected to personalize the predictions.
