import express from 'express';

import ReviewValidator from '../helpers/validators/ReviewValidator.js';

import ReviewController from '../controllers/ReviewController.js';

import {
    ensureLoggedIn,
    verifyCampground,
    verifyReviewAndAuthor
} from '../helpers/middleware.js';

const router = express.Router({ mergeParams: true });

router.post('/',
    ensureLoggedIn,
    verifyCampground,
    ReviewValidator.test,
    ReviewController.create
);

router.delete('/:reviewId',
    ensureLoggedIn,
    verifyCampground,
    verifyReviewAndAuthor,
    ReviewController.delete
);

export default router;
