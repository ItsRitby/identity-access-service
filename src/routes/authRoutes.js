import { Router } from 'express';
import {
  handleLogin,
  handleRecoverPassword,
  handleLogout,
} from '../controllers/authController.js';
import { authMiddleware } from '../middlewares/authMiddleware.js';

const router = Router();

/**
 * @openapi
 * /api/v1/auth/login:
 *   post:
 *     summary: Authenticate a user and receive a JWT (US-2)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *     responses:
 *       200:
 *         description: Authentication successful
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LoginResponse'
 *       401:
 *         description: Invalid credentials
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/login', handleLogin);

/**
 * @openapi
 * /api/v1/auth/recover-password:
 *   post:
 *     summary: Recover a user's password using the recovery code (US-3)
 *     tags:
 *       - Auth
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RecoverPasswordRequest'
 *     responses:
 *       200:
 *         description: Password changed. A new recovery code is returned.
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/RecoverPasswordResponse'
 *       401:
 *         description: Invalid recovery code
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 */
router.post('/recover-password', handleRecoverPassword);

/**
 * @openapi
 * /api/v1/auth/logout:
 *   post:
 *     summary: Log out the authenticated user (US-6)
 *     description: JWT is stateless; the client must discard the token after this call.
 *     tags:
 *       - Auth
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout confirmation
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/LogoutResponse'
 *       401:
 *         description: Missing or invalid token
 */
router.post('/logout', authMiddleware, handleLogout);

export default router;