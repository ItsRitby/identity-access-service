import { Router } from 'express';
import {
  handleLogin,
  handleRecoverPassword,
  handleLogout,
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/login', handleLogin);
router.post('/recover-password', handleRecoverPassword);
router.post('/logout', authMiddleware, handleLogout);

export default router;