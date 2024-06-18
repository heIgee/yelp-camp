import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import methodOverride from 'method-override';
import expressEjsLayouts from 'express-ejs-layouts';

import Campground from './models/campground.js';

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

app.use(express.static(path.join(__dirname, 'public')))

app.get('/', (req, res) => {
    res.redirect('/campgrounds');
});

app.get('/campgrounds', async (req, res) => {
    const allCamps = await Campground.find();
    res.render('campgrounds/index', { campgrounds: allCamps });
});

app.get('/campgrounds/new', (req, res) => {
    res.render('campgrounds/new');
});

app.post('/campgrounds', async (req, res) => {
    const camp = new Campground(req.body.campground);
    await camp.save();
    res.redirect(`/campgrounds/${camp._id}`)
});

app.get('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const camp = await Campground.findById(id);

    if (camp) {
        res.render('campgrounds/show', { campground: camp });
    }
    else {
        res.status(404).send('Not found');
    }
});

app.get('/campgrounds/:id/edit', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findById(id);

    if (campground) {
        res.render('campgrounds/edit', { campground });
    }
    else {
        res.status(404).send('Not found');
    }
});

app.put('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, req.body.campground);

    if (campground) {
        res.redirect(`/campgrounds/${campground._id}`);
    }
    else {
        res.status(404).send('Not found');
    }
});

app.delete('/campgrounds/:id', async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndDelete(id);

    if (campground) {
        res.redirect('/campgrounds');
    }
    else {
        res.status(404).send('Not found');
    }
});

app.listen(3000, () => {
    console.log('🚀 Server is listening on http://localhost:3000 💕');
})
