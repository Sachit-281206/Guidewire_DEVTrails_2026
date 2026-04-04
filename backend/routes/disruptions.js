const express = require('express');
const router  = express.Router();
const User    = require('../models/User');
const Policy  = require('../models/Policy');
const Shift   = require('../models/Shift');
const { generateClaim } = require('../services/claimService');
const { isOnCooldown } = require('../services/triggerService');

router.post('/simulate-trigger', async (req, res) => {
  try {
    const { userId, disruption } = req.body;

    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ error: 'User not found' });

    const policy = await Policy.findOne({ userId, active: true });
    if (!policy) return res.status(400).json({ error: 'No active policy' });
    if (new Date() > new Date(policy.endDate)) return res.status(400).json({ error: 'Policy expired' });

    const shift = await Shift.findOne({ userId, active: true });
    if (!shift) return res.status(400).json({ error: 'No active work session' });

    if (isOnCooldown(shift.lastTriggeredAt)) {
      return res.status(429).json({ error: 'Claim cooldown active. Please wait 5 minutes.' });
    }

    const trigger = { type: String(disruption || 'RAIN').toUpperCase(), inputs: {} };
    const claim = await generateClaim(userId, user, trigger, null, { source: 'simulation' });

    shift.lastTriggeredAt = new Date();
    shift.lastClaimSummary = {
      claimId: claim._id,
      disruption: claim.disruption,
      payout: claim.payout,
      status: claim.status,
      createdAt: claim.createdAt,
      triggerType: claim.triggerType,
    };
    await shift.save();

    res.status(201).json(claim);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
