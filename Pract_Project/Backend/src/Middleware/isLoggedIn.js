const { AppError } = require("../Utils/AppError");
const validator = require("validator");
const jwt = require("jsonwebtoken");
const { User } = require("../Model/User.Schema");

const isLoggedIn = async (req, res, next) => {
  const { token } = req.cookies;

  if (!token) {
    throw new AppError(400, "Not having token");
  }

  if (!validator.isJWT(token)) {
    throw new AppError(400, "Not having valid token");
  }

  const originalObject = jwt.verify(
    token,
    process.env.JWT_SECRET
  );

  const foundUser = await User.findById(originalObject.id)
    .populate("organizationId");

  if (!foundUser) {
    throw new AppError(400, "Token not found in the DB");
  }

  req.user = foundUser;

  next();
};

module.exports = {
  isLoggedIn,
};