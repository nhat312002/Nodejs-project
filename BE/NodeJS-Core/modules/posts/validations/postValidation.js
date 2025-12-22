const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require("kernels/rules");
const { Joi } = require("kernels/validations");
const language = require("models/language");

const getPostById = {
    params: Joi.object({
        "postId": Joi.number().integer().required().messages({
            'number.base': 'Post ID must be a number.',
            'number.integer': 'Post ID must be an integer.',
            'any.required': 'Post ID is required.'
        })
    })
};

const disablePost = {
    params: Joi.object({
        "postId": Joi.number().integer().required().messages({
            'number.base': 'Post ID must be a number.',
            'number.integer': 'Post ID must be an integer.',
            'any.required': 'Post ID is required.'
        })
    })
};

const getPosts = {
    query: Joi.object({
        "userId": Joi.number().integer().optional().messages({
            'number.base': 'User ID must be a number.',
            'number.integer': 'User ID must be an integer.'
        }),
        "languageId": Joi.number().integer().optional().messages({
            'number.base': 'Language ID must be a number.',
            'number.integer': 'Language ID must be an integer.'
        }),
        "locale": Joi.string().trim().pattern(/^[a-z]{2}(-[A-Z]{2})?$/).optional().messages({
            'string.base': 'Locale must be a string.',
            'string.pattern.base': 'Locale format must be xx hoặc xx-XX (e.g: vi, en-US)'
        }),
        "categoryIds": Joi.optional().custom((value, helpers) => {
            if (value === "other") return "other";
            if (typeof value === "string") {
                const ids = value
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter((v) => !Number.isNaN(v));
                if (ids.length === 0) {
                    return helpers.message("Category IDs must contain valid numbers.");
                }
                return ids;
            }
            if (Array.isArray(value)) return value;
            return helpers.message("Category IDs must be an array or a comma-separated string of numbers.");
        }),
        "originalId": Joi.number().integer().optional().messages({
            'number.base': 'Original ID must be a number.',
            'number.integer': 'Original ID must be an integer.'
        }),
        "status": Joi.string().valid("1", "2", "3").optional().messages({
            'any.only': 'Status must be one of [1, 2, 3].'
        }),
        "categoryMatchAll": Joi.boolean().optional().messages({
            'boolean.base': 'categoryMatchAll must be a boolean (true).'
        }),
        "title": Joi.string().trim().optional().messages({
            'string.base': 'Title must be a string.'
        }),
        "text": Joi.string().trim().optional().messages({
            'string.base': 'Text must be a string.'
        }),
        "userFullName": Joi.string().trim().optional().messages({
            'string.base': 'User full name must be a string.'
        }),
        "sort": Joi.string().trim().valid("date_asc", "date_desc", "title_asc", "title_desc", "relevance").optional().messages({
            'string.base': 'Sort value must be a string.',
            'any.only': 'Sort must be one of [date_asc, date_desc, title_asc, title_desc, relevance].'
        }),
        "page": Joi.number().integer().positive().optional().messages({
            'number.base': 'Page must be a number.',
            'number.integer': 'Page must be an integer.',
            'number.positive': 'Page must be a positive number'
        }),
        "limit": Joi.number().integer().positive().optional().messages({
            'number.base': 'Limit must be a number.',
            'number.integer': 'Limit must be an integer.',
            'number.positive': 'Limit must be a positive number'
        }),
    })
};

