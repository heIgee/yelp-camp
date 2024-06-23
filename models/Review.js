import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
    rating: {
        type: Number,
        min: 1,
        max: 5,
    },
    content: {
        type: String,
        trim: true,
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    },
    author: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
