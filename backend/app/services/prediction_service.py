import datetime
from sqlalchemy.orm import Session
from .. import models

def forecast_profit(db: Session, forecast_days: int = 7):
    # Fetch profit history sorted by date
    history = db.query(models.ProfitSummary).order_by(models.ProfitSummary.date.asc()).all()
    
    # Fallback if there is insufficient historical data
    if len(history) < 2:
        last_profit = history[0].profit if len(history) == 1 else 0.0
        predictions = []
        today = datetime.date.today()
        for i in range(1, forecast_days + 1):
            next_date = today + datetime.timedelta(days=i)
            predictions.append({
                "date": next_date.strftime("%Y-%m-%d"),
                "profit": float(last_profit)
            })
        return predictions

    # Linear Regression: y = m * x + c
    N = len(history)
    X = list(range(N))
    Y = [h.profit for h in history]

    sum_x = sum(X)
    sum_y = sum(Y)
    sum_xx = sum(x * x for x in X)
    sum_xy = sum(x * y for x, y in zip(X, Y))

    denominator = (N * sum_xx) - (sum_x * sum_x)
    if denominator == 0:
        m = 0.0
    else:
        m = ((N * sum_xy) - (sum_x * sum_y)) / denominator
    
    c = (sum_y - (m * sum_x)) / N

    predictions = []
    last_date = history[-1].date
    for i in range(1, forecast_days + 1):
        next_date = last_date + datetime.timedelta(days=i)
        predicted_val = (m * (N - 1 + i)) + c
        predictions.append({
            "date": next_date.strftime("%Y-%m-%d"),
            "profit": max(0.0, float(round(predicted_val, 2)))  # Avoid negative forecast predictions
        })
    return predictions
