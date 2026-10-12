export function toUserResponse(userDocument) {
  return {
    id: userDocument.id,
    username: userDocument.username,
    nickname: userDocument.nickname,
    gamesPlayed: userDocument.gamesPlayed ?? 0,
    wins: userDocument.wins ?? 0,
    currentStreak: userDocument.currentStreak ?? 0,
    createdAt: userDocument.createdAt,
  };
}