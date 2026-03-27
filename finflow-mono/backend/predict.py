# -*- coding: utf-8 -*-
import requests
import numpy as np
from sklearn.linear_model import LinearRegression
from collections import defaultdict
from datetime import datetime

API = "http://localhost:5000"

def fetch_expenses():
    res = requests.get(f"{API}/expenses")
    return res.json()

def group_by_month_category(expenses):
    data = defaultdict(lambda: defaultdict(float))
    for e in expenses:
        date = datetime.fromisoformat(e["date"].replace("Z", "+00:00"))
        month_key = date.strftime("%Y-%m")
        category = e["category"].lower()
        data[month_key][category] += e["amount"]
    return data

def predict_next_month(monthly_data):
    months = sorted(monthly_data.keys())
    if len(months) < 2:
        print("Not enough data - need at least 2 months.")
        return

    all_categories = set()
    for m in months:
        all_categories.update(monthly_data[m].keys())

    last = datetime.strptime(months[-1], "%Y-%m")
    if last.month == 12:
        next_month = f"{last.year + 1}-01"
    else:
        next_month = f"{last.year}-{last.month + 1:02d}"

    print("")
    print("=" * 50)
    print("  FINFLOW - ML SPEND PREDICTIONS")
    print(f"  Predicting for: {next_month}")
    print(f"  Trained on: {', '.join(months)}")
    print("=" * 50)
    print("")

    X = np.array(range(len(months))).reshape(-1, 1)
    next_X = np.array([[len(months)]])

    total_predicted = 0
    results = []

    for cat in sorted(all_categories):
        y = np.array([monthly_data[m].get(cat, 0) for m in months])
        if sum(y) == 0:
            continue
        model = LinearRegression()
        model.fit(X, y)
        predicted = max(0, model.predict(next_X)[0])
        total_predicted += predicted
        trend = model.coef_[0]
        if trend > 50:
            direction = "increasing"
        elif trend < -50:
            direction = "decreasing"
        else:
            direction = "stable"
        results.append((cat, predicted, trend, direction, y))

    results.sort(key=lambda x: x[1], reverse=True)

    for cat, predicted, trend, direction, history in results:
        history_str = "  ".join([f"{months[i]}: Rs.{int(history[i])}" for i in range(len(months))])
        print(f"  {cat.upper():<15} Rs.{int(predicted):<8}  ({direction})")
        print(f"  {'':15} History: {history_str}")
        print("")

    past_totals = [sum(monthly_data[m].values()) for m in months]
    avg_past = sum(past_totals) / len(past_totals)
    diff = total_predicted - avg_past
    diff_pct = (diff / avg_past) * 100
    arrow = "UP" if diff > 0 else "DOWN"
    print("=" * 50)
    print(f"  TOTAL PREDICTED:  Rs.{int(total_predicted)}")
    print(f"  VS PAST AVG:      Rs.{int(avg_past)}  ({arrow} {abs(diff_pct):.1f}%)")
    print("=" * 50)
    print("")

if __name__ == "__main__":
    print("Fetching expense data...")
    expenses = fetch_expenses()
    print(f"Loaded {len(expenses)} expenses.")
    monthly_data = group_by_month_category(expenses)
    predict_next_month(monthly_data)