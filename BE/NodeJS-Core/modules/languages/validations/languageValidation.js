const Joi = require("joi");

const languageValidation = {
    createLanguage: (data) => {
        const schema = Joi.object({
            locale: Joi.string().min(2).max(5).required(),
            name: Joi.string().min(3).max(255).required(),
            status: Joi.string().valid("active", "disabled").required(),
            url_flag: Joi.string().required()
        });
        return schema.validate(data);
    },
    updateLanguage: (data) => {
        const schema = Joi.object({
            locale: Joi.string().min(2).max(5),
            name: Joi.string().min(3).max(255),
            status: Joi.string().valid("active", "disabled"),
            url_flag: Joi.string()
        });
        return schema.validate(data);
    },
}

module.exports = languageValidation;