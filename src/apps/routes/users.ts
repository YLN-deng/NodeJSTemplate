import express from 'express';
const router = express.Router();

import { usersController } from "apps/controller/users";

/* register routes */
router.get('/list', usersController.getUserList);

router.get('/info/:id', usersController.getUserID);

router.put('/update/:id', usersController.updateUser);

router.delete('/delete/:id', usersController.deleteUser);

export default router;
