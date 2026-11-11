
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const adminEmail = (process.env.ADMIN_EMAIL || "").trim().toLowerCase();
const adminPassword = process.env.ADMIN_PASSWORD;

const hashedPassword = adminPassword
  ? bcrypt.hashSync(adminPassword, 12)
  : null;

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
  path: "/",
};

// LOGIN
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" });
    }

    if (!hashedPassword || !process.env.JWT_SECRET) {
      return res.status(500).json({ message: "Login is not configured" });
    }

    if (email.trim().toLowerCase() !== adminEmail) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const passwordMatch = await bcrypt.compare(password, hashedPassword);

    if (!passwordMatch) {
      return res.status(401).json({ message: "Invalid email or password" });
    }

    const token = jwt.sign(
      { email: adminEmail, role: "admin" },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.cookie("token", token, cookieOptions);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      user: { email: adminEmail, role: "admin" },
    });

  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

// LOGOUT
const logout = (req, res) => {
  res.clearCookie("token", cookieOptions);

  return res.status(200).json({
    success: true,
    message: "Logged out successfully",
  });
};

// GET CURRENT ADMIN
const getCurrentAdmin = (req, res) => {
  return res.status(200).json({
    success: true,
    user: {
      email: req.admin.email,
      role: req.admin.role,
    },
  });
};

module.exports = { login, logout, getCurrentAdmin };
