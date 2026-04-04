const mongoose = require('mongoose');

const claimSchema = new mongoose.Schema({
  userId:     { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  disruption: { type: String, required: true },
  triggerType:{ type: String, required: true },
  lostHours:  { type: Number, required: true },
  confidence: { type: Number, required: true },
  payout:     { type: Number, required: true },
  status:     { type: String, enum: ['FULL', 'PARTIAL', 'REVIEW'], required: true },
  breakdown:  { type: Object, default: {} },
  envFactors: { type: Object, default: {} },
  source:     { type: String, default: 'automation' },
}, { timestamps: true });

module.exports = mongoose.model('Claim', claimSchema);
