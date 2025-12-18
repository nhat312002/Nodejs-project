const authService = require('../services/authService');
const responseUtils = require('utils/responseUtils');
exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    responseUtils.ok(res, result, 'Registration successful');
  } catch (error) {
    console.error("Register Error:", error); 
    responseUtils.error(res, error.message);
  }
};

exports.login = async (req, res) => {
   try {
    // console.log(req.body);

    const result = await authService.login(req.body);
    responseUtils.ok(res, result, 'Login successful');
  } catch (error) {
    console.error("Login Error:", error); 
    responseUtils.error(res, error.message);
  }
};

exports.refresh = async (req, res) => {
  try {
    const result = await authService.refresh(req.body);
    responseUtils.ok(res, result, 'Refresh successful');
  } catch (error) {
    console.error("Refresh Error:", error.message);

    // --- CHECK FOR JWT ERRORS HERE ---
    
    // 1. TokenExpiredError: The refresh token has expired (User must login again)
    // 2. JsonWebTokenError: The token is fake, malformed, or has invalid signature
    if (error.name === 'TokenExpiredError' || error.name === 'JsonWebTokenError') {
      
      // If your responseUtils has an unauthorized method:
      return responseUtils.unauthorized(res, "Refresh token expired or invalid");
      
    }

    // Default to 500 for other system errors (DB down, etc)
    responseUtils.error(res, error.message);
  }
}