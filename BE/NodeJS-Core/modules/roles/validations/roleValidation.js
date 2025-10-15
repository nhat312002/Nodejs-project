const Joi = require("joi");

const roleValidation = {
  createRole: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(255).required(),
      status: Joi.string().valid("active", "disabled").required(),
    });
    return schema.validate(data);
  },
  updateRole: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      status: Joi.string().valid("active", "disabled").required(),
    });
    return schema.validate(data);
  },
};

module.exports = roleValidation;
