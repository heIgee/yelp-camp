import express from 'express';
import mongoose from 'mongoose';
import path from 'path';
import methodOverride from 'method-override';
import expressEjsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';

import ExpressError from './helpers/ExpressError.js';

import campgroundsRouter from './routes/campgrounds.js';

const app = express();

mongoose.connect('mongodb://localhost:27017/YelpCamp', {

});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('Mongo failed:', err);
});

db.once('open', () => {
    console.log('Mongo connected');
});

const __dirname = import.meta.dirname;

// middleware

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('layout', 'layouts/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);

app.use(expressEjsLayouts);

const sessionConfig = {
    secret: 'wetbananas',
    resave: false,
    saveUninitialized: true,
    cookie: {
        httpOnly: true,
        maxAge: 1000 * 60 * 60 * 24
    }
    // store: redisStore // TODO
}
app.use(session(sessionConfig));

app.use(flash());

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    res.locals.successFlash = req.flash('success');
    res.locals.errorFlash = req.flash('error');
    return next();
})

// routers

app.use('/', campgroundsRouter);

app.get('/', (req, res) => {
    req.flash('success', 'You are being redirected!');
    res.redirect('/campgrounds');
});

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
