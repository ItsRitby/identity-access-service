export function toRecoverPasswordResponse(updatedUserDocument) {
  return {
    message: 'Password changed successfully',
    recoveryCode: updatedUserDocument.recoveryCode,
  };
}