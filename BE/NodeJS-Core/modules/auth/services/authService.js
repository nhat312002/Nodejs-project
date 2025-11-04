const db = require("../../../models");
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = db.User;

exports.register = async (data) => {
  const { full_name, username, email, password, role_id } = data;

  const existingUser = await User.findOne({
    where: { email },
  });
  if (existingUser) throw new Error('Email already exists');

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    full_name,
    username,
    email,
    password: hashed,
    role_id: role_id || 1, 
  });

  return {
    message: 'Registration successful',
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
    },
  };
};

exports.login = async (data) => {
  const { email, password } = data;

  const user = await User.findOne({ where: { email } });
  if (!user) throw new Error('Email does not exist');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Incorrect password');

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role_id: user.role_id,
    },
    process.env.JWT_SECRET,
    { expiresIn: '1h' }
  );

  return {
    message: 'Login successful',
    token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
    },
  };
};
