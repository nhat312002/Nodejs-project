const db = require("models");
const { Op } = require("sequelize");
const { User } = db;
const bcrypt = require("bcrypt");
const userValidation = require("modules/users/validations/userValidation.js");

const userService = {
  getAllUsers: async () => {
    return await User.findAll();
  },
  getUserById: async (id) => {
    return await User.findByPk(id);
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
    if (data.password) {
      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
    }
    return await user.update(data);
  },
};

module.exports = userService;
