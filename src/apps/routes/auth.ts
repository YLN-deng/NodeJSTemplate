import express from 'express';
const router = express.Router();

import { authController } from 'apps/controller/auth';

// 导入需要的验证规则对象
import { LoginVerificationCredentials, RegisterVerificationCredentials } from 'apps/schema/auth';

/* 注册 */
router.post('/register', RegisterVerificationCredentials, authController.register);

/* 注册邮箱验证码 */
router.get('/mailer', authController.sendMail)

/* 登录 */
router.post('/login', LoginVerificationCredentials, authController.login);

/* 登录验证码 */
router.get('/captcha', authController.captcha);

/* 退出 */
router.post('/logout', authController.logout);

export default router;
