const Joi = require("joi");
const { createLanguage, updateLanguage } = require("../services/languageService");

const languageValidation = {
    createLanguage: (data) => {
        const schema = Joi.object({
            code: Joi.string().min(2).max(5).required(),
            name: Joi.string().min(3).max(255).required(),
            status: Joi.string().valid("active", "disabled").required(),
        });
        return schema.validate(data);
    },
    updateLanguage: (data) => {
        const schema = Joi.object({
            code: Joi.string().min(2).max(5),
            name: Joi.string().min(3).max(255),
            status: Joi.string().valid("active", "disabled"),
        });
        return schema.validate(data);
    },
}

module.exports = languageValidation;