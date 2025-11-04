const authService = require('../services/authService');

exports.register = async (req, res) => {
  try {
    const result = await authService.register(req.body);
    res.status(201).json(result);
  } catch (error) {
    console.error("Lỗi trong register:", error); 
    res.status(400).json({ message: error.message || "Lỗi không xác định" });
  }
};

exports.login = async (req, res) => {
  try {
    const result = await authService.login(req.body);
    res.status(200).json(result);
  } catch (error) {
    console.error("Lỗi trong login:", error); 
    res.status(401).json({ message: error.message || "Lỗi không xác định" });
  }
};
