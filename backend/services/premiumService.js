const axios = require('axios');
const { getEnvironment } = require('./environmentService');

const ML_URL = 'http://localhost:8000/predict';
const MARGIN_RATE = 0.2;
const TRANSACTION_COST = 2;
const DEFAULT_RISK = 0.2;
const DISRUPTION_FREQ = 0.8;

const CITY_RISK = {
  mumbai: 0.8,
  delhi: 0.75,
  bangalore: 0.5,
  chennai: 0.7,
  hyderabad: 0.6,
  kolkata: 0.75,
  pune: 0.55,
  ahmedabad: 0.65,
  jaipur: 0.6,
  surat: 0.6,
};

const getCityRisk = (city = '') => {
  const score = CITY_RISK[city.toLowerCase().trim()];
  if (!score) {
    console.warn(`[PremiumService] Unknown city "${city}", using default 0.6`);
  }
  return score || 0.6;
};

const getSeasonFactor = () => {
  const month = new Date().getMonth();
  if (month >= 5 && month <= 8) return { factor: 1.2, label: 'Monsoon' };
  if (month >= 2 && month <= 4) return { factor: 1.1, label: 'Summer' };
  return { factor: 1, label: 'Normal' };
};

const getWorkHours = (shift, avgWorkHours = 8) => {
  if (shift?.startTime) {
    const elapsed = (Date.now() - new Date(shift.startTime).getTime()) / (1000 * 60 * 60);
    return Math.min(Math.max(parseFloat(elapsed.toFixed(2)), 4), 12);
  }
  return Math.min(Math.max(avgWorkHours, 4), 12);
};

const getRiskLevel = (score) => {
  if (score >= 0.3) return 'HIGH';
  if (score >= 0.15) return 'MEDIUM';
  return 'LOW';
};

const computePremium = ({ riskScore, cityRisk, seasonFactor, avgWorkHours, hourlyIncome }) => {
  const clampedRisk = Math.min(Math.max(riskScore, 0.05), 0.4);
  const blended = clampedRisk * (0.5 + (0.5 * cityRisk));
  const effectiveRisk = parseFloat(Math.min(blended * seasonFactor, 0.5).toFixed(4));
  const effectiveHours = parseFloat((avgWorkHours * 0.25 * DISRUPTION_FREQ).toFixed(4));
  const expectedLoss = parseFloat((effectiveRisk * effectiveHours * hourlyIncome).toFixed(2));
  const marginAdded = parseFloat((expectedLoss * MARGIN_RATE).toFixed(2));
  const premium = Math.round((expectedLoss * (1 + MARGIN_RATE)) + TRANSACTION_COST);

  return {
    premium,
    breakdown: {
      expectedLoss,
      effectiveRisk: parseFloat(effectiveRisk.toFixed(3)),
      effectiveHours,
      marginAdded,
      transactionCost: TRANSACTION_COST,
    },
  };
};

const calculatePremium = async (city = '', shift = null, user = {}, options = {}) => {
  const cityRisk = getCityRisk(city);
  const { factor: seasonFactor, label: seasonLabel } = getSeasonFactor();
  const environment = options.environment || shift?.lastEnvironment || await getEnvironment(city);
  const workHours = getWorkHours(shift, user.avgWorkHours);
  const hourlyIncome = user.hourlyIncome
    || (user.dailyIncome ? parseFloat((user.dailyIncome / workHours).toFixed(2)) : 100);

  const mlPayload = {
    city_risk: cityRisk,
    rainfall: environment.rainfall,
    temperature: environment.temperature,
    aqi: environment.aqi,
    work_hours: workHours,
    season: seasonFactor >= 1.2 ? 1 : 0,
  };

  let riskScore = DEFAULT_RISK;
  let source = 'fallback';

  try {
    const response = await axios.post(ML_URL, mlPayload, { timeout: 5000 });
    const raw = parseFloat(response.data.risk);
    if (!Number.isNaN(raw) && raw >= 0 && raw <= 1) {
      riskScore = parseFloat(raw.toFixed(2));
      source = 'ml';
    } else {
      console.warn('[PremiumService] ML returned invalid value, using fallback risk');
    }
  } catch (error) {
    console.warn('[PremiumService] ML unreachable, using fallback risk 0.2:', error.message);
  }

  const { premium, breakdown } = computePremium({
    riskScore,
    cityRisk,
    seasonFactor,
    avgWorkHours: workHours,
    hourlyIncome,
  });

  console.log('[PremiumService] Premium Calculation:', {
    risk_score: riskScore,
    city_risk_score: cityRisk,
    season_factor: `${seasonFactor} (${seasonLabel})`,
    premium,
    source,
  });

  return {
    risk: riskScore,
    premium,
    riskLevel: getRiskLevel(riskScore),
    source,
    environment,
    breakdown: { ...breakdown, riskScore, cityRisk, seasonFactor, seasonLabel },
    payload: mlPayload,
  };
};

module.exports = { calculatePremium, getRiskLevel, getCityRisk, getSeasonFactor };
