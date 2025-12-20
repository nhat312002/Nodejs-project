const { Joi } = require("kernels/validations");


const categoryValidation = {
    getAllCategories: {
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
            name: Joi.string().trim().max(255).optional().messages({
                'string.base': 'Name must be a string.',
                'string.max': 'Name cannot be more than {#limit} characters long.'
            }),
            status: Joi.number().valid(0, 1).optional().messages({
                'number.base': 'Status must be a number.',
                'any.only': 'Status must be either 0 (inactive) or 1 (active).'
            }),
        })
    },

    getCategoryById: {
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required().messages({
                'number.base': 'Category ID must be a number.',
                'number.integer': 'Category ID must be an integer.',
                'number.positive': 'Category ID must be a positive number.',
                'any.required': 'Category ID is a required parameter.'
            }),
        })
    },

    createCategory: {
        body: Joi.object({
            name: Joi.string().trim().min(3).max(255).required().messages({
                'string.base': 'Name must be a string.',
                'string.empty': 'Name cannot be empty.',
                'string.min': 'Name must be at least {#limit} characters long.',
                'string.max': 'Name cannot be more than {#limit} characters long.',
                'any.required': 'Name is a required field.'
            }),
            status: Joi.string().trim().valid("1", "0").required().messages({
                'string.base': 'Status must be a string.',
                'any.only': 'Status must be either "1" (active) or "0" (inactive).',
                'any.required': 'Status is a required field.'
            }),
        })
    },

    updateCategory: {
        body: Joi.object({
            name: Joi.string().trim().min(3).max(30).messages({
                'string.base': 'Name must be a string.',
                'string.empty': 'Name cannot be empty.',
                'string.min': 'Name must be at least {#limit} characters long.',
                'string.max': 'Name cannot be more than {#limit} characters long.',
                'any.required': 'Name is a required field.'
            }),
            status: Joi.string().trim().valid("1", "0").messages({
                'string.base': 'Status must be a string.',
                'any.only': 'Status must be either "1" (active) or "0" (inactive).'
            }),
        }).min(1).messages({
            'object.min': 'At least one field (name or status) must be provided to update.'
        }),
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required().messages({
                'number.base': 'Category ID must be a number.',
                'number.integer': 'Category ID must be an integer.',
                'number.positive': 'Category ID must be a positive number.',
                'any.required': 'Category ID is a required parameter.'
            }),
        })
    },

    toggleCategoryStatus : {
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required().messages({
                'number.base': 'Category ID must be a number.',
                'number.integer': 'Category ID must be an integer.',
                'number.positive': 'Category ID must be a positive number.',
                'any.required': 'Category ID is a required parameter.'
            }),
        })
    },
}

module.exports = categoryValidation;