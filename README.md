# ?? InsureGig

**AI-Powered Parametric Income Protection for Food Delivery Workers**  
Guidewire DEVTrails 2026 — Phase 2 Submission

---

# ?? Phase 2: Automation & Protection

**Theme: Protect Your Worker**

InsureGig is a fully automated parametric micro-insurance prototype that protects gig delivery workers from **income loss due to real-world disruptions** such as rain, heat, pollution, and operational failures.

This Phase-2 implementation demonstrates a **working end-to-end system** with:

* Automated disruption detection
* AI-driven dynamic pricing
* Zero-touch claim processing
* Real-time payout simulation

---

# ?? Problem Understanding

India's food delivery ecosystem relies on millions of gig delivery partners operating through platforms such as Swiggy and Zomato. Their earnings are directly linked to completed deliveries and active outdoor working hours, making income highly vulnerable to sudden external disruptions.

Environmental events such as heavy rainfall, urban flooding, extreme heatwaves, and hazardous air pollution can reduce delivery productivity or temporarily halt operations. Similarly, civic disruptions such as unplanned curfews, local strikes, platform outages, or closure of key delivery zones can restrict access to pickup and drop locations.

These short-term disruptions often result in immediate loss of earning opportunities within a working shift, affecting weekly financial stability.

## Core Challenges

| # | Challenge |
| --- | --- |
| 1 | Lack of simple and accessible short-term income protection mechanisms |
| 2 | Traditional insurance products not aligned with flexible delivery-based earning patterns |
| 3 | Manual claim processes unsuitable for micro-duration income disruptions |
| 4 | Measurable environmental and social risks largely remain uninsured |

**Parametric Justification:** Parametric insurance is suitable in this context because disruption events such as weather severity or mobility restrictions are externally measurable, enabling automated low-cost claim settlement without manual verification delays.

**Objective:** Design an automated AI-enabled parametric protection platform that compensates delivery partners for verified disruption-induced income loss.

---

# ?? Solution Overview

InsureGig combines **parametric insurance + AI + automation** to:

* Detect disruptions automatically
* Estimate income loss
* Generate claims instantly
* Provide compensation without manual intervention

This platform is designed as an automated income protection layer for gig delivery workers, using measurable real-world triggers and explainable AI-based decisioning instead of paperwork-heavy traditional claims processing.

---

# ?? End-to-End System Flow

```text
User registers ? activates policy ? starts shift
        ?
System monitors environment continuously (mock API)
        ?
Disruption detected automatically
        ?
Claim generated (zero-touch)
        ?
Payout calculated and credited
```

---

# ?? 1. Registration Process

A structured onboarding flow captures:

* Phone-based authentication (OTP)
* Worker profile (name, city, platform)
* Work details (daily income, full/part-time)
* Identity verification (Aadhaar + PAN)
* UPI ID for payouts
* Location permission (shift-based tracking)

?? Output: Complete worker profile for risk and payout modeling

---

# ?? 2. Insurance Policy Management

* Weekly coverage model (7-day cycle)
* User can activate policy anytime
* Coverage valid only during active work sessions

---

# ?? 3. Dynamic Premium Calculation (AI Integration)

Premium is calculated using a **risk-aware actuarial model**.

## ?? ML Integration

* Logistic Regression predicts disruption probability (`risk_score`)

---

## ?? Premium Formula

```text
Premium = (Expected Loss × (1 + Margin)) + Transaction Cost
```

---

## ?? Expected Loss

```text
Expected Loss =
effective_risk × effective_hours × hourly_income
```

---

## ?? Key Factors

* ML risk score
* City risk profile (hyper-local)
* Season factor
* Worker income and exposure

---

## ?? Dynamic Pricing Behavior

* Safer zones ? lower premium
* High-risk zones ? higher premium
* Seasonal risk adjustments applied

?? Demonstrates **AI-driven dynamic pricing based on hyper-local risk**

---

# ?? 4. Automated Disruption Detection (CORE REQUIREMENT)

InsureGig implements **3–5 automated triggers** using a structured mock API.

---

## ?? Mock Environment API

```http
GET /api/environment/:city
```

### Sample Response:

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

## ? Automated Trigger Engine

Runs every 10–15 seconds:

* Fetches environment data
* Evaluates conditions
* Detects disruptions

---

## ?? Implemented Triggers

| Trigger            | Condition            |
| ------------------ | -------------------- |
| ??? Heavy Rain     | rainfall > 0.7       |
| ??? Extreme Heat   | temperature > 0.85   |
| ??? High AQI       | aqi > 0.8            |
| ?? Flood (Derived) | rainfall + city risk |
| ?? Platform Outage | simulated event      |

?? Fully automated — **no user interaction required**

---

# ? 5. Claims Management (Zero-Touch)

## ?? Key Principle:

```text
User does NOT file claims
```

---

## ?? Claim Flow

```text
Trigger detected
? Validate active shift + policy
? Generate claim automatically
? Calculate payout
? Store and display result
```

---

## ??? Validation

* Active shift required
* Active policy required
* Cooldown applied to prevent duplicate claims

---

# ?? 6. Automated Payout Calculation

## Formula:

```text
Payout = Hourly Income × Lost Hours × Confidence
```

---

## Logic:

* Lost hours derived from disruption severity
* Adjusted using ML risk score
* Validated using confidence score

---

## Constraints:

* Payout = daily income
* No payout without valid activity

---

# ?? 7. Seamless Zero-Touch User Experience

Users do NOT:

* File claims
* Submit proofs
* Click trigger buttons

---

## ?? What User Sees

* ?? “Monitoring environment…”
* ?? “Heavy Rain Detected”
* ? “Claim processed automatically”
* ?? “?420 credited”

?? Fully automated, frictionless experience

---

# ?? Coverage Exclusions

Not covered:

* Personal illness
* Vehicle issues
* Voluntary inactivity
* Offline periods (no shift)
* Network failures
* Fraudulent behavior

---

# ?? AI Architecture

| Module          | Model               | Purpose                |
| --------------- | ------------------- | ---------------------- |
| Risk Prediction | Logistic Regression | Disruption probability |
| Premium Engine  | Rule + ML           | Dynamic pricing        |
| Fraud Detection | Isolation Forest    | Activity validation    |

---

# ??? Tech Stack

* Frontend: React + Tailwind (mobile-first UI)
* Backend: Node.js + Express
* Database: MongoDB
* AI: Python (Scikit-learn)
* Data: Mock Environment API

---

# ?? Prototype Capabilities

? Registration flow  
? Policy activation  
? Dynamic premium calculation  
? Automated triggers  
? Zero-touch claims  
? Payout simulation

---

# How to Run

Backend:

```bash
cd backend
npm install
npm start
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

---

# ?? Conclusion

InsureGig transforms parametric insurance into a **fully automated, intelligent income protection system** for gig workers.

It demonstrates:

* AI-driven pricing
* Automated disruption detection
* Zero-touch claims
* Real-world system thinking

---

**Built for Guidewire DEVTrails 2026**
