// const { get } = require("index");
const roleService = require("modules/roles/services/roleService.js");
const responseUtils = require("utils/responseUtils");

const roleController = {
  getAllRoles: async (req, res) => {
    try {
      const roles = await roleService.getAllRoles();
      responseUtils.ok(res, roles);
    } catch (error) {
      responseUtils.error(res, error.message);
    }
  },
  getRoleById: async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const role = await roleService.getRoleById(roleId);
      if (!role) {
        return responseUtils.notFound(res);
      }
      responseUtils.ok(res, role);
    } catch (error) {
      responseUtils.error(res, error.message);
    }
  },
  createRole: async (req, res) => {
    try {
      const data = req.body;
      const newRole = await roleService.createRole(data);
      res.status(201).json(newRole);
    } catch (error) {
      responseUtils.error(res, error.message);
    }
  },
  updateRole: async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const data = req.body;
      const updatedRole = await roleService.updateRole(roleId, data);
      responseUtils.ok(res, updatedRole);
    } catch (error) {
      if (error.message === "Role not found") {
        return responseUtils.notFound(res);
      }
      responseUtils.error(res, error.message);
    }
  },
};

module.exports = roleController;
