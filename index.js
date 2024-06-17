import express from 'express';

import mongoose from 'mongoose';
import path from 'path';

import Campground from './models/campground.js'

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

app.get('/', async (req, res) => {
    const camp = new Campground({
        title: 'Backyard'
    });
    await camp.save();
    res.send(camp);
});

app.listen(3000, () => {
    console.log('🚀 Server is listening on http://localhost:3000 💕');
})
