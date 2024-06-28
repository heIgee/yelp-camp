import Joi from "../JoiStrip.js";
import ExpressError from "../ExpressError.js";

class CampgroundValidator {

    static validator = Joi.object({
        campground: Joi.object({
            title: Joi.string().htmlStrip().required(),
            // TODO images validation
            price: Joi.number().positive().required(),
            description: Joi.string().htmlStrip().required(),
            location: Joi.string().htmlStrip().required(),
        }).required(),
        deleteImages: Joi.array()
    });

    static test = (req, res, next) => {
        const { error } = this.validator.validate(req.body);
        if (error) {
            throw new ExpressError(400, error.details.map(d => d.message).join(', '));
        }
        else {
            return next();
        }
    };
}

export default CampgroundValidator;
