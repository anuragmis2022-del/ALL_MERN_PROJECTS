const { AppError } = require("../Utils/AppError");
const authorize = (...roles) => (req, res, next) => {
  if (!req.user || !roles.includes(req.user.role)) {
    throw new AppError(403, "You do not have permission to perform this action");
  }
  next();
};
module.exports = { authorize };
