import mongoose, { Schema } from 'mongoose';

const campgroundSchema = new Schema({
    title: {
        type: String,
    },
    imagePath: {
        type: String,
    },
    price: {
        type: Number,
    },
    description: {
        type: String,
    },
    location: {
        type: String,
    },
});

const Campground = mongoose.model('Campground', campgroundSchema);

export default Campground;
