import mongoose, { Schema } from 'mongoose';
import Review from './Review.js';

const campgroundSchema = new Schema({
    title: {
        type: String,
    },
    images: {
        type: [
            {
                url: String,
                filename: String
            }
        ]
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
    owner: {
        type: Schema.Types.ObjectId,
        ref: 'User'
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

campgroundSchema.static('populateDocument', async function (campground) {
    return this.populate(campground, [
        {
            path: 'reviews',
            populate: {
                path: 'author'
            }
        },
        { path: 'owner' }
    ]);
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
