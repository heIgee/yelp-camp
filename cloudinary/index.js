import { v2 as cloudinary } from 'cloudinary';
import { CloudinaryStorage } from 'multer-storage-cloudinary';

import { configDotenv } from 'dotenv';

if (process.env.NODE_ENV !== 'production') {
    configDotenv();
}

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_KEY,
    api_secret: process.env.CLOUDINARY_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary,
    params: {
        folder: 'yelp-camp',
    }
});

export {
    cloudinary,
    storage
};