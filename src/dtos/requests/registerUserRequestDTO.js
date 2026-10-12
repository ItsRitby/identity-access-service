export function parseRegisterUserRequest(body) {
  const { username, nickname, password } = body || {};

  if (typeof username !== 'string' || username.trim().length < 3) {
    throw new Error('username is required and must be at least 3 characters');
  }
  if (typeof nickname !== 'string' || nickname.trim().length < 3) {
    throw new Error('nickname is required and must be at least 3 characters');
  }
  if (typeof password !== 'string' || password.length < 6) {
    throw new Error('password is required and must be at least 6 characters');
  }

  return {
    username: username.trim().toLowerCase(),
    nickname: nickname.trim(),
    password,
  };
}