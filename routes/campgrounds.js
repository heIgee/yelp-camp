import express from 'express';
import wrap from 'express-async-handler';
import mongoose from 'mongoose';

import Campground from '../models/Campground.js';
import Review from '../models/Review.js';

import ExpressError from '../helpers/ExpressError.js';

import CampgroundValidator from '../helpers/CampgroundValidator.js';
import ReviewValidator from '../helpers/ReviewValidator.js';

const router = express.Router();

router.get('/campgrounds', wrap(async (req, res, next) => {
    const allCamps = await Campground.find();
    res.render('campgrounds/index', { campgrounds: allCamps });
}));

router.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

router.post('/campgrounds', CampgroundValidator.test, wrap(async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    req.flash('success', 'Your campground was created');
    res.redirect(`/campgrounds/${camp._id}`)
}));

router.get('/campgrounds/:id', wrap(async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
        req.flash('error', 'Invalid campground ID');
        return res.redirect('/campgrounds');
        // throw new ExpressError(400, 'Invalid campground ID');
    }

    const campground = await Campground.findById(id).populate('reviews');

    if (!campground) {
        req.flash('error', 'Cannot find that campground');
        res.redirect('/campgrounds');
        // throw new ExpressError(404, 'Cannot find that campground');
    }

    res.render('campgrounds/show', { campground });
}));

router.get('/campgrounds/:id/edit', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        throw new ExpressError(404, 'Not Found');
    }

    res.render('campgrounds/edit', { campground });
}));

router.put('/campgrounds/:id', CampgroundValidator.test, wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);

    if (!campground) {
        throw new ExpressError(404, 'Not Found');
    }

    req.flash('success', 'Your campground was updated');
    res.redirect(`/campgrounds/${campground._id}`);
}));

router.delete('/campgrounds/:id', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);

    if (!campground) {
        throw new ExpressError(404, 'Not Found');
    }

    req.flash('success', 'Your campground was deleted');
    res.redirect('/campgrounds');
}));

router.post('/campgrounds/:id/reviews', ReviewValidator.test, wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (!campground) {
        throw new ExpressError(404, 'Not Found');
    }

    const { rating, content } = req.body.review;
    const review = new Review({
        rating, content, id
    });
    campground.reviews.push(review);
    review.campground = campground;
    await review.save();
    await campground.save();

    req.flash('success', 'Your review was sent');
    res.redirect(`/campgrounds/${id}`);
}));

router.delete('/campgrounds/:campId/reviews/:reviewId', wrap(async (req, res) => {
    const { campId, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    // campground.reviews.filter(r => r._id !== reviewId); // classic solution
    await Campground.findByIdAndUpdate(campId, {
        $pull: { reviews: reviewId }
    });

    req.flash('success', 'Review was deleted');
    res.redirect(`/campgrounds/${campId}`);
}));

export default router;
