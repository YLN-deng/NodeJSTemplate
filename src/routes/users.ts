import express from 'express';
const router = express.Router();

import { usersController } from "@controller/users";

/* register routes */
router.get('/list', usersController.getUserList);

router.get('/profile/:id', usersController.getUserID);

router.put('/profile/:id', usersController.updateUser);

router.delete('/profile/:id', usersController.deleteUser);

export default router;
