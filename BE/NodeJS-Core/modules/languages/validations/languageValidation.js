const { Joi } = require("kernels/validations");

const languageValidation = {
    getAllLanguages: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            name: Joi.string().max(255).optional(),
            status: Joi.number().valid(0, 1).optional(),
        })
    },

    getLanguageById: {
        params: Joi.object({
            languageId: Joi.number().integer().positive().required(),
        })
    },

    createLanguage: {
        body: Joi.object({
            locale: Joi.string().min(2).max(5).required(),
            name: Joi.string().min(3).max(255).required(),
            url_flag: Joi.string().uri().required(),
            status: Joi.string().valid("1", "0").required(),
        })
    },

    updateLanguage: {
        body: Joi.object({
            locale: Joi.string().min(2).max(5),
            name: Joi.string().min(3).max(255),
            url_flag: Joi.string().uri(),
            status: Joi.string().valid("1", "0"),
        })
    },

    toggleLanguageStatus: this.getLanguageById
}

module.exports = languageValidation;