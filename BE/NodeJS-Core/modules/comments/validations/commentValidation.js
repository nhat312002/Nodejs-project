const {BodyWithLocale, ParamWithLocale, QueryWithLocale} = require("kernels/rules");

const getCommentById = [ParamWithLocale("commentId").notEmpty().isNumeric()];

const getCommentsByPost = [QueryWithLocale("postId").notEmpty().isNumeric()];

const createComment = [
    QueryWithLocale("postId").notEmpty().isNumeric(),
    BodyWithLocale("content").notEmpty().isLength({max: 1000}),
    QueryWithLocale("parentId").optional().isNumeric(),
];

const updateComment = [
    ParamWithLocale("commentId").notEmpty().isNumeric(),
    BodyWithLocale("content").notEmpty().isLength({max: 1000}),
];

const deleteComment = [ParamWithLocale("commentId").notEmpty().isNumeric()];

module.exports = {
    getCommentById,
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment,
};
