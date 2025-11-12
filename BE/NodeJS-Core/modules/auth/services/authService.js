const db = require("../../../models");
const bcrypt = require('bcrypt');
const jwt = require("configs/jwt");
const jwtUtils = require('utils/jwtUtils');
const User = db.User;

exports.register = async (data) => {
  const { full_name, username, email, password } = data;

  let existingUser = await User.findOne({
    where: { email },
  });
  if (existingUser) throw new Error('Email already exists');

  existingUser = await User.findOne({
    where: { username },
  });
  if (existingUser) throw new Error('Username already exists');

  const hashed = await bcrypt.hash(password, 10);

  const user = await User.create({
    full_name,
    username,
    email,
    password: hashed,
    role_id: 1, 
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

  console.log(email, password);
  const user = await User.findOne({ 
    where: { 
      email : email, 
      status: "1"
    } 
  });
  if (!user) throw new Error('Incorrect password or email');

  const isMatch = await bcrypt.compare(password, user.password);
  if (!isMatch) throw new Error('Incorrect password or email');

  const token = jwtUtils.sign(user.id, user.role_id);

  const refresh_token = jwtUtils.signRefreshToken(user.id, user.role_id);
  
  return {
    message: 'Login successful',
    token,
    refresh_token,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
    },
  };
};

exports.refresh = async (data) => {
  const { refresh_token } = data;
  console.log(refresh_token);
  const { userId, role } = jwtUtils.verify(refresh_token);

  // find user in db
  const user = await User.findByPk(userId);
  if (!user) throw new Error("User not found");
  if (user.role_id != role) throw new Error("User role does not match");
  // require signing in if user role changes

  const newToken = jwtUtils.sign(userId, role);
  const newRefreshToken = jwtUtils.signRefreshToken(userId, role);

  // revoke or process old refresh token -- to be added
   
  return {
    message: 'Refresh successful',
    token: newToken,
    refresh_token: newRefreshToken,
    user: {
      id: user.id,
      full_name: user.full_name,
      email: user.email,
      username: user.username,
      role_id: user.role_id,
    }
  }
}