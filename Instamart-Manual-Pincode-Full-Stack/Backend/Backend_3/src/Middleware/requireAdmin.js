
const jwt = require("jsonwebtoken");

const requireAdmin = (req, res, next) => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      return res.status(401).json({ message: "Please log in first" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (decoded.role !== "admin" || !decoded.email) {
      return res.status(401).json({ message: "Invalid session" });
    }

    req.admin = decoded;

    next();

  } catch (error) {
    return res.status(401).json({ message: "Please log in again" });
  }
};

module.exports = requireAdmin;
