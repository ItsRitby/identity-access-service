import { verifyToken } from '../utils/tokenUtils.js';
import { UnauthorizedError } from '../utils/AppError.js';

export function authMiddleware(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new UnauthorizedError('Missing or invalid Authorization header'));
  }

  const token = authHeader.slice(7);

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, username: payload.username };
    next();
  } catch (error) {
    next(new UnauthorizedError('Invalid or expired token'));
  }
}