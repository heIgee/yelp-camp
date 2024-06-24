import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { LoremIpsum } from 'lorem-ipsum';

import cities from './cities.js';
import { places, descriptors } from './seedHelpers.js';
import Campground from '../models/Campground.js';

const seedQuantity = process.argv[2] || 16;

configDotenv();
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

mongoose.connect('mongodb://localhost:27017/YelpCamp', {});

const db = mongoose.connection;

db.on('error', (err) => console.error('Mongo failed:', err));
db.once('open', () => {
    console.log('Mongo connected');
});

const lorem = new LoremIpsum({
    sentencesPerParagraph: {
        max: 8,
        min: 4
    },
    wordsPerSentence: {
        max: 16,
        min: 4
    }
});

const sample = (array) => array[Math.floor(Math.random() * array.length)];

const fetchRandomCampgroundPhotos = async (count) => {
    try {
        const response = await fetch(`https://api.unsplash.com/photos/random?query=campground&orientation=landscape&count=${count}&client_id=${unsplashAccessKey}`);
        const data = await response.json();
        return data.map(photo => photo.urls.regular);
    } catch (error) {
        console.error('Error fetching photos from Unsplash:', error);
        return Array(count).fill('https://images.unsplash.com/photo-1503265192943-9d7eea6fc77a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D');
    }
};

const seedDB = async () => {
    await Campground.deleteMany({});

    const totalImages = seedQuantity * 3; // Maximum images needed
    const photos = await fetchRandomCampgroundPhotos(totalImages);
    let photoIndex = 0;

    for (let i = 0; i < seedQuantity; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const numImages = Math.ceil(Math.random() * 3);
        const images = [];

        for (let j = 0; j < numImages; j++) {
            images.push({
                url: photos[photoIndex++],
                filename: 'N/A'
            });
        }

        const numOfSentences = Math.ceil(Math.random() * 5) + 3;
        const description = lorem.generateSentences(numOfSentences);

        const campground = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            images: images,
            price: Math.ceil(Math.random() * 20) + 20,
            description: description,
            location: `${cities[random1000].city}, ${cities[random1000].state}`,
            // reviews: [], // does not work here, check schema's default
        });

        const res = await campground.save();
        console.log(res);
    }
};

seedDB().then(() => {
    console.log('Seed complete');
    mongoose.connection.close();
});
