const express = require("express");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");
const { AppError } = require("../Utils/AppError");
const { Organization } = require("../Model/Organization.schema");
const { default: mongoose } = require("mongoose");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../Model/User.Schema");
const validator=require("validator")
  router.post("/", isLoggedIn, authorize("owner"), async (req, res) => {
  const { name, isActive } = req.body;

  console.log("BODY:", req.body);
  console.log("NAME:", name);
  console.log("ISACTIVE:", isActive);

  if (!name.trim() || name.trim().length > 100) {
    throw new AppError(401, "Invalid name");
  }

  const createdOrg = await Organization.create({
    name,
    isActive,
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Organization Created",
    data: createdOrg,
  });
});

router.get("/", isLoggedIn, authorize("owner"), async (req, res) => {
  const { skip, limit } = req.query;
  const data = await Organization.find()
    .limit(limit)
    .skip(limit * skip);

  res.status(201).json({
    data,
  });
});

router.get("/:id", isLoggedIn, authorize("owner"), async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Id ");
  }

  const getUser = await Organization.findOne(id);

  if (!getUser) {
    throw new AppError("Id does not found ");
  }

  res.status(201).json({
    data: getUser,
  });
});

router.delete("/:id", isLoggedIn,authorize("owner"), async (req, res) => {
  const { id } = req.params;
  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError("Invalid Id");
  }
  const deletedUser = await Organization.findByIdAndUpdate(
    id,
    { isActive: false },
    { returnDocument: "after" },
  );

  if (!deletedUser) {
    throw new AppError("Organization does not exist");
  }
  res.status(201).json({
    msg: "Deleted Organization",
    data: deletedUser,
  });
});

router.patch("/:id", isLoggedIn, authorize("owner"), async (req, res) => {
  const { name, isActive } = req.body;

  if (!name.trim() || !name.trim().length > 100) {
    throw new AppError(401, "Invalid Name");
  }

  const updatedOrg = await Organization.findByIdAndUpdate(
    id,
    { name, isActive },
    { runValidation: true, returnValidation: "after" },
  );

  if (!updatedOrg) {
    throw new AppError(401, "Organization does not exist ");
  }

  res.status().json({
    message: "done",
    data: updatedOrg,
  });
});

/*
   Owner APi to make Admin
*/




router.post("/organization/:id/admin", isLoggedIn, authorize("owner"), async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Id");
  }

  const foundOrg = await Organization.findById(id);

  if (!foundOrg) {
    throw new AppError(400, "Organization does not exist");
  }

  const { name, password, email } = req.body;

  if (!name || name.trim().length > 20) {
    throw new AppError(401, "invalid Name");
  }
  if (!email || !validator.isEmail(email)) {
    throw new AppError("Invalid Email id ");
  }
  if (!password || !validator.isStrongPassword(password)) {
    throw new AppError("Invalid password");
  }

  const hashedPassword = await bcrypt.hash(password, 12);

  const createdAdmin = await User.create({
    name,
    password: hashedPassword,
    email,
    organizationId: id,
    role: "admin",
    isActive: foundOrg.isActive,
  });
  res.status(201).json({
    data: createdAdmin,
    message: foundOrg.isActive
      ? `Admin created Under ${foundOrg.name}`
      : `
  Admin created Under ${foundOrg.name} which is INACTIVE`,
  });
});

router.get("/organization/:id/admin", isLoggedIn, authorize("owner"), async (req, res) => {
  const { id } = req.params;

  if (!id && !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid Id ");
  }

  const foundorg = await organization.findById(id);

  if (!foundorg) {
    throw new AppError(400, "Organization Not Exist");
  }

  const foundAdmin = await User.find({
    organizationId: foundOrg._id,
    role: "admin",
  });

  res.status(201).json({
    data: foundAdmin,
    message: foundorg.isActive
      ? `Organization Active`
      : `Organization Inactive`,
  });
});

router.get("/admin/:id", isLoggedIn, authorize("owner"), async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id));
  {
    throw new AppError(400, "Invalid ID");
  }

  const foundUser = await User.find({ _id: id, role: "admin" });
  if (!foundUser) {
    throw new AppError(400, "Admin does not exist");
  }

  const foundOrg = await organization.find(foundUser.organizationId);

  res.status(201).json({
    data: foundUser,
    message: foundOrg.isActive
      ? `Orgnaization ~${foundOrg.name} is ACTIVE`
      : `Orgnaization ~${foundOrg.name} is INACTIVE`,
  });
});

router.delete("/admin/:id", isLoggedIn, authorize("owner"), async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID");
  }

  const foundUser = await User.findById({ id: _id, role: "admin" });

  if (!foundUser) {
    throw new AppError("Admin does not exist ");
  }
  foundUser.isActive = false;

  res.status(201).json({
    msg: "Admin id dleted successfully",
    data: foundUser,
  });
});

router.patch("/admin/:id", isLoggedIn, authorize("owner"), async (req, res) => {
  const { id } = req.params;

  if (!id || !mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Invalid ID");
  }

  const foundUser = await User.findOne({ id: _id, role: "admin" });
  if (!foundUser) {
    throw new AppError(401, "User Invalid");
  }

  foundUser.isActive = true;

  res.status(200).json({
    msg: "Admin succesfully updated",
    data: foundUser,
  });
});
module.exports = {
  OwnerRouter: router,
};
