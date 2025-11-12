const { config } = require("configs");
const jwt = require("jsonwebtoken");

module.exports = {
  sign: (userId, userRole) => {
    const access_token = jwt.sign(
      {
        userId: userId,
        role: userRole,
      },
      config.jwt.secret,
      {
        algorithm: config.jwt.algorithm,
        expiresIn: config.jwt.ttl,
        issuer: config.jwt.issuer
      }
    );

    return access_token;
  },
  signRefreshToken: (userId, userRole) => {
    const refresh_token = jwt.sign(
      {
        userId: userId,
        role: userRole,
      },
      config.jwt.secret,
      {
        algorithm: config.jwt.algorithm,
        expiresIn: config.jwt.refresh_ttl,
        issuer: config.jwt.issuer
      }
    );

    return refresh_token;
  },
  verify: (token) => {
    return jwt.verify(token, config.jwt.secret, {
      issuer: config.jwt.issuer,

    });
  }
};
