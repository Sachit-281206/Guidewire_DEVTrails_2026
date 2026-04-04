const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Claim = require('../models/Claim');
const Shift = require('../models/Shift');
const { calculatePremium } = require('../services/premiumService');
const { getMonitoringSnapshot } = require('../services/triggerService');

router.post('/register', async (req, res) => {
  try {
    const { phone, email, password, name, dob, gender, city, platform,
            dailyIncome, avgWorkHours, aadhaar, pan, isVerified, upiId, locationPermission } = req.body;

    const normalizedPhone = String(phone || '').trim();
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const normalizedName = String(name || '').trim();
    const normalizedCity = String(city || '').trim();
    const normalizedPlatform = String(platform || '').trim();
    const normalizedUpiId = String(upiId || '').trim().toLowerCase();
    const normalizedPan = String(pan || '').trim().toUpperCase();
    const normalizedAadhaar = String(aadhaar || '').trim();

    if (!normalizedPhone && !normalizedEmail) {
      return res.status(400).json({ error: 'Phone or email is required' });
    }
    if (normalizedPhone && !/^\d{10}$/.test(normalizedPhone)) {
      return res.status(400).json({ error: 'Phone number must be 10 digits' });
    }
    if (normalizedEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
      return res.status(400).json({ error: 'Enter a valid email address' });
    }
    if (!normalizedName || !normalizedCity || !normalizedPlatform || !normalizedUpiId || !password) {
      return res.status(400).json({ error: 'Missing required registration fields' });
    }
    if (Number(dailyIncome) <= 0 || Number(avgWorkHours) <= 0) {
      return res.status(400).json({ error: 'Income and work hours must be valid numbers' });
    }

    if (normalizedPhone) {
      const exists = await User.findOne({ phone: normalizedPhone });
      if (exists) return res.status(400).json({ error: 'Phone number already registered' });
    }
    if (normalizedEmail) {
      const exists = await User.findOne({ email: normalizedEmail });
      if (exists) return res.status(400).json({ error: 'Email already registered' });
    }

    const hourlyIncome = dailyIncome && avgWorkHours ? parseFloat((dailyIncome / avgWorkHours).toFixed(2)) : null;

    const user = await User.create({
      phone: normalizedPhone || undefined,
      email: normalizedEmail || undefined,
      password,
      name: normalizedName,
      dob,
      gender,
      city: normalizedCity,
      platform: normalizedPlatform,
      dailyIncome,
      avgWorkHours,
      hourlyIncome,
      aadhaar: normalizedAadhaar || undefined,
      pan: normalizedPan || undefined,
      isVerified: isVerified || false,
      upiId: normalizedUpiId,
      locationPermission: locationPermission || false,
    });
    res.status(201).json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { identifier, password } = req.body;
    const user = await User.findOne({
      $or: [{ email: identifier }, { phone: identifier }],
      password,
    });
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/premium', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    const shift = await Shift.findOne({ userId: user._id, active: true });
    const result = await calculatePremium(user.city, shift, user);
    res.json(result);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/monitoring', async (req, res) => {
  try {
    const snapshot = await getMonitoringSnapshot(req.params.id);
    if (!snapshot) return res.status(404).json({ error: 'User not found' });
    res.json(snapshot);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.get('/:id/claims', async (req, res) => {
  try {
    const claims = await Claim.find({ userId: req.params.id }).sort({ createdAt: -1 });
    res.json(claims);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
