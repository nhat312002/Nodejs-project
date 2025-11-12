const userService = require("modules/users/services/userService.js");
const responseUtils = require("utils/responseUtils");
const multer = require("multer");

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024 }, // Giới hạn kích thước tệp là 5MB
  fileFilter: (req, file, cb) => {
    const allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/jpg"];
    const ext = file.mimetype.toLowerCase();
    if (allowedTypes.includes(ext)) {
      return cb(null, true);
    }
    cb(new Error("Invalid file type"));
  },
});

const userController = {
  uploadOwnAvatar: [
    upload.single("avatar"),
    async (req, res) => {
      try {
        const userId = req.user.id;
        const file = req.file;

        if (!file) {
          throw new Error("No file uploaded");
        }
        const result = await userService.updateAvatar(userId, file);
        return responseUtils.ok(res, result);
      } catch (error) {
        return responseUtils.error(res, error.message);
      }
    },
  ],
  uploadAvatar: [
    upload.single("avatar"),
    async (req, res) => {
      try {
        const userId = req.params.userId;
        const file = req.file;

        if (!file) {
          throw new Error("No file uploaded");
        }
        const result = await userService.updateAvatar(userId, file);
        return responseUtils.ok(res, result);
      } catch (error) {
        return responseUtils.error(res, error.message);
      }
    },
  ],
  getAllActiveUsers: async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page) || 1;
      const limit = Number.parseInt(req.query.limit) || 10;

      const filters = {
        role_id: req.query.role_id,
        status: '1',
        search: req.query.search,
      };

      const result = await userService.getAllUsers(page, limit, filters);

      return responseUtils.ok(res, {
        pagination: {
          totalRecords: result.totalRecords,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
        users: result.users,
      }, "User list retrieved successfully",
      );
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  },
  getAllUsers: async (req, res) => {
    try {
      const page = Number.parseInt(req.query.page) || 1;
      const limit = Number.parseInt(req.query.limit) || 10;

      const filters = {
        role_id: req.query.role_id,
        status: req.query.status,
        search: req.query.search,
      };

      const result = await userService.getAllUsers(page, limit, filters);

      return responseUtils.ok(res, {
        pagination: {
          totalRecords: result.totalRecords,
          totalPages: result.totalPages,
          currentPage: result.currentPage,
        },
        users: result.users,
      }, "User list retrieved successfully",
      );
    } catch (error) {
      return responseUtils.error(res, error.message);
    }
  },
  getProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const user = await userService.getUserById(userId);
      if (!user) {
        return responseUtils.notFound(res);
      }
      responseUtils.ok(res, user);
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
  getActiveUserById: async (req, res) => {
    try {
      const userId = req.params.userId;
      const user = await userService.getUserById(userId);
      if (!user || user.role_id != '1') {
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
  updateProfile: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      const updatedUser = await userService.updateProfile(userId, data);
      responseUtils.ok(res, updatedUser);
    } catch (error) {
      if (error.message === "User not found") {
        return responseUtils.notFound(res);
      }
      responseUtils.error(res, error.message);
    }
  },
  changePassword: async (req, res) => {
    try {
      const userId = req.user.id;
      const data = req.body;
      const updatedUser = await userService.changePassword(userId, data);
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
