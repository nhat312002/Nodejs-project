const {BodyWithLocale, ParamWithLocale, QueryWithLocale} = require("kernels/rules");

const getCommentById = [new ParamWithLocale("commentId").notEmpty().isNumeric()];

const getCommentsByPost = [new QueryWithLocale("postId").notEmpty().isNumeric()];

const createComment = [
    new QueryWithLocale("postId").notEmpty().isNumeric(),
    new BodyWithLocale("content").notEmpty().isLength({max: 2000}),
    new QueryWithLocale("parentId").optional().isNumeric(),
];

const updateComment = [
    new ParamWithLocale("commentId").notEmpty().isNumeric(),
    new BodyWithLocale("content").notEmpty().isLength({max: 2000}),
];

const deleteComment = [ new ParamWithLocale("commentId").notEmpty().isNumeric()];

module.exports = {
    getCommentById,
    getCommentsByPost,
    createComment,
    updateComment,
    deleteComment,
};
