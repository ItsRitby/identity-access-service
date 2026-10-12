import crypto from 'crypto';
import { buildUserDocument, touchUpdatedAt } from '../models/userModel.js';
import {
  insertUser,
  findById,
  findByUsername,
  findByNickname,
  replaceUser,
} from '../repositories/userRepository.js';
import { hashPassword } from '../utils/passwordUtils.js';
import { generateRecoveryCode } from '../utils/recoveryCodeUtils.js';
import { ConflictError, NotFoundError } from '../utils/AppError.js';

// ---------- Validation Private Functions ----------

async function ensureUsernameIsFree(username) {
  const existing = await findByUsername(username);
  if (existing) {
    throw new ConflictError('Username is already taken');
  }
}

async function ensureNicknameIsFree(nickname, ignoreId = null) {
  const existing = await findByNickname(nickname);
  if (existing && existing.id !== ignoreId) {
    throw new ConflictError('Nickname is already taken');
  }
}

async function requireUser(id) {
  const user = await findById(id);
  if (!user) {
    throw new NotFoundError('User not found');
  }
  return user;
}

// ---------- Construction Private Functions ----------

async function createUserDocument({ username, nickname, password }) {
  const id = crypto.randomUUID();
  const passwordHash = await hashPassword(password);
  const recoveryCode = generateRecoveryCode();
  return buildUserDocument({ id, username, nickname, passwordHash, recoveryCode });
}

// ---------- Public Services (Functions) ----------

export async function registerUser({ username, nickname, password }) {
  await ensureUsernameIsFree(username);
  await ensureNicknameIsFree(nickname);

  const userDocument = await createUserDocument({ username, nickname, password });
  await insertUser(userDocument);
  return userDocument;
}

export async function getUserById(id) {
  return requireUser(id);
}

export async function changeNickname(id, newNickname) {
  const user = await requireUser(id);
  const nicknameChanged = user.nickname !== newNickname;

  if (nicknameChanged) {
    await ensureNicknameIsFree(newNickname, id);
    const updated = touchUpdatedAt({ ...user, nickname: newNickname });
    await replaceUser(updated);
    return updated;
  }

  return user;
}