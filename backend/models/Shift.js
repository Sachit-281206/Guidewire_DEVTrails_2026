const mongoose = require('mongoose');

const shiftSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  active: { type: Boolean, default: true },
  startTime: { type: Date, default: Date.now },
  lastCheckedAt: { type: Date, default: null },
  lastTriggeredAt: { type: Date, default: null },
  lastEnvironment: { type: Object, default: null },
  lastTrigger: { type: Object, default: null },
  lastClaimSummary: { type: Object, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Shift', shiftSchema);
