import Joi from "joi";
import ExpressError from "./ExpressError.js";

class ReviewValidator {

    static validator = Joi.object({
        review: Joi.object({
            rating: Joi.number().integer().min(1).max(5).required(),
            content: Joi.string().required(),
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

export default ReviewValidator;
