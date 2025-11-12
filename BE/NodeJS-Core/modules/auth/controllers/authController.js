const authService = require('../services/authService');
const responseUtils = require('utils/responseUtils');
exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Register Error:", error); 
    res.status(400).json({ message: error.message || "404 Not Found" });
  }
};

exports.login = async (req, res) => {
   try {
    // console.log(req.body);

    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Login Error:", error); 
    res.status(401).json({ message: error.message || "404 Not Found" });
  }
};

exports.refresh = async (req, res) => {
  try {
    const result = await authService.refresh(req.body);
    res.status(200).json(result);
  } catch (error) {
    responseUtils.error(res, error.message);
  }
}