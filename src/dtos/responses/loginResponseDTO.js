import { toUserResponse } from './userResponseDTO.js';

export function toLoginResponse(token, userDocument) {
  return {
    token,
    user: toUserResponse(userDocument),
  };
}