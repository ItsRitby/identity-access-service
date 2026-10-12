import { toUserResponse } from './userResponseDTO.js';

export function toRegisterUserResponse(userDocument) {
  return {
    user: toUserResponse(userDocument),
    recoveryCode: userDocument.recoveryCode,
  };
}