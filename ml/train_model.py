import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.linear_model import LogisticRegression
import joblib
import os

# Load dataset
df = pd.read_csv("ml/data/synthetic_data.csv")

X = df.drop("disruption", axis=1)
y = df["disruption"]

# Split data
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42
)

# Train model
model = LogisticRegression(max_iter=1000)
model.fit(X_train, y_train)

# Evaluate
accuracy = model.score(X_test, y_test)
print(f"✅ Model Accuracy: {accuracy:.2f}")

# Ensure models folder exists
os.makedirs("ml/models", exist_ok=True)

# Save model
joblib.dump(model, "ml/models/risk_model.pkl")

print("✅ Model saved: ml/models/risk_model.pkl")