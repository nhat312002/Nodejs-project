const Joi = require("joi");

const userValidation = {
  getAllUsers: (query) => {
    const schema = Joi.object({
      page: Joi.number()
        .integer()
        .min(1)
        .optional()
        .message("Trang phải là số nguyên dương."),
      limit: Joi.number()
        .integer()
        .min(1)
        .optional()
        .message("Giới hạn phải là số nguyên dương."),
      role_id: Joi.number()
        .integer()
        .optional()
        .message("ID vai trò phải là số nguyên dương."),
      status: Joi.string()
        .valid("1", "0")
        .optional()
        .message("Trạng thái không hợp lệ."),
      search: Joi.string()
        .max(255)
        .optional()
        .message("Tìm kiếm không được vượt quá 255 ký tự."),
    });
    return schema.validate(query, { abortEarly: false });
  },
  getUserById: (params) => {
    const schema = Joi.object({
      userId: Joi.number()
        .integer()
        .min(1)
        .required()
        .message("ID người dùng phải là số nguyên dương."),
    });
    return schema.validate(params, { abortEarly: false });
  },
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
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=(?:[^!@#$%^&*()_+[\]{};':"\\|,.<>/?]*[!@#$%^&*()_+[\]{};':"\\|,.<>/?][^!@#$%^&*()_+[\]{};':"\\|,.<>/?]*){1}$).{8,255}$/
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
      status: Joi.string().valid("1", "0").required(),
    });
    return schema.validate(data);
  },
  updateUser: (data) => {
    const schema = Joi.object({
      full_name: Joi.string().max(255).required(),
      email: Joi.string().email().max(255).required(),
      password: Joi.string()
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=(?:[^!@#$%^&*()_+[\]{};':"\\|,.<>/?]*[!@#$%^&*()_+[\]{};':"\\|,.<>/?][^!@#$%^&*()_+[\]{};':"\\|,.<>/?]*){1}$).{8,255}$/
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
      status: Joi.string().valid("1", "0").required(),
    });
    return schema.validate(data);
  },
};

module.exports = userValidation;
