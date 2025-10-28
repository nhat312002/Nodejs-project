const Joi = require("joi");


const categoryValidation = {
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