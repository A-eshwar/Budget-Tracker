import pandas as pd
import numpy as np
from datetime import datetime, timedelta
import random
import os

def generate_synthetic_data(num_users=10, num_transactions=2000):
    categories = ['Food', 'Transport', 'Entertainment', 'Shopping', 'Utilities', 'Rent', 'Health', 'Salary']
    user_ids = range(1, num_users + 1)
    
    data = []
    start_date = datetime(2025, 1, 1)
    
    for _ in range(num_transactions):
        user_id = random.choice(user_ids)
        category = random.choice(categories)
        days_offset = random.randint(0, 365)
        date = start_date + timedelta(days=days_offset)
        
        # Base amount by category - Improved for realism
        if category == 'Rent':
            amount = random.uniform(15000, 30000)
        elif category == 'Salary':
            # Salary is high and monthly
            amount = random.uniform(40000, 80000)
        elif category == 'Utilities':
            amount = random.uniform(1000, 5000)
        elif category == 'Food':
            amount = random.uniform(200, 2000)
        elif category == 'Transport':
            amount = random.uniform(500, 3000)
        elif category == 'Shopping':
            amount = random.uniform(1000, 10000)
        else:
            amount = random.uniform(100, 1000)
            
        # Add some noise/anomalies (but not for salary)
        is_anomaly = 0
        if category != 'Salary' and random.random() < 0.03: # 3% chance of anomaly
            amount *= random.uniform(3, 5) # Smaller multiplier for more subtle anomalies
            is_anomaly = 1
            
        data.append({
            'user_id': user_id,
            'amount': round(amount, 2),
            'category': category,
            'date': date.strftime('%Y-%m-%d'),
            'month': date.month,
            'day_of_week': date.weekday(),
            'is_anomaly': is_anomaly
        })
        
    df = pd.DataFrame(data)
    
    # Save to CSV
    os.makedirs('data', exist_ok=True)
    df.to_csv('data/transactions.csv', index=False)
    print(f"Generated {len(df)} transactions and saved to data/transactions.csv")
    return df

if __name__ == "__main__":
    generate_synthetic_data()
