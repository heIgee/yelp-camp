import { configDotenv } from 'dotenv';
import mongoose from 'mongoose';
import fetch from 'node-fetch';
import { LoremIpsum } from 'lorem-ipsum';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';

import cities from './cities.js';
import { places, descriptors } from './seedHelpers.js';
import Campground from '../models/Campground.js';

const seedQuantity = process.argv[2] || 16;

configDotenv();
const unsplashAccessKey = process.env.UNSPLASH_ACCESS_KEY;

// const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

mongoose.connect('mongodb://localhost:27017/YelpCamp', {});

const db = mongoose.connection;

db.on('error', (err) => {
    console.error('Mongo failed:', err);
});

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
    const photos = [];
    const requests = Math.ceil(count / 30);

    for (let i = 0; i < requests; i++) {
        const fetchCount = (i === requests - 1) ? count % 30 : 30;
        try {
            const response = await fetch(`https://api.unsplash.com/photos/random?query=campground&orientation=landscape&count=${fetchCount}&client_id=${unsplashAccessKey}`);
            const data = await response.json();
            photos.push(...data.map(photo => photo.urls.regular));
        } catch (error) {
            console.error('Error fetching photos from Unsplash:', error);
            photos.push(...Array(fetchCount).fill('https://images.unsplash.com/photo-1503265192943-9d7eea6fc77a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D'));
        }
    }

    return photos;
};

const seedDB = async () => {
    await Campground.deleteMany({});
    const maxImages = 4;

    const totalImages = seedQuantity * maxImages; // Maximum images needed
    const photos = await fetchRandomCampgroundPhotos(totalImages);
    let photoIndex = 0;

    for (let i = 0; i < seedQuantity; i++) {
        const random1000 = Math.floor(Math.random() * 1000);
        const numImages = Math.ceil(Math.random() * maxImages);
        const images = [];

        for (let j = 0; j < numImages; j++) {
            images.push({
                url: photos[photoIndex++],
                filename: 'N/A'
            });
        }

        const randomCity = cities[random1000];
        const location = `${randomCity.city}, ${randomCity.state}`;
        const geometry = {
            type: 'Point',
            coordinates: [
                randomCity.longitude,
                randomCity.latitude
            ]
        };

        // unnecessary requests
        // const geoData = await geocoder.forwardGeocode({
        //     query: location,
        //     limit: 1
        // }).send();

        const numOfSentences = Math.ceil(Math.random() * 5) + 3;
        const description = lorem.generateSentences(numOfSentences);

        const campground = new Campground({
            title: `${sample(descriptors)} ${sample(places)}`,
            images: images,
            price: Math.ceil(Math.random() * 20) + 20,
            description: description,
            location: location,
            geometry: geometry // geoData.body.features[0].geometry
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
