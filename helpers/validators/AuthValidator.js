import Joi from "../JoiStrip.js";
import ExpressError from "../ExpressError.js";

class AuthValidator {

    static validator = Joi.object({
        user: Joi.object({
            username: Joi.string().htmlStrip().required(),
            email: Joi.string().email().htmlStrip().required(),
            password: Joi.string().htmlStrip().required(),
        }).required(),
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

export default AuthValidator;
