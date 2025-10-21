const {BodyWithLocale, ParamWithLocale, QueryWithLocale} = require("kernels/rules");

const getPostById = [new ParamWithLocale("postId").notEmpty().isNumeric()];

const getPosts = [
    new QueryWithLocale("userId").optional().isNumeric(),
    new QueryWithLocale("languageId").optional().isNumeric(),
    new QueryWithLocale("categoryIds")
        .optional()
        .customSanitizer((value) => {
            // allow either array or comma-separated string
            if (typeof value === "string") return value.split(",").map((id) => Number(id.trim()));
            return value;
        }),
    new QueryWithLocale("originalId").optional().isNumeric(),
    new QueryWithLocale("status").optional().isIn(["pending", "approved", "rejected"]),
];

const createPost = [
    new BodyWithLocale("title")
        .notEmpty()
        .isLength({min: 3, max: 150}),
    new BodyWithLocale("body")
        .notEmpty()
        .isLength({min: 10}),
    new BodyWithLocale("languageId")
        .notEmpty()
        .isNumeric(),
    new BodyWithLocale("categoryIds")
        .optional()
        .custom((value) => {
            if (!Array.isArray(value))
                throw new Error("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                throw new Error("Each category ID must be a number");
            return true;
        }),
];

const updatePost = [
    new ParamWithLocale("postId").notEmpty().isNumeric(),
    new BodyWithLocale("title")
        .optional()
        .isLength({min: 3, max: 100}),
    new BodyWithLocale("body")
        .optional()
        .isLength({min: 10}),
    new BodyWithLocale("categoryIds")
        .optional()
        .custom((value) => {
            if (!Array.isArray(value))
                throw new Error("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                throw new Error("Each category ID must be a number");
            return true;
        }),
];

const disablePost = [new ParamWithLocale("postId").notEmpty().isNumeric()];

const setPostStatus = [
    new ParamWithLocale("postId").notEmpty().isNumeric(),
    new BodyWithLocale("status")
        .notEmpty()
        .isIn(["approved", "rejected"]),
];

module.exports = {
    getPostById,
    getPosts,
    createPost,
    updatePost,
    disablePost,
    setPostStatus,
};
