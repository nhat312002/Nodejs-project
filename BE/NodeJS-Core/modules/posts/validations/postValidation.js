const {BodyWithLocale, ParamWithLocale, QueryWithLocale} = require("kernels/rules");

const getPostById = [ParamWithLocale("postId").notEmpty().isNumeric()];

const getPosts = [
    QueryWithLocale("userId").optional().isNumeric(),
    QueryWithLocale("languageId").optional().isNumeric(),
    QueryWithLocale("categoryIds")
        .optional()
        .customSanitizer((value) => {
            // allow either array or comma-separated string
            if (typeof value === "string") return value.split(",").map((id) => Number(id.trim()));
            return value;
        }),
    QueryWithLocale("originalId").optional().isNumeric(),
    QueryWithLocale("status").optional().isIn(["pending", "approved", "rejected"]),
];

const createPost = [
    BodyWithLocale("title")
        .notEmpty()
        .isLength({min: 3, max: 150}),
    BodyWithLocale("body")
        .notEmpty()
        .isLength({min: 10}),
    BodyWithLocale("languageId")
        .notEmpty()
        .isNumeric(),
    BodyWithLocale("categoryIds")
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
    ParamWithLocale("postId").notEmpty().isNumeric(),
    BodyWithLocale("title")
        .optional()
        .isLength({min: 3, max: 100}),
    BodyWithLocale("body")
        .optional()
        .isLength({min: 10}),
    BodyWithLocale("categoryIds")
        .optional()
        .custom((value) => {
            if (!Array.isArray(value))
                throw new Error("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                throw new Error("Each category ID must be a number");
            return true;
        }),
];

const disablePost = [ParamWithLocale("postId").notEmpty().isNumeric()];

const setPostStatus = [
    ParamWithLocale("postId").notEmpty().isNumeric(),
    BodyWithLocale("status")
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
