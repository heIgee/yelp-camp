import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import methodOverride from 'method-override';
import expressEjsLayouts from 'express-ejs-layouts';
import wrap from 'express-async-handler';
import Joi from 'joi';

import Campground from './models/Campground.js';
import Review from './models/Review.js';

import ExpressError from './helpers/ExpressError.js';
import CampgroundValidator from './helpers/CampgroundValidator.js';
import ReviewValidator from './helpers/ReviewValidator.js';

const app = express();

mongoose.connect('mongodb://localhost:27017/YelpCamp', {

});

const db = mongoose.connection;

db.on('error', (err) => console.error('Mongo failed:', err));
db.once('open', () => {
    console.log('Mongo connected');
});

const __dirname = import.meta.dirname;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('layout', 'layouts/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(expressEjsLayouts);

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

// *************
// ** ROUTERS **
// *************

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
});

app.get('/campgrounds', wrap(async (req, res, next) => {
    const allCamps = await Campground.find();
    res.render('campgrounds/index', { campgrounds: allCamps });
}));

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', CampgroundValidator.test, wrap(async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}));

app.get('/campgrounds/:id', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id).populate('reviews');

    if (campground) {
        res.render('campgrounds/show', { campground });
    }
    else {
        throw new ExpressError(404, 'Not Found');
    }
}));

app.get('/campgrounds/:id/edit', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (campground) {
        res.render('campgrounds/edit', { campground });
    }
    else {
        throw new ExpressError(404, 'Not Found');
    }
}));

app.put('/campgrounds/:id', CampgroundValidator.test, wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);

    if (campground) {
        res.redirect(`/campgrounds/${campground._id}`);
    }
    else {
        throw new ExpressError(404, 'Not Found');
    }
}));

app.delete('/campgrounds/:id', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);

    if (campground) {
        res.redirect('/campgrounds');
    }
    else {
        throw new ExpressError(404, 'Not Found');
    }
}));

app.post('/campgrounds/:id/reviews', ReviewValidator.test, wrap(async (req, res) => {
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

    console.log(review.campground);

    res.redirect(`/campgrounds/${id}`);
}));

app.delete('/campgrounds/:campId/reviews/:reviewId', wrap(async (req, res) => {
    const { campId, reviewId } = req.params;
    await Review.findByIdAndDelete(reviewId);
    // campground.reviews.filter(r => r._id !== reviewId); // classic solution
    await Campground.findByIdAndUpdate(campId, {
        $pull: { reviews: reviewId }
    });
    res.redirect(`/campgrounds/${campId}`);
}));

app.all('*', (res, req, next) => {
    throw new ExpressError(404, 'Page Not Found');
});

app.use((err, req, res, next) => {
    err.status ||= 500;
    err.message ||= 'Went Bananas!';
    res.status(err.status).render('error', { err });
});

app.listen(3000, () => {
    console.log('🚀 Server is listening on http://localhost:3000 💕');
})
