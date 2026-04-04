const Policy = require('../models/Policy');
const Shift = require('../models/Shift');
const User = require('../models/User');
const { generateClaim } = require('./claimService');
const { getEnvironment, MONITOR_INTERVAL_MS, createSeededGenerator, getCycleBucket } = require('./environmentService');
const { getCityRisk } = require('./premiumService');

const COOLDOWN_MS = 5 * 60 * 1000;
const TRIGGER_PRIORITY = ['FLOOD', 'RAIN', 'HEAT', 'AQI', 'OUTAGE'];

const createOutageProbability = (city, userId, timestamp) => {
  const random = createSeededGenerator(`outage:${city}:${userId}:${getCycleBucket(timestamp)}`);
  return random();
};

const evaluateTriggers = (environment, city, options = {}) => {
  const { rainfall, temperature, aqi } = environment;
  const cityRiskScore = getCityRisk(city);
  const outageProbability = options.outageProbability ?? 1;
  const triggers = [];

  if (rainfall > 0.7) {
    triggers.push({ type: 'RAIN', inputs: { rainfall, temperature, aqi }, cityRiskScore });
  }

  if (temperature > 0.85) {
    triggers.push({ type: 'HEAT', inputs: { rainfall, temperature, aqi }, cityRiskScore });
  }

  if (aqi > 0.8) {
    triggers.push({ type: 'AQI', inputs: { rainfall, temperature, aqi }, cityRiskScore });
  }

  if (rainfall > 0.8 && cityRiskScore > 0.7) {
    triggers.push({ type: 'FLOOD', inputs: { rainfall, temperature, aqi }, cityRiskScore });
  }

  if (outageProbability < 0.1) {
    triggers.push({ type: 'OUTAGE', inputs: { rainfall, temperature, aqi }, cityRiskScore });
  }

  return triggers;
};

const prioritizeTriggers = (triggers = []) =>
  [...triggers].sort((left, right) => TRIGGER_PRIORITY.indexOf(left.type) - TRIGGER_PRIORITY.indexOf(right.type));

const isPolicyActive = (policy) => Boolean(policy?.active && new Date(policy.endDate) > new Date());

const isShiftActive = (shift) => Boolean(shift?.active);

const isOnCooldown = (lastTriggeredAt) => {
  if (!lastTriggeredAt) return false;
  return Date.now() - new Date(lastTriggeredAt).getTime() < COOLDOWN_MS;
};

const getMonitoringSnapshot = async (userId) => {
  const [user, policy, shift] = await Promise.all([
    User.findById(userId).lean(),
    Policy.findOne({ userId, active: true }).sort({ createdAt: -1 }).lean(),
    Shift.findOne({ userId, active: true }).sort({ createdAt: -1 }).lean(),
  ]);

  if (!user) return null;

  const monitoringActive = isPolicyActive(policy) && isShiftActive(shift);
  const environment = shift?.lastEnvironment || await getEnvironment(user.city);
  const activeAlert = shift?.lastTrigger || null;
  const latestClaim = shift?.lastClaimSummary || null;
  const cooldownRemainingMs = shift?.lastTriggeredAt
    ? Math.max(COOLDOWN_MS - (Date.now() - new Date(shift.lastTriggeredAt).getTime()), 0)
    : 0;

  return {
    monitoringActive,
    policyActive: isPolicyActive(policy),
    shiftActive: isShiftActive(shift),
    city: user.city,
    intervalMs: MONITOR_INTERVAL_MS,
    environment,
    activeAlert,
    latestClaim,
    cooldownRemainingMs,
    lastCheckedAt: shift?.lastCheckedAt || environment.timestamp,
  };
};

const processMonitoringCycle = async () => {
  const activeShifts = await Shift.find({ active: true }).sort({ updatedAt: -1 });
  if (activeShifts.length === 0) return;

  const userIds = activeShifts.map((shift) => shift.userId);
  const [users, policies] = await Promise.all([
    User.find({ _id: { $in: userIds } }),
    Policy.find({ userId: { $in: userIds }, active: true }),
  ]);

  const userMap = new Map(users.map((user) => [String(user._id), user]));
  const policyMap = new Map(policies.map((policy) => [String(policy.userId), policy]));
  const cycleTimestamp = Date.now();

  for (const shift of activeShifts) {
    const userId = String(shift.userId);
    const user = userMap.get(userId);
    const policy = policyMap.get(userId);

    if (!user || !isPolicyActive(policy)) {
      continue;
    }

    const environment = await getEnvironment(user.city, { timestamp: cycleTimestamp });
    const outageProbability = createOutageProbability(user.city, userId, cycleTimestamp);
    const triggers = prioritizeTriggers(evaluateTriggers(environment, user.city, { outageProbability }));
    const onCooldown = isOnCooldown(shift.lastTriggeredAt);

    console.log('[Monitor] Environment Data:', {
      user: user.name || user.phone || user.email,
      city: user.city,
      rainfall: environment.rainfall,
      temperature: environment.temperature,
      aqi: environment.aqi,
      cycle: new Date(cycleTimestamp).toISOString(),
    });

    shift.lastEnvironment = environment;
    shift.lastCheckedAt = new Date(cycleTimestamp);

    if (triggers.length === 0) {
      shift.lastTrigger = null;
      await shift.save();
      continue;
    }

    const trigger = triggers[0];
    shift.lastTrigger = {
      ...trigger,
      detectedAt: new Date(cycleTimestamp),
      cooldownActive: onCooldown,
    };

    console.log('[Monitor] Trigger Detected:', {
      user: user.name || user.phone || user.email,
      type: trigger.type,
      inputs: trigger.inputs,
      city_risk_score: trigger.cityRiskScore,
      cooldown_active: onCooldown,
    });

    if (onCooldown) {
      await shift.save();
      continue;
    }

    const claim = await generateClaim(user._id, user, trigger, environment);

    shift.lastTriggeredAt = new Date(cycleTimestamp);
    shift.lastClaimSummary = {
      claimId: claim._id,
      disruption: claim.disruption,
      payout: claim.payout,
      status: claim.status,
      createdAt: claim.createdAt,
      triggerType: claim.triggerType,
    };

    console.log('[Monitor] Claim Generated:', {
      user: user.name || user.phone || user.email,
      disruption: claim.disruption,
      payout: claim.payout,
      status: claim.status,
      confidence: claim.confidence,
    });

    await shift.save();
  }
};

let monitoringHandle = null;

const startMonitoringEngine = () => {
  if (monitoringHandle) return monitoringHandle;

  console.log(`[Monitor] Automated monitoring engine started (${MONITOR_INTERVAL_MS / 1000}s interval)`);
  monitoringHandle = setInterval(() => {
    processMonitoringCycle().catch((error) => {
      console.error('[Monitor] Engine error:', error.message);
    });
  }, MONITOR_INTERVAL_MS);

  processMonitoringCycle().catch((error) => {
    console.error('[Monitor] Initial cycle failed:', error.message);
  });

  return monitoringHandle;
};

module.exports = {
  COOLDOWN_MS,
  MONITOR_INTERVAL_MS,
  createOutageProbability,
  evaluateTriggers,
  getMonitoringSnapshot,
  isOnCooldown,
  prioritizeTriggers,
  processMonitoringCycle,
  startMonitoringEngine,
};
