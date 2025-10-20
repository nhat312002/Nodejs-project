const Joi = require("joi");

const languageValidation = {
    createLanguage: (data) => {
        const schema = Joi.object({
            locale: Joi.string().min(2).max(5).required(),
            name: Joi.string().min(3).max(255).required(),
            url_flag: Joi.string().uri().required(),
            status: Joi.string().valid("active", "disabled").required(),
        });
        return schema.validate(data);
    },
    updateLanguage: (data) => {
        const schema = Joi.object({
            locale: Joi.string().min(2).max(5),
            name: Joi.string().min(3).max(255),
            url_flag: Joi.string().uri(),
            status: Joi.string().valid("active", "disabled"),
        });
        return schema.validate(data);
    },
}

module.exports = languageValidation;