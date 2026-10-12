export function parseLoginRequest(body) {
  const { username, password } = body || {};

  if (typeof username !== 'string' || username.trim().length === 0) {
    throw new Error('username is required');
  }
  if (typeof password !== 'string' || password.length === 0) {
    throw new Error('password is required');
  }

  return {
    username: username.trim().toLowerCase(),
    password,
  };
}