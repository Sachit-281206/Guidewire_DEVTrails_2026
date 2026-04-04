const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  phone:              { type: String, sparse: true },
  email:              { type: String, sparse: true },
  password:           { type: String, required: true },
  name:               { type: String, required: true },
  dob:                { type: String },
  gender:             { type: String },
  city:               { type: String, required: true },
  platform:           { type: String, required: true },
  dailyIncome:        { type: Number, required: true },
  avgWorkHours:       { type: Number, default: 8 },
  hourlyIncome:       { type: Number },
  aadhaar:            { type: String },
  pan:                { type: String },
  isVerified:         { type: Boolean, default: false },
  upiId:              { type: String, required: true },
  locationPermission: { type: Boolean, default: false },
}, { timestamps: true });

// Sparse unique indexes — allows multiple docs with null/missing values
userSchema.index({ email: 1 }, { unique: true, sparse: true });
userSchema.index({ phone: 1 }, { unique: true, sparse: true });

module.exports = mongoose.model('User', userSchema);
