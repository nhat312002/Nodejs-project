const { Joi } = require("kernels/validations");

const userValidation = {
  getAllUsers: {
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
      role_id: Joi.number()
        .integer()
        .optional()
        .messages({
          'number.base': 'Role ID must be a valid number.',
          'number.integer': 'Role ID must be an integer.',
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

  getUserById: {
    params: Joi.object({
      userId: Joi.number()
        .integer()
        .min(1)
        .required()
        .messages({
          'number.base': 'User ID must be a valid number.',
          'number.integer': 'User ID must be an integer.',
          'number.min': 'User ID must be a positive integer.',
          'any.required': 'User ID is required.',
        }),
    }),
  },

  createUser: {
    body: Joi.object({
      full_name: Joi.string()
        .trim()
        .max(255)
        .required()
        .messages({
          'string.base': 'Full name must be a string.',
          'string.empty': 'Full name is required.',
          'string.max': 'Full name must not exceed 255 characters.',
          'any.required': 'Full name is required.',
        }),
      username: Joi.string()
        .trim()
        .min(8)
        .max(255)
        .required()
        .messages({
          'string.base': 'Username must be a string.',
          'string.empty': 'Username is required.',
          'string.min': 'Username must be between 8 and 255 characters.',
          'string.max': 'Username must be between 8 and 255 characters.',
          'any.required': 'Username is required.',
        }),
      email: Joi.string()
        .trim()
        .email()
        .max(255)
        .required()
        .messages({
          'string.base': 'Email must be a string.',
          'string.email': 'Email must be a valid email address.',
          'string.empty': 'Email is required.',
          'string.max': 'Email must not exceed 255 characters.',
          'any.required': 'Email is required.',
        }),
      password: Joi.string()
        .trim()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=(?:[^!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?][^!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]*){1}$).{8,255}$/
        )
        .required()
        .messages({
          'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
          'string.empty': 'Password is required.',
          'any.required': 'Password is required.',
        }),
      phone: Joi.string()
        .trim()
        .pattern(/^[0-9]{10,11}$/)
        .optional()
        .allow(null, '')
        .messages({
          'string.pattern.base': 'Phone number must be 10 or 11 digits.',
          'string.base': 'Phone number must be a string.',
        }),
      url_avatar: Joi.string()
        .trim()
        .uri()
        .max(255)
        .optional()
        .allow(null, '')
        .messages({
          'string.uri': 'Avatar URL must be a valid URI.',
          'string.max': 'Avatar URL must not exceed 255 characters.',
          'string.base': 'Avatar URL must be a string.',
        }),
      role_id: Joi.number()
        .integer()
        .required()
        .messages({
          'number.base': 'Role ID must be a valid number.',
          'number.integer': 'Role ID must be an integer.',
          'any.required': 'Role ID is required.',
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

  updateUser: {
    body: Joi.object({
      full_name: Joi.string()
        .trim()
        .max(255)
        .required()
        .messages({
          'string.base': 'Full name must be a string.',
          'string.empty': 'Full name is required.',
          'string.max': 'Full name must not exceed 255 characters.',
          'any.required': 'Full name is required.',
        }),
      email: Joi.string()
        .trim()
        .email()
        .max(255)
        .required()
        .messages({
          'string.base': 'Email must be a string.',
          'string.email': 'Email must be a valid email address.',
          'string.empty': 'Email is required.',
          'string.max': 'Email must not exceed 255 characters.',
          'any.required': 'Email is required.',
        }),
      password: Joi.string()
        .trim()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=(?:[^!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]*[!@#$%^&*()_+\[\]{};':"\\|,.<>\/?][^!@#$%^&*()_+\[\]{};':"\\|,.<>\/?]*){1}$).{8,255}$/
        )
        .required()
        .messages({
          'string.pattern.base': 'Password must contain at least 1 uppercase letter, 1 lowercase letter, 1 number, and 1 special character.',
          'string.empty': 'Password is required.',
          'any.required': 'Password is required.',
        }),
      phone: Joi.string()
        .trim()
        .pattern(/^[0-9]{10,11}$/)
        .optional()
        .allow(null, '')
        .messages({
          'string.pattern.base': 'Phone number must be 10 or 11 digits.',
          'string.base': 'Phone number must be a string.',
        }),
      url_avatar: Joi.string()
        .trim()
        .uri()
        .max(255)
        .optional()
        .allow(null, '')
        .messages({
          'string.uri': 'Avatar URL must be a valid URI.',
          'string.max': 'Avatar URL must not exceed 255 characters.',
          'string.base': 'Avatar URL must be a string.',
        }),
      role_id: Joi.number()
        .integer()
        .required()
        .messages({
          'number.base': 'Role ID must be a valid number.',
          'number.integer': 'Role ID must be an integer.',
          'any.required': 'Role ID is required.',
        }),
      status: Joi.string()
        .trim()
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

module.exports = userValidation;
