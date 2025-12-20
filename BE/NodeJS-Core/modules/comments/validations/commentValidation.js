const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require("kernels/rules");
const { Joi } = require("kernels/validations");

const getCommentById = {
    params: Joi.object({
        "commentId": Joi.number().integer().required().messages({
            'number.base': 'Comment ID must be a number.',
            'number.integer': 'Comment ID must be an integer.',
            'any.required': 'Comment ID is a required parameter.'
        })
    })
};

const getReplies = {
    // 1. Route Param: /comments/:commentId/replies
    params: Joi.object({
        "commentId": Joi.number().integer().required().messages({
            'number.base': 'Parent Comment ID must be a number.',
            'number.integer': 'Parent Comment ID must be an integer.',
            'any.required': 'Parent Comment ID is a required parameter.'
        })
    }),
    
    // 2. Query Params: ?cursor=123&limit=5
    query: Joi.object({
        "cursor": Joi.number().integer().optional().messages({
            'number.base': 'Cursor must be a number.',
            'number.integer': 'Cursor must be an integer.'
        }),
        "limit": Joi.number().integer().min(1).max(100).optional().messages({
            'number.base': 'Limit must be a number.',
            'number.integer': 'Limit must be an integer.',
            'number.min': 'Limit must be at least 1.',
            'number.max': 'Limit cannot exceed 100.'
        })
    })
};

const getCommentsByPost = {
    query: Joi.object({
        "postId": Joi.number().integer().required().messages({
            'number.base': 'Post ID must be a number.',
            'number.integer': 'Post ID must be an integer.',
            'any.required': 'Post ID is a required query parameter.'
        }),
        "cursor": Joi.number().integer().optional().messages({
            'number.base': 'Cursor must be a number.',
            'number.integer': 'Cursor must be an integer.'
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

const createComment = {
    body: Joi.object({
        "content": Joi.string().trim().max(2000).required().messages({
            'string.base': 'Content must be a string.',
            'string.empty': 'Content cannot be empty.',
            'string.max': 'Content cannot be more than {#limit} characters long.',
            'any.required': 'Content is a required field.'
        }),
        "postId": Joi.number().integer().required().messages({
            'number.base': 'Post ID must be a number.',
            'number.integer': 'Post ID must be an integer.',
            'any.required': 'Post ID is a required query parameter.'
        }),
        "parentId": Joi.number().integer().optional().messages({
            'number.base': 'Parent ID must be a number.',
            'number.integer': 'Parent ID must be an integer.'
        })
    })
};

const updateComment = {
    params: Joi.object({
        "commentId": Joi.number().integer().required().messages({
            'number.base': 'Comment ID must be a number.',
            'number.integer': 'Comment ID must be an integer.',
            'any.required': 'Comment ID is a required parameter.'
        }),
    }),
    body: Joi.object({
        "content": Joi.string().trim().max(2000).required().messages({
            'string.base': 'Content must be a string.',
            'string.empty': 'Content cannot be empty.',
            'string.max': 'Content cannot be more than {#limit} characters long.',
            'any.required': 'Content is a required field.'
        })
    })
};

const deleteComment = {
    params: Joi.object({
        "commentId": Joi.number().integer().required().messages({
            'number.base': 'Comment ID must be a number.',
            'number.integer': 'Comment ID must be an integer.',
            'any.required': 'Comment ID is a required parameter.'
        })
    })
};

module.exports = {
    getCommentById,
    getCommentsByPost,
    getReplies,
    createComment,
    updateComment,
    deleteComment,
};