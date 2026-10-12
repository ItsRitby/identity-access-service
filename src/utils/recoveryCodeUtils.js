import crypto from 'crypto';

export function generateRecoveryCode() {
  const raw = crypto.randomBytes(6).toString('hex').toUpperCase(); // 12 hex chars
  return `${raw.slice(0, 4)}-${raw.slice(4, 8)}-${raw.slice(8, 12)}`;
}

export function normalizeRecoveryCode(code) {
  if (typeof code !== 'string') return '';
  return code.trim().toUpperCase();
}