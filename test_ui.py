import time
import uuid
from playwright.sync_api import sync_playwright

def run():
    username = f"pw_verify_{uuid.uuid4().hex[:6]}"
    email = f"{username}@demo.com"
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True, channel="msedge")
        page = browser.new_page()

        print(f"Navigating to app... Registering {username}")
        page.goto("http://localhost:5173/register")
        page.wait_for_selector('input[placeholder="Choose a username"]')
        
        page.fill('input[placeholder="Choose a username"]', username)
        page.fill('input[type="email"]', email)
        page.fill('input[type="password"]', 'password')
        page.click('button[type="submit"]')
        page.wait_for_timeout(3000)
        
        print("Logging in...")
        page.goto("http://localhost:5173/login")
        page.wait_for_selector('input[placeholder="Enter your username"]')
        page.fill('input[placeholder="Enter your username"]', username)
        page.fill('input[type="password"]', 'password')
        page.click('button[type="submit"]')
        page.wait_for_timeout(3000)

        if "setup-profile" in page.url:
            print("Setting up profile...")
            page.fill('input[type="number"]', '50000')
            page.click('button:has-text("Complete Setup")')
            page.wait_for_timeout(3000)

        print("Checking Dashboard...")
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(3000)

        print("Adding Budget...")
        page.goto("http://localhost:5173/budgets")
        page.wait_for_selector('input[type="number"]')
        page.locator('select').nth(1).select_option('Food')
        page.fill('input[type="number"]', '1000')
        page.click('button:has-text("Save Default Limit")')
        page.wait_for_timeout(3000)

        print("Adding Transactions...")
        page.goto("http://localhost:5173/transactions")
        page.wait_for_timeout(2000)
        
        # Add Income
        page.click('button:has-text("Add Transaction")')
        page.wait_for_selector('input[type="number"]')
        page.fill('input[type="number"]', '50000')
        page.select_option('select', 'Salary')
        page.click('button:has-text("Income")')
        page.fill('textarea', 'Test Income')
        page.click('button:has-text("Save Transaction")')
        page.wait_for_timeout(3000)

        # Add Expense
        page.click('button:has-text("Add Transaction")')
        page.wait_for_selector('input[type="number"]')
        page.fill('input[type="number"]', '1500')
        page.select_option('select', 'Food')
        page.click('button:has-text("Expense")')
        page.fill('textarea', 'Test Expense')
        page.click('button:has-text("Save Transaction")')
        page.wait_for_timeout(3000)

        print("Verifying Alerts on Dashboard...")
        page.goto("http://localhost:5173/")
        page.wait_for_timeout(5000)
        content = page.content()
        if "Budget exceeded" in content or "BUDGET_EXCEEDED" in content or "Anomaly" in content or "Unusual" in content or "exceeded your budget" in content:
            print("SUCCESS: Security Alerts detected on Dashboard.")
        else:
            print("WARNING: Security Alerts NOT found on Dashboard.")

        page.screenshot(path="dashboard_verification.png", full_page=True)
        print("Screenshot saved to dashboard_verification.png")

        browser.close()

if __name__ == "__main__":
    run()
