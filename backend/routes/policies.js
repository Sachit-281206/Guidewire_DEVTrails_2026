const express = require('express');
const router = express.Router();
const Policy = require('../models/Policy');

// Activate policy
router.post('/activate', async (req, res) => {
  try {
    const { userId, premium } = req.body;
    const startDate = new Date();
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 7);

    // Deactivate any existing policy
    await Policy.updateMany({ userId, active: true }, { active: false });

    const policy = await Policy.create({ userId, premium, startDate, endDate, active: true });
    res.status(201).json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// Get active policy for user
router.get('/:userId', async (req, res) => {
  try {
    const policy = await Policy.findOne({ userId: req.params.userId, active: true });
    res.json(policy);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

module.exports = router;
