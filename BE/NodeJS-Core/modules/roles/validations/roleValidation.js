const Joi = require("joi");

const roleValidation = {
  getAllRoles: (query) => {
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
  getRoleById: (params) => {
    const schema = Joi.object({
      roleId: Joi.number()
        .integer()
        .min(1)
        .required()
        .message("ID vai trò phải là số nguyên dương."),
    });
    return schema.validate(params, { abortEarly: false });
  },
  createRole: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(255).required(),
      status: Joi.string().valid("1", "0").required(),
    });
    return schema.validate(data);
  },
  updateRole: (data) => {
    const schema = Joi.object({
      name: Joi.string().min(3).max(30).required(),
      status: Joi.string().valid("1", "0").required(),
    });
    return schema.validate(data);
  },
};

module.exports = roleValidation;
