const db = require("models");
const { Op, or } = require("sequelize");
const { User } = db;
const bcrypt = require("bcrypt");
const userValidation = require("modules/users/validations/userValidation.js");
const e = require("express");

const userService = {
  getAllUsers: async (page = 1, limit = 10, filters = {}) => {
    const offset = (page - 1) * limit;
    const where = {};

    if (filters.role_id) {
      where.role_id = filters.role_id;
    }
    if (filters.status) {
      where.status = filters.status;
    }
    if (filters.search) {
      where[Op.or] = [
        { full_name: { [Op.iLike]: `%${filters.search}%` } },
        { email: { [Op.iLike]: `%${filters.search}%` } },
      ];
    }

    const { count, rows } = await User.findAndCountAll({
      where,
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Role,
          as: "role",
          attributes: ["id", "name", "status"],
        },
      ],
      limit,
      offset,
      order: [["createdAt", "DESC"]],
    });
    return {
      totalRecords: count,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      users: rows,
    };
  },
  getUserById: async (id) => {
    return await User.findByPk(id, {
      attributes: {
        exclude: ["password"],
      },
      include: [
        {
          model: db.Role,
          as: "role",
          attributes: ["id", "name", "status"],
        },
      ],
    });
  },
  createUser: async (data) => {
    const { error } = userValidation.createUser(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const existingUsername = await User.findOne({
      where: { username: data.username },
    });
    if (existingUsername) {
      throw new Error("User with this username already exists");
    }
    const existingEmail = await User.findOne({ where: { email: data.email } });
    if (existingEmail) {
      throw new Error("User with this email already exists");
    }
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    return await User.create(data);
  },
  updateUser: async (id, data) => {
    const { error } = userValidation.updateUser(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    const existingEmail = await User.findOne({
      where: { email: data.email, id: { [Op.ne]: id } },
    });
    if (existingEmail) {
      throw new Error("User email must be unique");
    }
    // const disallowedFields = [
    //   "id",
    //   "username",
    //   "role_id",
    //   "status",
    //   "created_at",
    // ];
    // disallowedFields.forEach((field) => delete data[field]);
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    return await user.update(data);
  },
};

module.exports = userService;
