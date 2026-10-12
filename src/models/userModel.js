export function buildUserKey(id) {
  return `user::${id}`;
}

export function buildUserDocument({
  id,
  username,
  nickname,
  passwordHash,
  recoveryCode,
}) {
  const now = new Date().toISOString();
  return {
    type: 'user',
    id,
    username,
    nickname,
    passwordHash,
    recoveryCode,
    gamesPlayed: 0,
    wins: 0,
    currentStreak: 0,
    createdAt: now,
    updatedAt: now,
  };
}

export function touchUpdatedAt(userDocument) {
  return {
    ...userDocument,
    updatedAt: new Date().toISOString(),
  };
}