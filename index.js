import { configDotenv } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    configDotenv();
}

import express from 'express';
import mongoose from 'mongoose';
import mongoSanitize from 'express-mongo-sanitize';
import path from 'path';
import methodOverride from 'method-override';
import expressEjsLayouts from 'express-ejs-layouts';
import session from 'express-session';
import flash from 'connect-flash';
import passport from 'passport';
import LocalStrategy from 'passport-local';
import MongoStore from 'connect-mongo';

import User from './models/User.js';

import ExpressError from './helpers/ExpressError.js';

import campgroundsRouter from './routes/campgroundsRouter.js';
import reviewsRouter from './routes/reviewsRouter.js';
import authRouter from './routes/authRouter.js';

const app = express();


// mongo

const dbUrl = process.env.NODE_ENV === 'production'
    ? process.env.ATLAS_URL
    : 'mongodb://localhost:27017/YelpCamp';

mongoose.connect(dbUrl, {});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('Mongo failed:', err);
});

db.once('open', () => {
    console.log('Mongo connected');
});


// settings

const __dirname = import.meta.dirname;

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.set('layout', 'layouts/layout');
app.set('layout extractScripts', true);
app.set('layout extractStyles', true);


// middleware

app.use(expressEjsLayouts);

// app.use(helmet({
//     // TODO set up CSP
//     contentSecurityPolicy: {}
// }));

app.use(
    mongoSanitize({
        replaceWith: '_',
    }),
);

const sessionConfig = {
    name: 'campfire',
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        // secure: !!(process.env.NODE_ENV === 'production'), TODO: breaks auth (cookie not sent)
        maxAge: 1000 * 60 * 60 * 24
    },
    store: MongoStore.create({
        mongoUrl: dbUrl,
        touchAfter: 24 * 3600, // in seconds

    })
};

// must be before passport.session()
app.use(session(sessionConfig));

app.use(flash());

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use(methodOverride('_method'));
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
    console.log(`${req.method} ${req.originalUrl} {${req.user?.username}}`);
    res.locals.user = req.user;
    res.locals.successFlash = req.flash('success');
    res.locals.errorFlash = req.flash('error');
    return next();
});


// routers

app.use('/campgrounds', campgroundsRouter);
app.use('/campgrounds/:id/reviews', reviewsRouter);
app.use('/', authRouter);

app.get('/', (req, res) => {
    res.render('home');
});

app.all('*', (res, req, next) => {
    throw new ExpressError(404, 'Page Not Found');
});

app.use((err, req, res, next) => {
    if (typeof err === 'string' || err instanceof String) {
        return res.status(500).send(err);
    }
    err.status ||= 500;
    err.message ||= 'Went Bananas!';
    res.status(err.status).render('error', { err });
});

const port = process.env.PORT || 80;

app.listen(port, () => {
    if (process.env.NODE_ENV === 'production') {
        console.log(`🚀 Server is listening on ${port} [production] 💕`);
    }
    else {
        console.log(`🚀 Server is listening on http://localhost:${port} [development] 💕`);
    }
});
