const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require("kernels/rules");

const getPostById = [new ParamWithLocale("postId").notEmpty().isNumeric()];

const getPosts = [
    new QueryWithLocale("userId").optional().isNumeric(),
    new QueryWithLocale("languageId").optional().isNumeric(),
    new QueryWithLocale("categoryIds")
        .optional()
        .custom((value, helpers) => {
            if (value === "other") return "other";
            if (typeof value === "string") {
                return value
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter((v) => !Number.isNaN(v));
            }
            if (Array.isArray(value)) return value;
            throw new Error("categoryIds must be an array or a comma-separated string");
        }),
    new QueryWithLocale("originalId").optional().isNumeric(),
    new QueryWithLocale("status").optional().isIn(["1", "2", "3"]),
    new QueryWithLocale("categoryMatchAll").optional().custom((value, helpers) => {
        if (value === "true") return true;
        throw new Error("categoryMatchAll is not true or redundant");
    })
];

const createPost = [
    new BodyWithLocale("title")
        .notEmpty()
        .isLength({ min: 3, max: 225 }),
    new BodyWithLocale("body")
        .notEmpty()
        .isLength({ min: 10 }),
    new BodyWithLocale("languageId")
        .notEmpty()
        .isNumeric(),
    new BodyWithLocale("categoryIds")
        .optional()
        .custom((value, helpers) => {
            if (!Array.isArray(value))
                throw new Error("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                throw new Error("Each category ID must be a number");
            return value;
        }),
];

const updatePost = [
    new ParamWithLocale("postId").notEmpty().isNumeric(),
    new BodyWithLocale("title")
        .optional()
        .isLength({ min: 3, max: 225 }),
    new BodyWithLocale("body")
        .optional()
        .isLength({ min: 10 }),
    new BodyWithLocale("categoryIds")
        .optional()
        .custom((value, helpers) => {
            if (!Array.isArray(value))
                throw new Error("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                throw new Error("Each category ID must be a number");
            return value;
        }),
];

const disablePost = [new ParamWithLocale("postId").notEmpty().isNumeric()];

const setPostStatus = [
    new ParamWithLocale("postId").notEmpty().isNumeric(),
    new BodyWithLocale("status")
        .notEmpty()
        .isIn(["2", "3"]),
];

module.exports = {
    getPostById,
    getPosts,
    createPost,
    updatePost,
    disablePost,
    setPostStatus,
};
