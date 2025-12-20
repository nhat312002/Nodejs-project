const { Joi } = require("kernels/validations");

const languageValidation = {
    getAllLanguages: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1).messages({
                'number.base': 'Page must be a number.',
                'number.integer': 'Page must be an integer.',
                'number.min': 'Page must be at least {#limit}.'
            }),
            limit: Joi.number().integer().min(1).max(100).default(10).messages({
                'number.base': 'Limit must be a number.',
                'number.integer': 'Limit must be an integer.',
                'number.min': 'Limit must be at least {#limit}.',
                'number.max': 'Limit cannot be more than {#limit}.'
            }),
            name: Joi.string().max(255).optional().messages({
                'string.base': 'Name must be a string.',
                'string.max': 'Name cannot be more than {#limit} characters long.'
            }),
            locale: Joi.string().max(10).optional().messages({
                'string.base': 'Locale must be a string.',
                'string.max': 'Locale cannot be more than {#limit} characters long.'
            }),
            status: Joi.number().valid(0, 1).optional().messages({
                'number.base': 'Status must be a number.',
                'any.only': 'Status must be either 0 (inactive) or 1 (active).'
            }),
        })
    },

    getLanguageById: {
        params: Joi.object({
            languageId: Joi.number().integer().positive().required().messages({
                'number.base': 'Language ID must be a number.',
                'number.integer': 'Language ID must be an integer.',
                'number.positive': 'Language ID must be a positive number.',
                'any.required': 'Language ID is a required parameter.'
            }),
        })
    },

    createLanguage: {
        body: Joi.object({
            locale: Joi.string().min(2).max(5).required().messages({
                'string.base': 'Locale must be a string.',
                'string.empty': 'Locale cannot be empty.',
                'string.min': 'Locale must be at least {#limit} characters long.',
                'string.max': 'Locale cannot be more than {#limit} characters long.',
                'any.required': 'Locale is a required field.'
            }),
            name: Joi.string().min(3).max(255).required().messages({
                'string.base': 'Name must be a string.',
                'string.empty': 'Name cannot be empty.',
                'string.min': 'Name must be at least {#limit} characters long.',
                'string.max': 'Name cannot be more than {#limit} characters long.',
                'any.required': 'Name is a required field.'
            }),
            status: Joi.string().valid("1", "0").required().messages({
                'string.base': 'Status must be a string.',
                'any.only': 'Status must be either "1" (active) or "0" (inactive).',
                'any.required': 'Status is a required field.'
            }),
            url_flag: Joi.string().optional(),
        }),
    },

    updateLanguage: {
        // I've added .min(1) to the object to ensure at least one field is provided for an update.
        body: Joi.object({
            locale: Joi.string().min(2).max(5).messages({
                'string.base': 'Locale must be a string.',
                'string.min': 'Locale must be at least {#limit} characters long.',
                'string.max': 'Locale cannot be more than {#limit} characters long.'
            }),
            name: Joi.string().min(3).max(255).messages({
                'string.base': 'Name must be a string.',
                'string.min': 'Name must be at least {#limit} characters long.',
                'string.max': 'Name cannot be more than {#limit} characters long.'
            }),
            status: Joi.string().valid("1", "0").messages({
                'string.base': 'Status must be a string.',
                'any.only': 'Status must be either "1" (active) or "0" (inactive).'
            }),
            url_flag: Joi.string().optional(),
        }).min(1).messages({
            'object.min': 'At least one field (locale, name, or status) must be provided to update.'
        }),  
    },

    toggleLanguageStatus: {
        params: Joi.object({
            languageId: Joi.number().integer().positive().required().messages({
                'number.base': 'Language ID must be a number.',
                'number.integer': 'Language ID must be an integer.',
                'number.positive': 'Language ID must be a positive number.',
                'any.required': 'Language ID is a required parameter.'
            }),
        })
    },
}

module.exports = languageValidation;