import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import methodOverride from 'method-override';
import expressEjsLayouts from 'express-ejs-layouts';
import wrap from 'express-async-handler';
import Joi from 'joi';

import Campground from './models/campground.js';
import ExpressError from './helpers/ExpressError.js';
import CampgroundValidator from './helpers/CampgroundValidator.js';

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
    if (!req.body.campground) {
        // TODO joi
        throw new ExpressError(400, 'Invalid Post Data');
    }

    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
}));

app.get('/campgrounds/:id', wrap(async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);

    if (camp) {
        res.render('campgrounds/show', { campground: camp });
    }
    else {
        res.status(404).send('Not found');
    }
}));

app.get('/campgrounds/:id/edit', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (campground) {
        res.render('campgrounds/edit', { campground });
    }
    else {
        res.status(404).send('Not found');
    }
}));

app.put('/campgrounds/:id', CampgroundValidator.test, wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);

    if (campground) {
        res.redirect(`/campgrounds/${campground._id}`);
    }
    else {
        res.status(404).send('Not found');
    }
}));

app.delete('/campgrounds/:id', wrap(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);

    if (campground) {
        res.redirect('/campgrounds');
    }
    else {
        res.status(404).send('Not found');
    }
}));

app.all('*', (res, req, next) => {
    throw new ExpressError(404, 'Page Not Found');
});

app.use((err, req, res, next) => {
    err.status ||= 500;
    err.message ||= 'Went Bananas!';
    res.status(err.status).render('error', { err }); // `Custom handler: ${message}`
});

app.listen(3000, () => {
    console.log('🚀 Server is listening on http://localhost:3000 💕');
})
