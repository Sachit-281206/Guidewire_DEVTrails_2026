const axios = require('axios');
const Claim = require('../models/Claim');
const { assessFraud } = require('./fraudService');
const { getCityRisk } = require('./premiumService');

const ML_URL = 'http://localhost:8000/predict';

const TRIGGER_LABELS = {
  RAIN: 'Rain',
  HEAT: 'Heat',
  AQI: 'AQI',
  FLOOD: 'Flood',
  OUTAGE: 'Outage',
};

const clamp = (value, min, max) => Math.min(Math.max(value, min), max);

const getStatus = (confidence) => {
  if (confidence > 0.8) return 'FULL';
  if (confidence >= 0.5) return 'PARTIAL';
  return 'REVIEW';
};

const calcSeverity = ({ rainfall = 0.5, temperature = 0.5, aqi = 0.5 }, triggerType = 'RAIN') => {
  const base = (rainfall * 0.45) + (aqi * 0.25) + (temperature * 0.2);
  const peak = Math.max(rainfall, temperature, aqi);
  const triggerMultiplier = {
    RAIN: 1.02,
    HEAT: 1.05,
    AQI: 1.04,
    FLOOD: 1.15,
    OUTAGE: 0.92,
  }[triggerType] || 1;

  const severity = clamp(Math.max(base, peak) * triggerMultiplier, 0, 1);
  return parseFloat(severity.toFixed(4));
};

const calcPayout = ({ severity, avgWorkHours, riskScore, confidence, dailyIncome, triggerType }) => {
  const safeHours = clamp(avgWorkHours || 8, 4, 14);
  const hourlyIncome = parseFloat(((dailyIncome || 800) / safeHours).toFixed(4));
  const triggerImpact = {
    RAIN: 0.95,
    HEAT: 0.9,
    AQI: 0.88,
    FLOOD: 1,
    OUTAGE: 0.75,
  }[triggerType] || 0.9;

  const lostHours = parseFloat((severity * safeHours * triggerImpact).toFixed(4));
  const riskFactor = parseFloat((0.75 + (riskScore * 0.25)).toFixed(4));
  const adjustedHours = parseFloat((lostHours * riskFactor).toFixed(4));
  const finalLossHours = parseFloat((adjustedHours * confidence).toFixed(4));
  const rawPayout = hourlyIncome * finalLossHours;
  const payout = Math.round(clamp(rawPayout, 0, dailyIncome || 800));

  return {
    payout,
    breakdown: {
      severity,
      lostHours: parseFloat(lostHours.toFixed(2)),
      riskFactor: parseFloat(riskFactor.toFixed(2)),
      adjustedHours: parseFloat(adjustedHours.toFixed(2)),
      confidence: parseFloat(confidence.toFixed(2)),
      finalLossHours: parseFloat(finalLossHours.toFixed(2)),
      hourlyIncome: parseFloat(hourlyIncome.toFixed(2)),
      triggerImpact,
    },
  };
};

const getRiskScore = async (user, envFactors) => {
  const cityRisk = getCityRisk(user.city || '');
  const season = new Date().getMonth() >= 5 && new Date().getMonth() <= 8 ? 1 : 0;
  const payload = {
    city_risk: cityRisk,
    rainfall: envFactors.rainfall,
    temperature: envFactors.temperature,
    aqi: envFactors.aqi,
    work_hours: user.avgWorkHours || 8,
    season,
  };

  try {
    const response = await axios.post(ML_URL, payload, { timeout: 5000 });
    const raw = parseFloat(response.data.risk);
    if (!Number.isNaN(raw) && raw >= 0 && raw <= 1) {
      return parseFloat(raw.toFixed(2));
    }
  } catch (error) {
    console.warn('[ClaimService] ML unreachable, using deterministic fallback risk:', error.message);
  }

  const fallback = clamp(
    (cityRisk * 0.35) +
    (envFactors.rainfall * 0.3) +
    (envFactors.temperature * 0.15) +
    (envFactors.aqi * 0.2),
    0.05,
    0.95,
  );
  return parseFloat(fallback.toFixed(2));
};

const normalizeTrigger = (triggerData) => {
  if (typeof triggerData === 'string') {
    return { type: triggerData.toUpperCase(), inputs: {} };
  }
  return {
    type: String(triggerData?.type || 'RAIN').toUpperCase(),
    inputs: triggerData?.inputs || {},
    cityRiskScore: triggerData?.cityRiskScore,
  };
};

const generateClaim = async (userId, user, triggerData, envData = null, options = {}) => {
  const trigger = normalizeTrigger(triggerData);
  const envFactors = envData
    ? {
        rainfall: envData.rainfall,
        temperature: envData.temperature,
        aqi: envData.aqi,
      }
    : {
        rainfall: trigger.type === 'RAIN' || trigger.type === 'FLOOD' ? 0.84 : 0.28,
        temperature: trigger.type === 'HEAT' ? 0.88 : 0.46,
        aqi: trigger.type === 'AQI' ? 0.86 : 0.42,
      };

  const riskScore = await getRiskScore(user, envFactors);
  const disruptionLabel = TRIGGER_LABELS[trigger.type] || trigger.type;
  const confidence = assessFraud(disruptionLabel, envFactors);
  const severity = calcSeverity(envFactors, trigger.type);
  const { payout, breakdown } = calcPayout({
    severity,
    avgWorkHours: user.avgWorkHours,
    riskScore,
    confidence,
    dailyIncome: user.dailyIncome,
    triggerType: trigger.type,
  });
  const status = getStatus(confidence);

  console.log('[ClaimService] Payout Calculated:', {
    trigger_type: trigger.type,
    disruption: disruptionLabel,
    severity,
    risk_score: riskScore,
    confidence_score: confidence,
    payout,
  });

  return Claim.create({
    userId,
    disruption: disruptionLabel,
    triggerType: trigger.type,
    lostHours: breakdown.lostHours,
    confidence,
    payout,
    status,
    breakdown: {
      ...breakdown,
      riskScore,
      cityRiskScore: trigger.cityRiskScore ?? getCityRisk(user.city || ''),
    },
    envFactors,
    source: options.source || 'automation',
  });
};

module.exports = { generateClaim };
