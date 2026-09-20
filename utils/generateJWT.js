const jwt = require("jsonwebtoken");
module.exports = async (payload) => {
  return await jwt.sign(payload, process.env.JWT_SECRET_KEY, {
    expiresIn: "30d",
  });
};
