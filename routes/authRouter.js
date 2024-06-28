import express from 'express';

import AuthController from '../controllers/AuthController.js';

import AuthValidator from '../helpers/validators/AuthValidator.js';


const router = express.Router();

router.route('/register')
    .get(AuthController.getRegister)
    .post(AuthValidator.test,
        AuthController.register);

router.route('/login')
    .get(AuthController.getLogin)
    .post(AuthController.login);

router.get('/logout', AuthController.logout);

export default router;
