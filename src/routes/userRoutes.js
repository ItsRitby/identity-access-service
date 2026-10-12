import { Router } from 'express';
import {
  handleRegisterUser,
  handleGetCurrentUser,
  handleChangeNickname,
} from '../controllers/userController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/', handleRegisterUser);
router.get('/me', authMiddleware, handleGetCurrentUser);
router.put('/me/nickname', authMiddleware, handleChangeNickname);

export default router;