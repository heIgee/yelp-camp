import mongoose, { Schema } from 'mongoose';

const campgroundSchema = new Schema({
    title: {
        type: String,
    },
    price: {
        type: String,
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
