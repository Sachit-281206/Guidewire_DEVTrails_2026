const express = require('express');
const router = express.Router();
const Shift = require('../models/Shift');

// Start shift
router.post('/start', async (req, res) => {
  try {
    const { userId } = req.body;
    // End any existing active shift
    await Shift.updateMany({ userId, active: true }, { active: false });
    const shift = await Shift.create({ userId, active: true, startTime: new Date() });
    res.status(201).json(shift);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// End shift
router.post('/end', async (req, res) => {
  try {
    const { userId } = req.body;
    await Shift.updateMany({ userId, active: true }, { active: false });
    res.json({ message: 'Shift ended' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get active shift
router.get('/:userId', async (req, res) => {
  try {
    const shift = await Shift.findOne({ userId: req.params.userId, active: true });
    res.json(shift);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
