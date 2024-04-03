import express from 'express';
const router = express.Router();

import { usersController } from "@controller/users";

// 导入验证数据的中间件
import expressJoi from 'express-joi-validation';
// 导入需要的验证规则对象
import {} from '@schema/user/user';

/* register routes */
router.get('/list', usersController.getUserList);

router.get('/profile/:id', usersController.getUserID);

router.put('/profile/:id', usersController.updateUser);

router.delete('/profile/:id', usersController.deleteUser);

export default router;
