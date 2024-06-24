import wrap from 'express-async-handler';
import Campground from '../models/Campground.js';

class CampgroundController {

    getIndex = wrap(async (req, res) => {
        const allCamps = await Campground.find();
        res.render('campgrounds/index', { campgrounds: allCamps });
    });

    create = wrap(async (req, res) => {
        const campground = new Campground(req.body.campground);
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
        console.log(req.body.campground);
        console.log(campgroundId);
        const { title, location, price, description } = req.body.campground;

        // await Campground.updateOne({ campgroundId }, req.body.campground);
        await Campground.updateOne({ _id: campgroundId }, {
            $set: {
                title: title, location: location, price: price, description: description
            }
        });

        req.flash('success', 'Your campground was updated');
        res.redirect(`/campgrounds/${campgroundId}`);
    });

    delete = wrap(async (req, res) => {
        const { id: campgroundId } = req.params;
        await Campground.deleteOne({ _id: campgroundId });

        req.flash('success', 'Your campground was deleted');
        res.redirect('/campgrounds');
    });
}

export default new CampgroundController();;
