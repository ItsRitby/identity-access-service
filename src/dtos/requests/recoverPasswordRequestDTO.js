export function parseRecoverPasswordRequest(body) {
  const { username, recoveryCode, newPassword } = body || {};

  if (typeof username !== 'string' || username.trim().length === 0) {
    throw new Error('username is required');
  }
  if (typeof recoveryCode !== 'string' || recoveryCode.trim().length === 0) {
    throw new Error('recoveryCode is required');
  }
  if (typeof newPassword !== 'string' || newPassword.length < 6) {
    throw new Error('newPassword is required and must be at least 6 characters');
  }

  return {
    username: username.trim().toLowerCase(),
    recoveryCode: recoveryCode.trim().toUpperCase(),
    newPassword,
  };
}