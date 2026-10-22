const express = require("express");
const router = express.Router();

const { AppError } = require("../Utils/AppError");
const { User } = require("../Model/User.Schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../Middleware/isLoggedIn");

const cookieOptions = {
  httpOnly: true,
  secure: process.env.NODE_ENV === "production",
  sameSite:
    process.env.NODE_ENV === "production" ? "none" : "lax",
};

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    throw new AppError(400, "Enter both email and password");
  }

  const foundUser = await User.findOne({
    email: email.trim().toLowerCase(),
  });

  if (!foundUser) {
    throw new AppError(401, "Email does not exist");
  }

  const isCorrectPassword = await bcrypt.compare(
    password,
    foundUser.password
  );

  if (!isCorrectPassword) {
    throw new AppError(401, "Invalid password");
  }

  if (!foundUser.isActive) {
    throw new AppError(401, "Your account is inactive");
  }

  const token = jwt.sign(
    { id: foundUser._id },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );

  res.cookie("token", token, {
    ...cookieOptions,
    maxAge: 24 * 60 * 60 * 1000,
  });

  res.status(200).json({
    msg: "Login successfully",
    data: {
      _id: foundUser._id,
      name: foundUser.name,
      email: foundUser.email,
      isActive: foundUser.isActive,
      role: foundUser.role,
    },
  });
});

router.post("/logout", (req, res) => {
  res
    .clearCookie("token", cookieOptions)
    .status(200)
    .json({ msg: "Logged out successfully" });
});

router.get("/me", isLoggedIn, async (req, res) => {
  const { _id, name, email, isActive, role } = req.user;

  res.status(200).json({
    data: { _id, name, email, isActive, role },
  });
});

module.exports = {
  AuthRouter: router,
};
