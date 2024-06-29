import wrap from 'express-async-handler';
import mbxGeocoding from '@mapbox/mapbox-sdk/services/geocoding.js';
import Campground from '../models/Campground.js';
import { cloudinary } from '../cloudinary/index.js';

const geocoder = mbxGeocoding({ accessToken: process.env.MAPBOX_TOKEN });

class CampgroundController {

    getIndex = wrap(async (req, res) => {
        const allCamps = await Campground.find();
        res.render('campgrounds/index', { campgrounds: allCamps });
    });

    create = wrap(async (req, res) => {
        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        const campground = new Campground(req.body.campground);
        campground.geometry = geoData.body.features[0].geometry;
        campground.images = req.files.map(f => ({ url: f.path, filename: f.filename }));
        campground.owner = req.user._id;
        await campground.save();
        req.flash('success', 'Your campground was created');
        res.redirect(`/campgrounds/${campground._id}`);
    });

    getNew = (req, res) => {
        res.render('campgrounds/new');
    };

    show = wrap(async (req, res) => {
        const campground = await Campground.populateDocument(res.locals.campground);
        res.render('campgrounds/show', { campground });
    });

    edit = wrap(async (req, res) => {
        const campground = res.locals.campground;
        res.render('campgrounds/edit', { campground });
    });

    update = wrap(async (req, res) => {
        const { id: campgroundId } = req.params;
        const { title, location, price, description } = req.body.campground;

        const geoData = await geocoder.forwardGeocode({
            query: req.body.campground.location,
            limit: 1
        }).send();
        const geometry = geoData.body.features[0].geometry;

        await Campground.updateOne(
            { _id: campgroundId },
            {
                $set: {
                    title, location, price, description, geometry
                }
            }
        );

        if (req.files && req.files.length) {
            await Campground.updateOne(
                { _id: campgroundId },
                {
                    $push: {
                        images: {
                            $each: req.files.map(f => ({ url: f.path, filename: f.filename }))
                        }
                    }
                }
            );
        }

        if (req.body.deleteImages && req.body.deleteImages.length > 0) {
            for (let filename of req.body.deleteImages) {
                await cloudinary.uploader.destroy(filename);
            }
            await Campground.updateOne(
                { _id: campgroundId },
                {
                    $pull: {
                        images: {
                            filename: {
                                $in: req.body.deleteImages
                            }
                        }
                    }
                }
            );
        }

        req.flash('success', 'Your campground was updated');
        res.redirect(`/campgrounds/${campgroundId}`);
    });

    delete = wrap(async (req, res) => {
        const { id: campgroundId } = req.params;
        await Campground.findOneAndDelete({ _id: campgroundId });

        req.flash('success', 'Your campground was deleted');
        res.redirect('/campgrounds');
    });
}

export default new CampgroundController();
