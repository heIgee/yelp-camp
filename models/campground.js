import mongoose, { Schema } from 'mongoose';
import Review from './Review.js';
import { cloudinary } from '../cloudinary/index.js';

const imageSchema = new Schema({
    url: String,
    filename: String
});

imageSchema.virtual('thumbnail').get(function () {
    const url = this.url;
    const thumbnailSize = '200';

    if (url.includes('unsplash.com')) {
        const urlObj = new URL(url);
        urlObj.searchParams.set('w', thumbnailSize);
        return urlObj.toString();
    }
    else if (url.includes('cloudinary.com')) {
        return url.replace('/upload/', `/upload/w_${thumbnailSize}/`);
    }

    return url;
});

const campgroundSchema = new Schema({
    title: {
        type: String,
        required: true
    },
    images: [imageSchema],
    price: {
        type: Number,
        min: 0
    },
    description: String,
    location: String,
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

// 'deleteOne' will NOT work here
campgroundSchema.post('findOneAndDelete', async function (doc) {
    if (!doc) return;
    // Model.remove is deprecated
    await Review.deleteMany({
        _id: {
            $in: doc.reviews
        }
    });

    if (doc.images && doc.images.length) {
        for (let image of doc.images) {
            await cloudinary.uploader.destroy(image.filename);
        }
    }
});

const Campground = mongoose.model('Campground', campgroundSchema);

export default Campground;
