import { findByUsername, replaceUser } from '../repositories/userRepository.js';
import { hashPassword, verifyPassword } from '../utils/passwordUtils.js';
import { generateToken } from '../utils/tokenUtils.js';
import {
  generateRecoveryCode,
  normalizeRecoveryCode,
} from '../utils/recoveryCodeUtils.js';
import { touchUpdatedAt } from '../models/userModel.js';
import { UnauthorizedError, NotFoundError } from '../utils/AppError.js';

// ---------- Validation Private Functions ----------

async function requireUserForLogin(username) {
  const user = await findByUsername(username);
  if (!user) {
    throw new UnauthorizedError('Invalid credentials');
  }
  return user;
}

async function requireValidPassword(password, passwordHash) {
  const passwordMatches = await verifyPassword(password, passwordHash);
  if (!passwordMatches) {
    throw new UnauthorizedError('Invalid credentials');
  }
}

async function requireExistingUser(username) {
  const user = await findByUsername(username);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

function requireMatchingRecoveryCode(user, recoveryCode) {
  const providedCode = normalizeRecoveryCode(recoveryCode);
  if (user.recoveryCode !== providedCode) {
    throw new UnauthorizedError('Invalid recovery code');
  }
}

// ---------- Construction Private Functions ----------

async function buildUserWithNewCredentials(user, newPassword) {
  const passwordHash = await hashPassword(newPassword);
  const recoveryCode = generateRecoveryCode();
  return touchUpdatedAt({ ...user, passwordHash, recoveryCode });
}

// ---------- Public Services (Functions) ----------

export async function login({ username, password }) {
  const user = await requireUserForLogin(username);
  await requireValidPassword(password, user.passwordHash);

  const token = generateToken(user);
  return { token, user };
}

export async function recoverPassword({ username, recoveryCode, newPassword }) {
  const user = await requireExistingUser(username);
  requireMatchingRecoveryCode(user, recoveryCode);

  const updated = await buildUserWithNewCredentials(user, newPassword);
  await replaceUser(updated);
  return updated;
}

export async function logout() {
  return { message: 'Logged out successfully' };
}