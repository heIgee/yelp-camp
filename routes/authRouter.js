import express from 'express';

import AuthController from '../controllers/AuthController.js';

const router = express.Router();

router.route('/register')
    .get(AuthController.getRegister)
    .post(AuthController.register);

router.route('/login')
    .get(AuthController.getLogin)
    .post(AuthController.login);

router.get('/logout', AuthController.logout);

export default router;
