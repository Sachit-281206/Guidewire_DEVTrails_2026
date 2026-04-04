// Confidence score reflects how strongly the env data supports the disruption claim.
// Higher env values → higher confidence. Clamped to 0.6–1.0.

const assessFraud = (disruption = '', envFactors = {}) => {
  const { rainfall = 0.5, temperature = 0.5, aqi = 0.5 } = envFactors;

  let raw;
  switch (disruption.toLowerCase()) {
    case 'rain':       raw = 0.5 + (rainfall * 0.5);      break;
    case 'heat':       raw = 0.5 + (temperature * 0.5);   break;
    case 'pollution':  raw = 0.5 + (aqi * 0.5);           break;
    default:           raw = 0.5 + (Math.max(rainfall, temperature, aqi) * 0.5);
  }

  // Clamp between 0.6 and 1.0
  const confidence = parseFloat(Math.min(Math.max(raw, 0.6), 1.0).toFixed(2));
  return confidence;
};

module.exports = { assessFraud };
