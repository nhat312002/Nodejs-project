const { Joi } = require("kernels/validations");


const categoryValidation = {
    getAllCategories: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1),
            limit: Joi.number().integer().min(1).max(100).default(10),
            name: Joi.string().max(255).optional(),
            status: Joi.number().valid(0, 1).optional(),
        })
    },

    getCategoryById: {
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required(),
        })
    },

    createCategory: {
        body: Joi.object({
            name: Joi.string().min(3).max(255).required(),
            status: Joi.string().valid("1", "0").required(),
        })
    },
    updateCategory: {
        body: Joi.object({
            name: Joi.string().min(3).max(30),
            status: Joi.string().valid("1", "0"),
        })
    },

    toggleCategoryStatus : this.getCategoryById
}

module.exports = categoryValidation;