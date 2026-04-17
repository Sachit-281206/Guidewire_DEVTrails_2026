# InsureGig

**AI-Powered Parametric Income Protection for Gig Workers**  
Guidewire DEVTrails 2026 - Final Submission (Phase 3)

---

# Overview

InsureGig is a fully automated parametric micro-insurance system designed to protect gig delivery workers from short-term income loss caused by environmental and social disruptions such as heavy rainfall, extreme heat, air pollution, flooding, and outages.

Unlike traditional insurance, InsureGig eliminates manual claims and enables real-time income protection using AI, automation, and fraud-aware validation.

---

# Problem Statement

Gig delivery workers earn based on active working hours. Their income is highly vulnerable to:

* Heavy rainfall and flooding
* Extreme heat
* Hazardous air quality
* Platform outages and operational disruptions

These disruptions reduce working hours and delivery opportunities, leading to immediate income loss.

### Core Challenges

1. No short-term income protection mechanism
2. Traditional insurance is not suited for flexible gig work patterns
3. Manual claims are slow, expensive, and inefficient
4. Measurable disruptions remain largely uninsured

---

# Solution

InsureGig introduces an AI-powered parametric insurance system that:

* Detects disruptions automatically
* Predicts risk using machine learning
* Calculates likely income loss
* Generates claims instantly
* Simulates instant payouts

No paperwork. No manual claims. Fully automated.

---

# End-to-End System Flow

```text
User registers -> activates policy -> starts shift
        ↓
System monitors environment continuously (mock API)
        ↓
Disruption detected automatically
        ↓
Fraud-aware validation and confidence scoring
        ↓
Claim generated (zero-touch)
        ↓
Payout calculated and credited
```

---

# 1. Registration and Worker Profile

The onboarding flow captures:

* Phone/email-based authentication
* Worker details (name, city, platform)
* Income details (daily earnings, average work hours)
* Identity data (Aadhaar, PAN)
* UPI ID for payouts
* Location permission for shift monitoring

---

# 2. Insurance Policy Management

* Weekly coverage model (7-day cycle)
* Activated by the user
* Valid only during active work sessions
* Tied to live monitoring for automated protection

---

# 3. Dynamic Premium Calculation

## ML Model

* Logistic Regression predicts disruption risk as `risk_score`

## Premium Formula

```text
Premium = (Expected Loss x (1 + Margin)) + Transaction Cost
```

## Expected Loss

```text
Expected Loss = effective_risk x effective_hours x hourly_income
```

## Features Used

* City risk
* Environmental risk (rain, heat, AQI)
* Worker income and work hours
* Season factor

This enables hyper-local dynamic pricing.

Note: the backend supports ML scoring through a service at `http://localhost:8000/predict`, and falls back to deterministic scoring if the ML API is unavailable.

---

# 4. Automated Disruption Detection

## Mock Environment API

```http
GET /api/environment/:city
```

### Sample Response

```json
{
  "city": "Chennai",
  "rainfall": 0.82,
  "temperature": 0.36,
  "aqi": 0.41,
  "timestamp": "2026-04-04T12:30:00Z",
  "source": "mock"
}
```

---

## Automated Trigger Engine

The backend monitoring engine runs every 10 to 15 seconds and:

* Fetches environment data
* Evaluates disruption conditions
* Detects the highest-priority active trigger
* Generates claims automatically for eligible workers

---

## Trigger Types

| Type | Condition |
| --- | --- |
| Rain | `rainfall > 0.7` |
| Heat | `temperature > 0.85` |
| AQI | `aqi > 0.8` |
| Flood | `rainfall > 0.8` and high city risk |
| Outage | simulated probability-based event |

Fully automated. No user action required.

---

# 5. Advanced Fraud Detection (Phase 3)

InsureGig implements a fraud-aware claim validation system to improve claim authenticity and payout confidence.

## Signals Used

* Confidence scoring from disruption-environment fit
* Repeated claim detection
* Abnormal claimed duration patterns
* Review-state tracking in the admin dashboard

