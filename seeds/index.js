import mongoose from 'mongoose';
import fetch from 'node-fetch';
import cities from './cities.js';
import { places, descriptors } from './seedHelpers.js';
import Campground from '../models/Campground.js';

const seedQuantity = process.argv[2] || 16;
const unsplashAccessKey = 'eSIt3-UvqEnbd5kNmYwLrEP0I1aSl0ACBUFhf6TgibY';

mongoose.connect('mongodb://localhost:27017/YelpCamp', {});

const db = mongoose.connection;

db.on('error', (err) => console.error('Mongo failed:', err));
db.once('open', () => {
    console.log('Mongo connected');
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const fetchRandomCampgroundPhoto = async () => {
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=campground&orientation=landscape&client_id=${unsplashAccessKey}`);
        const data = await response.json();
        return data.urls.regular;
    } catch (error) {
        console.error('Error fetching photo from Unsplash:', error);
        return 'https://images.unsplash.com/photo-1503265192943-9d7eea6fc77a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D';
    }
};

const seedDB = async () => {
    await Campground.deleteMany({});
    for (let i = 0; i < seedQuantity; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const camp = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            imagePath: await fetchRandomCampgroundPhoto(),
            price: Math.ceil(Math.random() * 20) + 20,
            description: 'Lorem ipsum dolor sit, amet consectetur adipisicing elit. Totam, eum.',
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // reviews: [], // does not work here, check schema's default
        });
        const res = await camp.save();
        console.log(res);
    }
};

seedDB().then(() => {
    console.log('Seed complete');
    mongoose.connection.close();
});
