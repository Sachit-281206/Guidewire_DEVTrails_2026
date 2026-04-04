const MONITOR_INTERVAL_MS = 12000;

const clamp = (value) => parseFloat(Math.min(Math.max(value, 0), 1).toFixed(2));

const hashString = (input = '') => {
  let hash = 2166136261;
  for (let index = 0; index < input.length; index += 1) {
    hash ^= input.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
};

const createSeededGenerator = (seedInput) => {
  let seed = hashString(seedInput) || 1;
  return () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967295;
  };
};

const getCycleBucket = (timestamp = Date.now()) => Math.floor(timestamp / MONITOR_INTERVAL_MS);

const buildEnvironmentSeed = (city, timestamp) =>
  `${(city || 'unknown').trim().toLowerCase()}:${getCycleBucket(timestamp)}`;

const simulateEnvironment = (city = '', timestamp = Date.now()) => {
  const normalizedCity = city.trim() || 'Unknown';
  const random = createSeededGenerator(buildEnvironmentSeed(normalizedCity, timestamp));

  const heavyRain = random() < 0.3;
  let rainfall = heavyRain ? 0.7 + (random() * 0.3) : random() * 0.5;
  let temperature = 0.3 + (random() * 0.5);
  let aqi = 0.2 + (random() * 0.5);

  if (normalizedCity.toLowerCase() === 'chennai') {
    rainfall += 0.1;
  }

  return {
    city: normalizedCity,
    rainfall: clamp(rainfall),
    temperature: clamp(temperature),
    aqi: clamp(aqi),
    timestamp: new Date(timestamp).toISOString(),
    source: 'mock',
  };
};

const getEnvironment = async (city = '', options = {}) => {
  const timestamp = options.timestamp || Date.now();
  return simulateEnvironment(city, timestamp);
};

module.exports = {
  MONITOR_INTERVAL_MS,
  buildEnvironmentSeed,
  clamp,
  createSeededGenerator,
  getCycleBucket,
  getEnvironment,
  hashString,
  simulateEnvironment,
};
