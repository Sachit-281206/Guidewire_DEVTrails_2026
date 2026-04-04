import pandas as pd
import random

data = []

for _ in range(1000):
    city_risk = round(random.uniform(0.3, 0.9), 2)
    rainfall = round(random.uniform(0, 1), 2)
    temperature = round(random.uniform(0, 1), 2)
    aqi = round(random.uniform(0, 1), 2)
    work_hours = round(random.uniform(4, 12), 2)
    season = random.choice([0, 1])  # 0 = normal, 1 = monsoon

    # disruption logic (synthetic truth)
    if rainfall > 0.7 or aqi > 0.8 or temperature > 0.85:
        disruption = 1
    else:
        disruption = 0

    data.append([
        city_risk,
        rainfall,
        temperature,
        aqi,
        work_hours,
        season,
        disruption
    ])

df = pd.DataFrame(data, columns=[
    "city_risk",
    "rainfall",
    "temperature",
    "aqi",
    "work_hours",
    "season",
    "disruption"
])

df.to_csv("ml/data/synthetic_data.csv", index=False)

print("✅ Synthetic dataset generated: ml/data/synthetic_data.csv")