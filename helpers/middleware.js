import ExpressError from './ExpressError.js';
import Campground from '../models/Campground.js';
import Review from '../models/Review.js';
import mongoose from 'mongoose';

import wrap from 'express-async-handler';

const ensureLoggedIn = (req, res, next) => {
    if (!req.isAuthenticated()) {
        req.flash('error', 'You must be signed in');

        if (req.method === 'GET') {
            req.session.lastPage = req.originalUrl;
        }
        else {
            // address from which a resource has been requested
            req.session.lastPage = req.headers.referer || '/';
        }

        return res.redirect('/login');
    }
    return next();
};

const verifyCampground = wrap(async (req, res, next) => {
    const { id: campgroundId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(campgroundId)) {
        req.flash('error', 'Invalid campground ID');
        return res.redirect('/campgrounds');
    }

    const campground = await Campground.findById(campgroundId);
    if (!campground) {
        throw new ExpressError(404, 'Campground not found');
    }

    res.locals.campground = campground;
    return next();
});

const verifyCampgroundAndOwner = wrap(async (req, res, next) => {
    await new Promise((resolve, reject) => {
        verifyCampground(req, res, (err) => {
            err ? reject(err) : resolve();
        });
    });

    const campground = res.locals.campground;
    if (!req.user._id.equals(campground.owner._id)) {
        throw new ExpressError(403, 'You do not have permissions to modify that campground');
    }

    return next();
});

const verifyReviewAndAuthor = wrap(async (req, res, next) => {
    const { reviewId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(reviewId)) {
        throw new ExpressError(400, 'Invalid review ID');
    }

    const review = await Review.findById(reviewId);

    if (!review) {
        throw new ExpressError(404, 'Review not found');
    }

    if (!req.user._id.equals(review.author._id)) {
        throw new ExpressError(403, 'You do not have permissions to modify that review');
    }

    res.locals.review = review;
    return next();
});

export {
    ensureLoggedIn,
    verifyCampground,
    verifyCampgroundAndOwner,
    verifyReviewAndAuthor
};
