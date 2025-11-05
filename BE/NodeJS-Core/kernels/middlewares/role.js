const responseUtils = require("utils/responseUtils");
const db = require("models");

/**
 * role(required) -> middleware
 * required can be a string (role name) or array of names/ids
 */
module.exports = (required) => {
  const requiredList = Array.isArray(required) ? required : [required];
  return async (req, res, next) => {
    try {
      if (!req.user || !req.user.id) return responseUtils.unauthorized(res);

      const user = await db.User.findByPk(req.user.id, {
        include: [{ model: db.Role, as: "role", attributes: ["id", "name"] }],
      });
      if (!user) return responseUtils.unauthorized(res);

      const userRoleName = (user.role && user.role.name) ? user.role.name.toLowerCase() : null;
      const userRoleId = user.role_id;

      const ok = requiredList.some((r) => {
        if (typeof r === "number") return r === userRoleId;
        if (!isNaN(Number(r))) return Number(r) === userRoleId;
        return userRoleName === String(r).toLowerCase();
      });

      if (!ok) return responseUtils.unauthorized(res, "Insufficient permissions");
      return next();
    } catch (err) {
      return responseUtils.error(res, err.message);
    }
  };
};