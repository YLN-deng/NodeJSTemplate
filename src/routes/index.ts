import express from 'express';
const router = express.Router();

import { indexController } from "@controller/index";

/* GET home page. */
router.get('/', indexController.test);

export default router;
