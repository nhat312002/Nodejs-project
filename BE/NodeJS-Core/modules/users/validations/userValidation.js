const Joi = require("joi");

const userValidation = {
  createUser: (data) => {
    const schema = Joi.object({
      full_name: Joi.string().max(255).required(),
      username: Joi.string()
        .min(8)
        .max(255)
        .message("Tên đăng nhập phải từ 8 đến 255 ký tự.")
        .required(),
      email: Joi.string().email().max(255).required(),
      password: Joi.string()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,255}$/
        )
        .message(
          "Mật khẩu phải có ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt."
        )
        .required(),
      phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .optional()
        .allow(null, ""),
      url_avatar: Joi.string().uri().max(255).optional().allow(null, ""),
      role_id: Joi.number().integer().required(),
      status: Joi.string().valid("active", "disabled").required(),
    });
    return schema.validate(data);
  },
  updateUser: (data) => {
    const schema = Joi.object({
      full_name: Joi.string().max(255).required(),
      email: Joi.string().email().max(255).required(),
      password: Joi.string()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+[\]{};':"\\|,.<>/?]).{8,255}$/
        )
        .message(
          "Mật khẩu phải có ít nhất 1 chữ cái viết hoa, 1 chữ cái viết thường, 1 số và 1 ký tự đặc biệt."
        )
        .required(),
      phone: Joi.string()
        .pattern(/^[0-9]{10,11}$/)
        .optional()
        .allow(null, ""),
      url_avatar: Joi.string().uri().max(255).optional().allow(null, ""),
      role_id: Joi.number().integer().required(),
      status: Joi.string().valid("active", "disabled").required(),
    });
    return schema.validate(data);
  },
};

module.exports = userValidation;
