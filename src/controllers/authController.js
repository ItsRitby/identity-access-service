import { login, recoverPassword, logout } from '../services/authService.js';
import { parseLoginRequest } from '../dtos/requests/loginRequestDTO.js';
import { parseRecoverPasswordRequest } from '../dtos/requests/recoverPasswordRequestDTO.js';
import { toLoginResponse } from '../dtos/responses/loginResponseDTO.js';
import { toRecoverPasswordResponse } from '../dtos/responses/recoverPasswordResponseDTO.js';
import { toLogoutResponse } from '../dtos/responses/logoutResponseDTO.js';

export async function handleLogin(req, res, next) {
  try {
    const data = parseLoginRequest(req.body);
    const { token, user } = await login(data);
    res.status(200).json(toLoginResponse(token, user));
  } catch (error) {
    next(error);
  }
}

export async function handleRecoverPassword(req, res, next) {
  try {
    const data = parseRecoverPasswordRequest(req.body);
    const updatedUser = await recoverPassword(data);
    res.status(200).json(toRecoverPasswordResponse(updatedUser));
  } catch (error) {
    next(error);
  }
}

export async function handleLogout(req, res, next) {
  try {
    logout();
    res.status(200).json(toLogoutResponse());
  } catch (error) {
    next(error);
  }
}