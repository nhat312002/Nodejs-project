const { Joi } = require("kernels/validations");

const register = {
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
    })
};
const login = {
    body: Joi.object({
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
            .required()
            .messages({
                'string.empty': 'Password is required.',
                'any.required': 'Password is required.',
            }),
    })
};
const refresh = {
    body: Joi.object({
        "refresh_token": Joi.string().trim().required().messages({
            'string.empty': 'Refresh token is required.',
            'any.required': 'Refresh token is required.'
        })
    })

};

module.exports = { register, login, refresh};