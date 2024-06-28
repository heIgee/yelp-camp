import sanitize from 'sanitize-html';
import Joi from 'joi';

const Joix = Joi.extend((joi) => ({
    type: "string",
    base: joi.string(),
    messages: {
        "string.htmlStrip": "{{#label}} must not contain any html tags"
    },
    rules: {
        htmlStrip: {
            validate(value, helpers) {
                const clean = sanitize(value, {
                    allowedTags: [],
                    allowedAttributes: {},
                });
                if (clean === value) {
                    return clean;
                }
                return helpers.error("string.htmlStrip", { value });
            }
        }
    }
}));

export default Joix;