const createPost = {
    body: Joi.object({
        "title": Joi.string().trim().min(3).max(255).required().messages({
            'string.base': 'Title must be a string.',
            'string.empty': 'Title cannot be empty.',
            'string.min': 'Title must be at least {#limit} characters long.',
            'string.max': 'Title cannot be more than {#limit} characters long.',
            'any.required': 'Title is required.'
        }),
        "body": Joi.string().trim().min(10).max(60000).required().messages({
            'string.base': 'Body must be a string.',
            'string.empty': 'Body cannot be empty.',
            'string.min': 'Body must be at least {#limit} characters long.',
            'string.max': 'Body cannot be more than {#limit} characters long.',
            'any.required': 'Body is required.'
        }),
        "languageId": Joi.number().integer().required().messages({
            'number.base': 'Language ID must be a number.',
            'number.integer': 'Language ID must be an integer.',
            'any.required': 'Language ID is required.'
        }),
        categoryIds: Joi.optional().custom((value, helpers) => {
            // 1. Handle String (FormData: "1, 2")
            if (typeof value === "string") {
                if (!value.trim()) return []; // Handle empty string gracefully

                const ids = value
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter((v) => !Number.isNaN(v) && v > 0); // Ensure valid positive IDs

                if (ids.length === 0 && value.trim().length > 0) {
                    return helpers.message("Category IDs must contain valid numbers.");
                }
                return ids;
            }

            // 2. Handle Array (JSON: [1, 2])
            if (Array.isArray(value)) {
                // Optional: Ensure all items in array are numbers
                const isValid = value.every(item => Number.isInteger(item) && item > 0);
                if (!isValid) return helpers.message("Category IDs must be an array of integers.");
                return value;
            }

            return helpers.message("Category IDs must be an array or a comma-separated string.");
        }),
        "url_thumbnail": Joi.string().trim().uri().optional().allow(null, '').messages({
            'string.uri': 'Avatar URL must be a valid URI.',
            'string.max': 'Avatar URL must not exceed 255 characters.',
            'string.base': 'Avatar URL must be a string.',
        }),
        "excerpt": Joi.optional(),
    })
};

const updatePost = {
    params: Joi.object({
        "postId": Joi.number().integer().required().messages({
            'number.base': 'Post ID must be a number.',
            'number.integer': 'Post ID must be an integer.',
            'any.required': 'Post ID is required.'
        })
    }),
    body: Joi.object({
        "title": Joi.string().trim().min(3).max(225).optional().messages({
            'string.base': 'Title must be a string.',
            'string.min': 'Title must be at least {#limit} characters long.',
            'string.max': 'Title cannot be more than {#limit} characters long.'
        }),
        "body": Joi.string().trim().min(10).max(60000).optional().messages({
            'string.base': 'Body must be a string.',
            'string.min': 'Body must be at least {#limit} characters long.',
            'string.max': 'Body cannot be more than {#limit} characters long.'
        }),
        "languageId": Joi.number().integer().optional().messages({
            'number.base': 'Language ID must be a number.',
            'number.integer': 'Language ID must be an integer.',
        }),
        "categoryIds": Joi.optional().custom((value, helpers) => {
            // 1. Handle String (FormData: "1, 2")
            if (typeof value === "string") {
                if (!value.trim()) return []; // Handle empty string gracefully

                const ids = value
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter((v) => !Number.isNaN(v) && v > 0); // Ensure valid positive IDs

                if (ids.length === 0 && value.trim().length > 0) {
                    return helpers.message("Category IDs must contain valid numbers.");
                }
                return ids;
            }

            // 2. Handle Array (JSON: [1, 2])
            if (Array.isArray(value)) {
                // Optional: Ensure all items in array are numbers
                const isValid = value.every(item => Number.isInteger(item) && item > 0);
                if (!isValid) return helpers.message("Category IDs must be an array of integers.");
                return value;
            }

            return helpers.message("Category IDs must be an array or a comma-separated string.");
        }),
        "url_thumbnail": Joi.string().trim().uri().optional().allow(null, '').messages({
            'string.uri': 'Avatar URL must be a valid URI.',
            'string.max': 'Avatar URL must not exceed 255 characters.',
            'string.base': 'Avatar URL must be a string.',
        }),
        "excerpt": Joi.optional(),
        "language_id": Joi.optional(),
        "deleteThumbnail": Joi.boolean().optional(),
    }).min(1).messages({
        'object.min': 'At least one field (title, body, or categoryIds) must be provided to update.'
    }),
};

const setPostStatus = {
    params: Joi.object({
        "postId": Joi.number().integer().required().messages({
            'number.base': 'Post ID must be a number.',
            'number.integer': 'Post ID must be an integer.',
            'any.required': 'Post ID is required.'
        })
    }),
    body: Joi.object({
        "status": Joi.string().valid("2", "3").required().messages({
            'any.only': 'Status must be one of [2, 3].',
            'any.required': 'Status is required.'
        })
    })
};

module.exports = {
    getPostById,
    getPosts,
    createPost,
    updatePost,
    disablePost,
    setPostStatus,
};