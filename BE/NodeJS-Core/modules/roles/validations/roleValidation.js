const { Joi } = require("kernels/validations");

const roleValidation = {
  getAllRoles: {
    query: Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
          'number.base': 'Page must be a valid number.',
          'number.integer': 'Page must be an integer.',
          'number.min': 'Page must be a positive integer.',
        }),
      limit: Joi.number()
        .integer()
        .min(1)
        .optional()
        .messages({
          'number.base': 'Limit must be a valid number.',
          'number.integer': 'Limit must be an integer.',
          'number.min': 'Limit must be a positive integer.',
        }),
      status: Joi.string()
        .valid("1", "0")
        .optional()
        .messages({
          'any.only': 'Invalid status value.',
          'string.base': 'Status must be a string.',
        }),
      search: Joi.string()
        .max(255)
        .optional()
        .messages({
          'string.base': 'Search must be a string.',
          'string.max': 'Search must not exceed 255 characters.',
        }),
    }),
  },

  getRoleById: {
    params: Joi.object({
      roleId: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          'number.base': 'Role ID must be a valid number.',
          'number.integer': 'Role ID must be an integer.',
          'number.min': 'Role ID must be a positive integer.',
          'any.required': 'Role ID is required.',
        }),
    }),
  },

  createRole: {
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(255)
        .required()
        .messages({
          'string.base': 'Role name must be a string.',
          'string.empty': 'Role name is required.',
          'string.min': 'Role name must be at least 3 characters.',
          'string.max': 'Role name must not exceed 255 characters.',
          'any.required': 'Role name is required.',
        }),
      status: Joi.string()
        .valid("1", "0")
        .required()
        .messages({
          'any.only': 'Invalid status value.',
          'string.base': 'Status must be a string.',
          'any.required': 'Status is required.',
        }),
    }),
  },

  updateRole: {
    body: Joi.object({
      name: Joi.string()
        .min(3)
        .max(30)
        .required()
        .messages({
          'string.base': 'Role name must be a string.',
          'string.empty': 'Role name is required.',
          'string.min': 'Role name must be at least 3 characters.',
          'string.max': 'Role name must not exceed 30 characters.',
          'any.required': 'Role name is required.',
        }),
      status: Joi.string()
        .valid("1", "0")
        .required()
        .messages({
          'any.only': 'Invalid status value.',
          'string.base': 'Status must be a string.',
          'any.required': 'Status is required.',
        }),
    }),
  },
};

module.exports = roleValidation;
