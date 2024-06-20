import mongoose, { Schema } from 'mongoose';
import Review from './Review.js';

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
    reviews: {
        type: [
            {
                type: Schema.Types.ObjectId,
                ref: 'Review'
            }
        ],
        default: []
    }
});

campgroundSchema.post(['findOneAndDelete', 'deleteOne'], async function (doc) {
    if (!doc) return;
    // Model.remove is deprecated
    await Review.deleteMany({
        _id: {
            $in: doc.reviews
        }
    });
});

const Campground = mongoose.model('Campground', campgroundSchema);

export default Campground;
