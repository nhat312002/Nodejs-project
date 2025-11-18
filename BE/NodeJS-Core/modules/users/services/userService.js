const db = require("models");
const { Op, or } = require("sequelize");
const { User } = db;
const bcrypt = require("bcrypt");
const userValidation = require("modules/users/validations/userValidation.js");
const e = require("express");
const fs = require("node:fs");
const path = require("node:path");

const userService = {
  updateAvatar: async (userId, file) => {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error("User not found");
    }

    const uploadDir = path.join(__dirname, "../../../uploads/avatars");
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }

    if (user.url_avatar) {
      const oldAvatarPath = path.join(__dirname, "../../../", user.url_avatar);
      await fs.promises.access(oldAvatarPath);
      await fs.promises.unlink(oldAvatarPath);
    }

    const fileExt = path.extname(file.originalname);
    const fileName = `${Date.now()}-${Math.round(
      Math.random() * 1e9
    )}${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    await fs.promises.writeFile(filePath, file.buffer);

    const avatarUrl = `/uploads/avatars/${fileName}`;
    user.url_avatar = avatarUrl;
    await user.save();
    return {
      message: "Avatar updated successfully",
      url_avatar: avatarUrl,
    };
  },
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
      pagination: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit),
        currentPage: page,
      },
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
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    if (data.email){
      const existingEmail = await User.findOne({
        where: { email: data.email, id: { [Op.ne]: id } },
      });
      if (existingEmail) {
        throw new Error("User email must be unique");
      }
    }
    if (data.username) {
      const existingUsername = await User.findOne({
        where: { username: data.username, id: { [Op.ne]: id } },
      });
      if (existingUsername) {
        throw new Error("Username must be unique");
      }
    }
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    const updatedUser = await user.update(data);
    delete updatedUser.dataValues.password;
    return updatedUser;
  },
  updateProfile: async (id, data) => {
    console.log("update profile");
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    if (data.email){
      const existingEmail = await User.findOne({
        where: { email: data.email, id: { [Op.ne]: id } },
      });
      if (existingEmail) {
        throw new Error("User email must be unique");
      }
    }
    if (data.username) {
      const existingUsername = await User.findOne({
        where: { username: data.username, id: { [Op.ne]: id } },
      });
      if (existingUsername) {
        throw new Error("Username must be unique");
      }
    }
    const updatedUser = await user.update(data);
    delete updatedUser.dataValues.password;
    return updatedUser;
  },
  changePassword: async (id, data) => {
    const user = await User.findByPk(id);
    if (!user) {
      throw new Error("User not found");
    }
    const valid = await bcrypt.compare(data.oldPassword, user.password);
    if (!valid) throw new Error("Incorrect password");

    const salt = await bcrypt.genSalt(10);
    data.password = await bcrypt.hash(data.password, salt);

    const updatedUser = await user.update(data);
    delete updatedUser.dataValues.password;
    return updatedUser;
  }
};

module.exports = userService;
