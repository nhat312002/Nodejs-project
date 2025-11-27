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
    responseUtils.error(res, error.message);
  }
}