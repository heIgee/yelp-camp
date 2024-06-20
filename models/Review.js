import mongoose, { Schema } from 'mongoose';

const reviewSchema = new Schema({
    rating: {
        type: Number,
        min: 0,
        max: 10,
    },
    content: {
        type: String,
        trim: true,
    },
    campground: {
        type: Schema.Types.ObjectId,
        ref: 'Campground'
    }
});

const Review = mongoose.model('Review', reviewSchema);

export default Review;
