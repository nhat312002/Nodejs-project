const { BodyWithLocale, ParamWithLocale, QueryWithLocale } = require("kernels/rules");
const { Joi } = require("kernels/validations");

const getPostById = {
    params: Joi.object({
        "postId": Joi.number().integer().required()
    })
};

const disablePost = {
    params: Joi.object({
        "postId": Joi.number().integer().required()
    })
};

const getPosts = {
    query: Joi.object({
        "userId": Joi.number().integer().optional(),
        "languageId": Joi.number().integer().optional(),
        "categoryIds": Joi.optional().custom((value, helpers) => {
            if (value === "other") return "other";
            if (typeof value === "string") {
                return value
                    .split(",")
                    .map((id) => Number(id.trim()))
                    .filter((v) => !Number.isNaN(v));
            }
            if (Array.isArray(value)) return value;
            return helpers.message("categoryIds must be an array or a comma-separated string");
        }),
        "originalId": Joi.number().integer().optional(),
        "status": Joi.optional().valid("1", "2", "3"),
        "categoryMatchAll": Joi.optional().custom((value, helpers) => {
            if (value === "true") return true;
            return helpers.message("categoryMatchAll is not true or redundant");
        }),
        "title": Joi.string().trim().optional(),
        "text": Joi.string().trim().optional(),
        "userFullName": Joi.string().trim().optional(),
        "sort": Joi.string().trim().valid("date_asc", "date_desc", "title_asc", "title_desc").optional(),
    })
};

const createPost = {
    body: Joi.object({
        "title": Joi.string().trim().min(3).max(255).required(),
        "body": Joi.string().trim().min(10).max(60000).required(),
        "languageId": Joi.number().integer().required(),
        "categoryIds": Joi.optional().custom((value, helpers) => {
            if (!Array.isArray(value))
                return helpers.message("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                return helpers.error("any.invalid", {message: "Each category ID must be a number"});
            return value;
        })
    })
};

const updatePost = {
    params: Joi.object({
        "postId": Joi.number().integer().required()
    }),
    body: Joi.object({
        "title": Joi.string().trim().min(3).max(225).optional(),
        "body": Joi.string().trim().min(10).max(60000).optional(),
        "categoryIds": Joi.optional().custom((value, helpers) => {
            if (!Array.isArray(value))
                throw new Error("categoryIds must be an array");
            if (!value.every((v) => typeof v === "number"))
                throw new Error("Each category ID must be a number");
            return value;
        })
    })
};

const setPostStatus = {
    params: Joi.object({
        "postId": Joi.number().integer().required()
    }),
    body: Joi.object({
        "status": Joi.valid("2", "3").required()
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
