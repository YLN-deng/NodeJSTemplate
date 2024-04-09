import express from 'express';
const router = express.Router();

import { authController } from '@controller/auth/auth';

// 导入需要的验证规则对象
import { LoginVerificationCredentials, RegisterVerificationCredentials } from '@schema/auth/auth';

/* 注册 */
router.post('/register', RegisterVerificationCredentials, authController.register);

/* 获取验证码 */
router.post('/mailer', authController.sendMail)

/* 登录 */
router.post('/login', LoginVerificationCredentials, authController.login);

/* 退出 */
router.post('/logout', authController.logout);

export default router;