## Confidence Score

```text
Range: 0.6 - 1.0
```

* HIGH -> full payout
* MEDIUM -> partial payout
* LOW -> flagged for review

## Example

```text
Strong rain signal + aligned trigger -> valid
Weak signal + repeated claims + abnormal duration -> suspicious
```

---

# 6. Zero-Touch Claims System

```text
Trigger detected
-> Validate active shift
-> Validate active policy
-> Apply confidence scoring
-> Generate claim automatically
-> Calculate payout
```

The user does not file a claim manually.

---

# 7. Instant Payout Simulation

## Formula

```text
Payout = Hourly Income x Lost Hours x Confidence
```

## Features

* Severity-based loss calculation
* Confidence-adjusted payout
* Risk-adjusted payout logic
* Daily-income payout cap
* Simulated instant credit flow

---

# 8. Intelligent Admin Dashboard (Phase 3)

A separate real-time control panel for insurers and operators.

## Features

### System Overview

* Total claims today
* Total payout amount
* Active policies
* Active worker sessions

### Claims Monitoring

* User name
* Disruption type
* Payout amount
* Confidence score
* Claim status
* Suspicious claim indicators

### Fraud Detection Panel

* Low-confidence claims
* Repeated claims by the same user
* Abnormal claim-duration patterns

### Payout Tracking

* Payout today
* Payout this week
* Average payout per claim
* Recent payout activity

### Risk and Predictive Insight

* Next-week risk level: HIGH / MEDIUM / LOW
* Key risk drivers
* High-risk zones
* Claim trend direction

The admin dashboard runs as a separate app from the user app on its own Vite dev server.

---

# AI Architecture

| Module | Model / Logic | Purpose |
| --- | --- | --- |
| Risk Prediction | Logistic Regression | Premium calculation |
| Premium Engine | Rule + ML | Dynamic pricing |
| Fraud Detection | Rule-based confidence and anomaly signals | Claim validation |
| Loss Estimation | Rule-based severity + ML-informed factors | Payout calculation |

---

# Coverage Exclusions

* Personal illness
* Vehicle issues
* Voluntary inactivity
* Offline sessions
* Network failures
* Fraudulent behavior

---

# Tech Stack

* Frontend: React + Tailwind CSS
* Admin Dashboard: React (separate interface)
* Backend: Node.js + Express
* Database: MongoDB
* AI: Python + Scikit-learn
* Data: Mock environment API and synthetic risk data

---

# Prototype Capabilities

* Registration and onboarding
* Policy activation
* AI-based premium calculation
* Automated triggers
* Zero-touch claims
* Fraud-aware validation
* Instant payout simulation
* Separate admin dashboard

---

# Demo Video

Add your final demo video link here.

---

# How to Run

## Prerequisites

* Node.js
* MongoDB running locally on `mongodb://localhost:27017/insuregig`
* Python environment for ML training or serving if needed

## Backend

```bash
cd backend
npm install
npm run dev
```

The backend runs on:

```text
http://localhost:5000
```

## User App

```bash
cd frontend
npm install
npm run dev
```

The user app usually runs on:

```text
http://localhost:5173
```

## Admin Dashboard

```bash
cd admin
npm install
npm run dev
```

The admin dashboard prefers:

```text
http://localhost:4174
```

If that port is already in use, Vite will automatically move it to the next free port.

## Optional ML Service

The backend already falls back safely if the ML API is unavailable, but if you want live ML scoring, run your prediction service on:

```text
http://localhost:8000/predict
```

You can also retrain the bundled model with:

```bash
python ml/train_model.py
```

---

# Conclusion

InsureGig transforms parametric insurance into a fully automated, intelligent income protection system tailored for gig workers.

It demonstrates:

* AI-driven pricing
* Automated disruption detection
* Fraud-aware validation
* Zero-touch claims
* Real-time payout simulation
* A separate insurer-facing admin control center
* Scalable insurance system design

---

**Built for Guidewire DEVTrails 2026**
