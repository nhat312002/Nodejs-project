const db = require("models");
const { Op } = require("sequelize");
const { Role } = db;
const roleValidation = require("modules/roles/validations/roleValidation.js");

const roleService = {
  getAllRoles: async () => {
    return await Role.findAll();
  },
  getRoleById: async (id) => {
    return await Role.findByPk(id);
  },
  createRole: async (data) => {
    const { error } = roleValidation.createRole(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const existingRole = await Role.findOne({ where: { name: data.name } });
    if (existingRole) {
      throw new Error("Role with this name already exists");
    }
    return await Role.create(data);
  },
  updateRole: async (id, data) => {
    const { error } = roleValidation.updateRole(data);
    if (error) {
      throw new Error(error.details[0].message);
    }
    const role = await Role.findByPk(id);
    if (!role) {
      throw new Error("Role not found");
    }
    const existingRole = await Role.findOne({
      where: { name: data.name, id: { [Op.ne]: id } },
    });
    if (existingRole) {
      throw new Error("Role name must be unique");
    }
    return await role.update(data);
  },
};

module.exports = roleService;
