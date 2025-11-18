const { Joi } = require("kernels/validations");


const categoryValidation = {
    getAllCategories: {
        query: Joi.object({
            page: Joi.number().integer().min(1).default(1).label("Page"),
            limit: Joi.number().integer().min(1).max(100).default(10).label("Limit"),
            name: Joi.string().max(255).optional().label("Name"),
            status: Joi.number().valid(0, 1).optional().label("Status"),
        })
    },

    getCategoryById: {
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required().label("CategoryIds"),
        })
    },

    createCategory: {
        body: Joi.object({
            name: Joi.string().min(3).max(255).required().label("Name"),
            status: Joi.string().valid("1", "0").required().label("Status"),
        })
    },
    updateCategory: {
        body: Joi.object({
            name: Joi.string().min(3).max(30).label("Name"),
            status: Joi.string().valid("1", "0").label("Status"),
        }),
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required().label("CategoryIds"),
        })
    },

    toggleCategoryStatus : {
        params: Joi.object({
            categoryId: Joi.number().integer().positive().required(),
        })
    },
}

module.exports = categoryValidation;