import {
  registerUser,
  getUserById,
  changeNickname,
} from '../services/userService.js';
import { parseRegisterUserRequest } from '../dtos/requests/registerUserRequestDTO.js';
import { parseChangeNicknameRequest } from '../dtos/requests/changeNicknameRequestDTO.js';
import { toUserResponse } from '../dtos/responses/userResponseDTO.js';
import { toRegisterUserResponse } from '../dtos/responses/registerUserResponseDTO.js';

export async function handleRegisterUser(req, res, next) {
  try {
    const data = parseRegisterUserRequest(req.body);
    const userDocument = await registerUser(data);
    res.status(201).json(toRegisterUserResponse(userDocument));
  } catch (error) {
    next(error);
  }
}

export async function handleGetCurrentUser(req, res, next) {
  try {
    const userDocument = await getUserById(req.user.id);
    res.status(200).json(toUserResponse(userDocument));
  } catch (error) {
    next(error);
  }
}

export async function handleChangeNickname(req, res, next) {
  try {
    const { newNickname } = parseChangeNicknameRequest(req.body);
    const userDocument = await changeNickname(req.user.id, newNickname);
    res.status(200).json(toUserResponse(userDocument));
  } catch (error) {
    next(error);
  }
}