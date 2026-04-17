const express = require('express');
const Claim = require('../models/Claim');
const Policy = require('../models/Policy');
const Shift = require('../models/Shift');

const router = express.Router();

const DAY_MS = 24 * 60 * 60 * 1000;

const startOfDay = (date) => {
  const copy = new Date(date);
  copy.setHours(0, 0, 0, 0);
  return copy;
};

const round = (value, digits = 2) => {
  const factor = 10 ** digits;
  return Math.round((value + Number.EPSILON) * factor) / factor;
};

router.get('/dashboard', async (_req, res) => {
  try {
    const now = new Date();
    const todayStart = startOfDay(now);
    const weekStart = new Date(todayStart.getTime() - (6 * DAY_MS));
    const previousWeekStart = new Date(weekStart.getTime() - (7 * DAY_MS));
    const last24Hours = new Date(now.getTime() - DAY_MS);

    const [
      totalClaimsToday,
      activePolicies,
      activeWorkerSessions,
      payoutTodayAgg,
      payoutWeekAgg,
      totalClaimsWeek,
      previousWeekClaims,
      recentClaimsDocs,
      lowConfidenceDocs,
      repeatedClaimUsers,
      abnormalDurationDocs,
      zoneExposure,
      environmentSignals,
    ] = await Promise.all([
      Claim.countDocuments({ createdAt: { $gte: todayStart } }),
      Policy.countDocuments({ active: true, endDate: { $gte: now } }),
      Shift.countDocuments({ active: true }),
      Claim.aggregate([
        { $match: { createdAt: { $gte: todayStart } } },
        { $group: { _id: null, total: { $sum: '$payout' } } },
      ]),
      Claim.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        {
          $group: {
            _id: null,
            total: { $sum: '$payout' },
            average: { $avg: '$payout' },
          },
        },
      ]),
      Claim.countDocuments({ createdAt: { $gte: weekStart } }),
      Claim.countDocuments({
        createdAt: { $gte: previousWeekStart, $lt: weekStart },
      }),
      Claim.find({})
        .sort({ createdAt: -1 })
        .limit(8)
        .populate('userId', 'name city avgWorkHours'),
      Claim.find({ createdAt: { $gte: weekStart }, confidence: { $lt: 0.7 } })
        .sort({ confidence: 1, createdAt: -1 })
        .limit(6)
        .populate('userId', 'name city'),
      Claim.aggregate([
        { $match: { createdAt: { $gte: last24Hours } } },
        {
          $group: {
            _id: '$userId',
            count: { $sum: 1 },
            latestClaimAt: { $max: '$createdAt' },
          },
        },
        { $match: { count: { $gt: 1 } } },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $project: {
            _id: 0,
            userId: '$user._id',
            user: '$user.name',
            city: '$user.city',
            count: 1,
            latestClaimAt: 1,
          },
        },
        { $sort: { count: -1, latestClaimAt: -1 } },
      ]),
      Claim.find({
        createdAt: { $gte: weekStart },
        'breakdown.finalLossHours': { $gte: 6 },
      })
        .sort({ 'breakdown.finalLossHours': -1, createdAt: -1 })
        .limit(5)
        .populate('userId', 'name city avgWorkHours'),
      Claim.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'user',
          },
        },
        { $unwind: '$user' },
        {
          $group: {
            _id: '$user.city',
            claimCount: { $sum: 1 },
            totalPayout: { $sum: '$payout' },
          },
        },
        { $sort: { totalPayout: -1, claimCount: -1 } },
        { $limit: 3 },
      ]),
      Claim.aggregate([
        { $match: { createdAt: { $gte: weekStart } } },
        {
          $group: {
            _id: null,
            rainfall: { $avg: '$envFactors.rainfall' },
            temperature: { $avg: '$envFactors.temperature' },
            aqi: { $avg: '$envFactors.aqi' },
            confidence: { $avg: '$confidence' },
          },
        },
      ]),
    ]);

    const payoutToday = payoutTodayAgg[0]?.total || 0;
    const payoutWeek = payoutWeekAgg[0]?.total || 0;
    const averagePayoutPerClaim = payoutWeekAgg[0]?.average || 0;
    const env = environmentSignals[0] || {};
    const fraudAlertCount =
      lowConfidenceDocs.length + repeatedClaimUsers.length + abnormalDurationDocs.length;

    const recentClaimCounts = recentClaimsDocs.reduce((acc, claim) => {
      const userId = String(claim.userId?._id || claim.userId || '');
      acc[userId] = (acc[userId] || 0) + 1;
      return acc;
    }, {});

    const repeatedUsersSet = new Set(repeatedClaimUsers.map((item) => String(item.userId)));

    const recentClaims = recentClaimsDocs.map((claim) => {
      const userName = claim.userId?.name || 'Unknown';
      const confidenceScore = round(claim.confidence || 0, 2);
      const suspiciousReasons = [];

      if (confidenceScore < 0.7) suspiciousReasons.push('Low confidence');
      if (repeatedUsersSet.has(String(claim.userId?._id || claim.userId))) {
        suspiciousReasons.push('Repeated claims in 24h');
      }
      if ((claim.breakdown?.finalLossHours || 0) >= 6) {
        suspiciousReasons.push('Abnormal duration');
      }

      return {
        id: String(claim._id),
        userName,
        city: claim.userId?.city || 'Unknown',
        disruption: claim.disruption,
        payout: claim.payout,
        confidenceScore,
        status: claim.status,
        createdAt: claim.createdAt,
        suspicious: suspiciousReasons.length > 0 || recentClaimCounts[String(claim.userId?._id || claim.userId)] > 1,
        suspiciousReasons,
      };
    });

    const fraudAlertsMap = new Map();

    lowConfidenceDocs.forEach((claim) => {
      fraudAlertsMap.set(`low-${claim._id}`, {
        id: `low-${claim._id}`,
        user: claim.userId?.name || 'Unknown',
        confidence: round(claim.confidence || 0, 2),
        reason: `Low confidence on ${claim.disruption.toLowerCase()} claim`,
        signal: 'Low confidence',
        severity: claim.confidence < 0.55 ? 'high' : 'medium',
      });
    });

    repeatedClaimUsers.forEach((entry) => {
      fraudAlertsMap.set(`repeat-${entry.userId}`, {
        id: `repeat-${entry.userId}`,
        user: entry.user,
        confidence: 0.68,
        reason: `${entry.count} claims submitted in the last 24 hours`,
        signal: 'Repeated claims',
        severity: entry.count >= 3 ? 'high' : 'medium',
      });
    });

    abnormalDurationDocs.forEach((claim) => {
      const hours = round(claim.breakdown?.finalLossHours || 0, 1);
      const baseline = claim.userId?.avgWorkHours || 8;
      fraudAlertsMap.set(`duration-${claim._id}`, {
        id: `duration-${claim._id}`,
        user: claim.userId?.name || 'Unknown',
        confidence: round(claim.confidence || 0, 2),
        reason: `Claimed ${hours} lost hours against a usual ${baseline}h workday`,
        signal: 'Abnormal duration',
        severity: hours >= 7 ? 'high' : 'medium',
      });
    });

    const fraudAlerts = Array.from(fraudAlertsMap.values())
      .sort((a, b) => {
        const severityWeight = { high: 3, medium: 2, low: 1 };
        return (severityWeight[b.severity] || 0) - (severityWeight[a.severity] || 0);
      })
      .slice(0, 6);

    const weeklyTrendPct = previousWeekClaims === 0
      ? (totalClaimsWeek > 0 ? 100 : 0)
      : round(((totalClaimsWeek - previousWeekClaims) / previousWeekClaims) * 100, 1);

    const rainfall = env.rainfall || 0;
    const temperature = env.temperature || 0;
    const aqi = env.aqi || 0;
    const avgConfidence = env.confidence || 0.8;
    const fraudPressure = totalClaimsWeek > 0 ? fraudAlerts.length / totalClaimsWeek : 0;

    let riskLevel = 'LOW';
    if (
      rainfall >= 0.72 ||
      temperature >= 0.78 ||
      weeklyTrendPct >= 25 ||
      fraudPressure >= 0.25 ||
      aqi >= 0.78
    ) {
      riskLevel = 'HIGH';
    } else if (
      rainfall >= 0.55 ||
      temperature >= 0.65 ||
      weeklyTrendPct >= 10 ||
      fraudPressure >= 0.12 ||
      aqi >= 0.62
    ) {
      riskLevel = 'MEDIUM';
    }

    const claimTrendDirection =
      weeklyTrendPct > 5 ? 'increasing' : weeklyTrendPct < -5 ? 'decreasing' : 'stable';

    const riskSummary = {
      HIGH: 'Severe weather and claim pressure suggest elevated payout exposure next week.',
      MEDIUM: 'Signals are mixed. Watch claim frequency and confidence anomalies closely.',
      LOW: 'Current claims and environment signals point to manageable exposure next week.',
    }[riskLevel];

    res.json({
      generatedAt: now,
      overview: {
        totalClaimsToday,
        totalPayoutToday: payoutToday,
        activePolicies,
        activeWorkerSessions,
      },
      recentClaims,
      fraudAlerts,
      payouts: {
        today: payoutToday,
        week: payoutWeek,
        averagePerClaim: round(averagePayoutPerClaim, 0),
        recentActivity: recentClaims.slice(0, 5).map((claim) => ({
          id: claim.id,
          userName: claim.userName,
          payout: claim.payout,
          status: claim.status,
          disruption: claim.disruption,
          createdAt: claim.createdAt,
        })),
      },
      risk: {
        nextWeekRisk: riskLevel,
        summary: riskSummary,
        drivers: [
          { label: 'Rainfall stress', value: `${Math.round(rainfall * 100)}%` },
          { label: 'Heat stress', value: `${Math.round(temperature * 100)}%` },
          { label: 'Air quality stress', value: `${Math.round(aqi * 100)}%` },
          { label: 'Avg confidence', value: `${Math.round(avgConfidence * 100)}%` },
        ],
      },
      systemHealth: {
        claimTrendDirection,
        claimTrendPercent: weeklyTrendPct,
        fraudAlertsCount: fraudAlertCount,
        highRiskZones: zoneExposure.map((zone) => ({
          city: zone._id || 'Unknown',
          claimCount: zone.claimCount,
          totalPayout: zone.totalPayout,
        })),
        headline: `Claim frequency is ${claimTrendDirection} with ${fraudAlertCount} active fraud signals.`,
        uptimeStatus: 'Live',
        lastSynced: now,
        reviewQueue: recentClaims.filter((claim) => claim.status === 'REVIEW').length,
      },
    });
  } catch (error) {
    console.error('[Admin] Failed to build dashboard payload:', error);
    res.status(500).json({ error: 'Failed to load admin dashboard' });
  }
});

module.exports = router;
