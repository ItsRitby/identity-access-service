import jwt from 'jsonwebtoken';

function getSecret() {
  const secret = process.env.JWT_SECRET;
  if (!secret || secret.length < 16) {
    throw new Error('JWT_SECRET is missing or too short (min 16 chars)');
  }
  return secret;
}

export function generateToken(user) {
  const payload = {
    sub: user.id,
    username: user.username,
  };
  return jwt.sign(payload, getSecret(), {
    expiresIn: process.env.JWT_EXPIRES_IN || '1h',
  });
}

export function verifyToken(token) {
  return jwt.verify(token, getSecret());
}