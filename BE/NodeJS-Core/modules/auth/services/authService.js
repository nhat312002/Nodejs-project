const db = require("models");
const { Op } = require("sequelize");
const { User } = db;
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const authValidation = require("modules/auth/validations/authValidation.js");

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      username: user.username,
      role_id: user.role_id,
    },
    process.env.JWT_SECRET_KEY,
    { expiresIn: process.env.JWT_EXPIRES_IN || "1d" }
  );
};

const authService = {};
