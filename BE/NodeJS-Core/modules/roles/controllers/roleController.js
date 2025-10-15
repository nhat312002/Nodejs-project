const { get } = require("index");
const roleService = require("modules/roles/services/roleService.js");

const roleController = {
  getAllRoles: async (req, res) => {
    try {
      const roles = await roleService.getAllRoles();
      res.status(200).json(roles);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  getRoleById: async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const role = await roleService.getRoleById(roleId);
      if (!role) {
        return res.status(404).json({ error: "Role not found" });
      }
      res.status(200).json(role);
    } catch (error) {
      res.status(500).json({ error: error.message });
    }
  },
  createRole: async (req, res) => {
    try {
      const data = req.body;
      const newRole = await roleService.createRole(data);
      res.status(201).json(newRole);
    } catch (error) {
      res.status(400).json({ error: error.message });
    }
  },
  updateRole: async (req, res) => {
    try {
      const roleId = req.params.roleId;
      const data = req.body;
      const updatedRole = await roleService.updateRole(roleId, data);
      res.status(200).json(updatedRole);
    } catch (error) {
      if (error.message === "Role not found") {
        return res.status(404).json({ error: error.message });
      }
      res.status(400).json({ error: error.message });
    }
  },
};

module.exports = roleController;
