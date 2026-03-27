import asyncio
from main import load_models, ExpenseRequest, predict_expense

profiles = [
    {
        "name": "Profile 1: Young Single Worker",
        "payload": {
            "user_id": 1,
            "income": 45000,
            "age": 24,
            "dependents": 0,
            "occupation": "Professional",
            "city_tier": "Tier_1"
        }
    },
    {
        "name": "Profile 2: Middle-Aged Family Provider",
        "payload": {
            "user_id": 2,
            "income": 120000,
            "age": 45,
            "dependents": 3,
            "occupation": "Business",
            "city_tier": "Tier_2"
        }
    }
]

categories = ["Food", "Transport", "Entertainment"]

async def run_tests():
    print("\n[Loading Models natively from .py encoded files...]")
    load_models()
    print("\n=== AI DYNAMIC 'SAFE LIMIT' LOCAL TEST ===")

    for p in profiles:
        print(f"\n--- {p['name']} ---")
        print(f"Demographics: Age {p['payload']['age']}, Income {p['payload']['income']}, Dependents {p['payload']['dependents']}, City {p['payload']['city_tier']}")
        
        for cat in categories:
            req = ExpenseRequest(**p['payload'], category_name=cat)
            result = await predict_expense(req)
            pred = result["predicted_expense"]
            print(f" > AI Predicted Safe Limit for {cat}: ₹{pred:.2f}")

    print("\n")

if __name__ == "__main__":
    asyncio.run(run_tests())
