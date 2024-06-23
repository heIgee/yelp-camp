import express from 'express';

import CampgroundValidator from '../helpers/CampgroundValidator.js';
import ReviewValidator from '../helpers/ReviewValidator.js';

import CampgroundController from '../controllers/CampgroundController.js';

import {
    ensureLoggedIn,
    verifyCampground,
    verifyCampgroundAndOwner,
    verifyReviewAndAuthor
} from '../middleware.js';

const router = express.Router();

router.route('/campgrounds')
    .get(CampgroundController.getIndex)
    .post(ensureLoggedIn,
        CampgroundValidator.test,
        CampgroundController.create
    );

router.get('/campgrounds/new',
    ensureLoggedIn,
    CampgroundController.getNew
);

router.route('/campgrounds/:id')
    .get(verifyCampground,
        CampgroundController.show
    )
    .put(ensureLoggedIn,
        verifyCampgroundAndOwner,
        CampgroundValidator.test,
        CampgroundController.update
    )
    .delete(ensureLoggedIn,
        CampgroundController.delete
    );

router.get('/campgrounds/:id/edit',
    ensureLoggedIn,
    verifyCampgroundAndOwner,
    CampgroundController.edit
);

router.post('/campgrounds/:id/reviews',
    ensureLoggedIn,
    verifyCampground,
    ReviewValidator.test,
    CampgroundController.createReview
);

router.delete('/campgrounds/:id/reviews/:reviewId',
    ensureLoggedIn,
    verifyCampground,
    verifyReviewAndAuthor,
    CampgroundController.deleteReview
);

export default router;
