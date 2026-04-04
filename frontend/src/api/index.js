const BASE = 'http://localhost:5000/api';

const post = (url, data) =>
  fetch(`${BASE}${url}`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(data) }).then(r => r.json());

const get = (url) => fetch(`${BASE}${url}`).then(r => r.json());

export const registerUser     = (data)               => post('/users/register', data);
export const loginUser        = (data)               => post('/users/login', data);
export const getPremium       = (id)                 => get(`/users/${id}/premium`);
export const getClaims        = (id)                 => get(`/users/${id}/claims`);
export const getMonitoring    = (id)                 => get(`/users/${id}/monitoring`);
export const activatePolicy   = (userId, premium)    => post('/policies/activate', { userId, premium });
export const getPolicy        = (userId)             => get(`/policies/${userId}`);
export const startShift       = (userId)             => post('/shifts/start', { userId });
export const endShift         = (userId)             => post('/shifts/end', { userId });
export const getShift         = (userId)             => get(`/shifts/${userId}`);
export const getEnvironment   = (city)               => get(`/environment/${city}`);
export const simulateTrigger  = (userId, disruption) => post('/disruptions/simulate-trigger', { userId, disruption });
