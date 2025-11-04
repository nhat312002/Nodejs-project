const Joi = require("joi");


const categoryValidation = {
    getAllCategories: (query) => {
        const schema = Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            name: Joi.string().max(255).optional(),
            status: Joi.number().valid(0, 1).optional(),
        });
        return schema.validate(query);
    },

    getCategoryById: (params) => {
        const schema = Joi.object({
            categoryId: Joi.number().integer().positive().required(),
        });
        return schema.validate(params);
    },

    createCategory: (data) => {
        const schema = Joi.object({
            name: Joi.string().min(3).max(255).required(),
            status: Joi.string().valid("1", "0").required(),
        });
        return schema.validate(data);
    },
    updateCategory: (data) => {
        const schema = Joi.object({
            name: Joi.string().min(3).max(30),
            status: Joi.string().valid("1", "0"),
        });
        return schema.validate(data);
    },
}

module.exports = categoryValidation;