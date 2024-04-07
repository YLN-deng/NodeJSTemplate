import express from 'express';
const router = express.Router();

import { authController } from '@controller/auth/auth';

// 导入需要的验证规则对象
import { LoginVerificationCredentials } from '@schema/auth/auth';

/* 注册 */
router.post('/register', authController.register);

/* 登录 */
router.post('/login', LoginVerificationCredentials, authController.login);

/* 退出 */
router.post('/logout', authController.logout);

export default router;
