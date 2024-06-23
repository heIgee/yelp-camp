import wrap from 'express-async-handler';
import Campground from '../models/Campground.js';
import Review from '../models/Review.js';

class ReviewController {

    create = wrap(async (req, res) => {
        const campground = res.locals.campground;
        const campgroundId = campground._id;

        const { rating, content } = req.body.review;
        const review = new Review({ rating, content, campgroundId });

        campground.reviews.unshift(review);
        review.campground = campground;

        req.user.reviews.unshift(review); // TODO not pushing
        review.author = req.user._id; // while this works

        await review.save();
        await campground.save();

        req.flash('success', 'Your review was sent');
        res.redirect(`/campgrounds/${campgroundId}`);
    });

    delete = wrap(async (req, res) => {

        const { id: campgroundId, reviewId } = req.params;

        await Review.deleteOne({ _id: reviewId });

        await Campground.updateOne({ _id: campgroundId }, {
            $pull: { reviews: reviewId }
        });

        req.flash('success', 'Review was deleted');
        res.redirect(`/campgrounds/${campgroundId}`);
    });
}

export default new ReviewController();
