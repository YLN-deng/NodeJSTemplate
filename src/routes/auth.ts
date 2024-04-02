import express from 'express';
const router = express.Router();

import { authController } from '@controller/auth';

/* 注册 */
router.post('/register', authController.register);

/* 登录 */
router.post('/login', authController.login);

/* 退出 */
router.post('/logout', authController.logout);

export default router;
