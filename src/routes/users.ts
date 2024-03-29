import express from 'express';
const router = express.Router();

import { userController } from '@controller/users';

/* 注册 */
router.post('/register', userController.register);

/* 登录 */
router.post('/login', userController.login);

/* 退出 */
router.post('/logout', userController.logout);

export default router;
