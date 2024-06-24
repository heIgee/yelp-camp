import Joi from "joi";
import ExpressError from "./ExpressError.js";

class CampgroundValidator {

    static validator = Joi.object({
        campground: Joi.object({
            title: Joi.string().required(),
            // image: Joi.array().items(Joi.object({
            //     url: Joi.string().uri(),
            //     filename: Joi.string()
            // })),
            // imagePath: Joi.string().uri().required(),
            price: Joi.number().positive().required(),
            description: Joi.string().required(),
            location: Joi.string().required(),
        }).required()
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
