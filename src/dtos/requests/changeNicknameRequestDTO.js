export function parseChangeNicknameRequest(body) {
  const { newNickname } = body || {};

  if (typeof newNickname !== 'string' || newNickname.trim().length < 3) {
    throw new Error('newNickname is required and must be at least 3 characters');
  }

  return {
    newNickname: newNickname.trim(),
  };
}