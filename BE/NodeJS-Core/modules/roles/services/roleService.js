const Role = require("models/role.js");
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
    return await role.update(data);
  },
};

module.exports = roleService;
