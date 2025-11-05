const responseUtils = require("utils/responseUtils");
const jwtUtils = require("utils/jwtUtils");

module.exports = async (req, res, next) => {
  try {
    const header = req.headers.authorization || req.headers.Authorization;
    if (!header || !header.startsWith("Bearer ")) {
      return responseUtils.unauthorized(res, "No token provided");
    }
    const token = header.split(" ")[1];
    const payload = jwtUtils.verify(token); // throws if invalid
    // attach minimal user info
    req.user = { id: payload.userId ?? payload.userId, role_id: payload.role ?? payload.role };
    return next();
  } catch (err) {
    return responseUtils.unauthorized(res, "Invalid token");
  }
};