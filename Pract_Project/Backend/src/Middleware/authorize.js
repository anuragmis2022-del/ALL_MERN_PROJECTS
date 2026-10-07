const { AppError } = require("../Utils/AppError");

const authorize = (...roles) => {
  return (req, res, next) => {

    console.log("ROLE FROM DATABASE:", req.user.role);
    console.log("ALLOWED ROLES:", roles);


    if (!roles.includes(req.user.role)) {
      throw new AppError(403, "Unauthorized Operation");
    }

    next();
  };
};
module.exports={
    authorize
}