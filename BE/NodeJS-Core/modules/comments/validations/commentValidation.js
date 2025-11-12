const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require("kernels/rules");
const { Joi } = require("kernels/validations");

const getCommentById = {
    params: Joi.object({
        "commentId": Joi.number().integer().required()
    })
};
const getCommentsByPost = {
    query: Joi.object({
        "postId": Joi.number().integer().required()
    })
};
const createComment = {
    query: Joi.object({
        "postId": Joi.number().integer().required(),
        "parentId": Joi.number().integer().optional()
    }),
    body: Joi.object({
        "content": Joi.string().trim().max(2000).required()
    })
};

const updateComment = {
    params: Joi.object({
        "commentId": Joi.number().integer().required(),
    }),
    body: Joi.object({
        "content": Joi.string().trim().max(2000).required()
    })
};

const deleteComment = {
    params: Joi.object({
        "commentId": Joi.number().integer().required()
    })
};
module.exports = {
    getCommentById,
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment,
};
