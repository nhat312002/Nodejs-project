// const { get } = require("index");
const userService = require("modules/users/services/userService.js");
const responseUtils = require("utils/responseUtils");

const userController = {
  getAllUsers: async (req, res) => {
    try {
      const users = await userService.getAllUsers();
      responseUtils.ok(res, users);
    } catch (error) {
      responseUtils.error(res, error.message);
    }
  },
  getUserById: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await userService.getUserById(userId);
      if (!user) {
        return responseUtils.notFound(res);
      }
      responseUtils.ok(res, user);
    } catch (error) {
      responseUtils.error(res, error.message);
    }
  },
  createUser: async (req, res) => {
    try {
      const data = req.body;
      const newUser = await userService.createUser(data);
      res.status(201).json(newUser);
    } catch (error) {
      responseUtils.error(res, error.message);
    }
  },
  updateUser: async (req, res) => {
    try {
      const userId = req.params.userId;
      const data = req.body;
      const updatedUser = await userService.updateUser(userId, data);
      responseUtils.ok(res, updatedUser);
    } catch (error) {
      if (error.message === "User not found") {
        return responseUtils.notFound(res);
      }
      responseUtils.error(res, error.message);
    }
  },
};

module.exports = userController;
