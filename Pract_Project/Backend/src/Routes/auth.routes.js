const express = require("express");
const router = express.Router();
const { AppError } = require("../Utils/AppError");
const { User } = require("../Model/User.Schema");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isLoggedIn } = require("../Middleware/isLoggedIn");

router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    throw new AppError(400, "Enter both the feilds");
  }

  const foundUser = await User.findOne({ email });

  if (!foundUser) {
    throw new AppError(401, "Email doesnot exist ");
  }
  const isCorrectPassword = await bcrypt.compare(password, foundUser.password);
  if (!isCorrectPassword) {
    throw new AppError(401, "Invalid Password");
  }

  const token = jwt.sign({ id: foundUser._id }, process.env.JWT_SECRET, {
    expiresIn: "1d",
  });

  res
    .cookie("token", token, {
      maxAge: 24 * 60 * 60 * 1000,
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    })

    .status(200)
    .json({
      msg: "Login Successfully",
      data: foundUser,
    });
});

router.post("/logout",  (req, res) => {
  res.clearCookie("token", { httpOnly: true, sameSite: "lax", secure: process.env.NODE_ENV === "production" }).status(200).json({
    msg: "Logged out Succesfully",
  });
});

router.get("/me", isLoggedIn,async(req, res)=>{

    const {_id,name, email, isActive, role}=req.user

    res.status(200).json({
data: {_id,name, email, isActive , role}
    })

})

module.exports = {
  AuthRouter: router,
};
