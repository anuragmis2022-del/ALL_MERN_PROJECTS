const { AppError } = require("../Utils/AppError");
const jwt = require("jsonwebtoken");
const { User } = require("../Model/User.Schema");

const isLoggedIn = async (req, res, next) => {
  const token = req.cookies?.token;
  if (!token) throw new AppError(401, "Please log in first");
  let payload;
  try {
    payload = jwt.verify(token, process.env.JWT_SECRET);
  } catch {
    throw new AppError(401, "Session expired. Please log in again");
  }
  const user = await User.findById(payload.id).populate("organizationId");
  if (!user || !user.isActive) throw new AppError(401, "Account is inactive or not found");
  if (user.role !== "owner" && (!user.organizationId || !user.organizationId.isActive)) {
    throw new AppError(403, "Your organization is inactive");
  }
  req.user = user;
  next();
};
module.exports = { isLoggedIn };
