import mongoose from 'mongoose';
import Campground from '../models/Campground.js';

mongoose.connect('mongodb://localhost:27017/YelpCamp', {

});

async function updateNAImages() {
    const campgrounds = await Campground.find({ 'images.filename': 'N/A' });

    campgrounds.forEach(async (campground) => {
        let updated = false;

        campground.images.forEach((image) => {
            if (image.filename === 'N/A') {
                image.filename = new mongoose.Types.ObjectId().toString();
                updated = true;
            }
        });

        if (updated) {
            await campground.save();
        }
    });

    console.log('Update completed.');
}

await updateNAImages().catch(err => console.error(err));
