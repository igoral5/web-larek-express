import { Router } from 'express';
import authMiddleware from '../middlewares/auth';
import {
  getCurrentUser,
  login,
  logout,
  refreshAccessToken,
  register,
} from '../controllers/auth';
import { loginValidation, registerValidation } from '../middlewares/validations';

const authRouter = Router();

authRouter.post('/login', loginValidation, login);
authRouter.post('/register', registerValidation, register);
authRouter.get('/token', refreshAccessToken);
authRouter.get('/logout', logout);
authRouter.get('/user', authMiddleware, getCurrentUser);

export default authRouter;
