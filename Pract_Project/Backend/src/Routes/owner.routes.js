const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const validator = require("validator");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");
const { AppError } = require("../Utils/AppError");
const { Organization } = require("../Model/Organization.schema");
const { User } = require("../Model/User.Schema");

const router = express.Router();
router.use(isLoggedIn, authorize("owner"));

// List organizations
router.get("/", async (req, res) => {
  const data = await Organization.find().sort({ createdAt: -1 });
  res.status(200).json({ data });
});

// Create organization
router.post("/", async (req, res) => {
  const name = req.body.name?.trim();
  if (!name || name.length > 100) throw new AppError(400, "Enter an organization name (maximum 100 characters)");
  const data = await Organization.create({ name, createdBy: req.user._id });
  res.status(201).json({ message: "Organization created", data });
});

// Get one organization
router.get("/organization/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid organization ID");
  const data = await Organization.findById(id);
  if (!data) throw new AppError(404, "Organization not found");
  res.status(200).json({ data });
});

// Activate/deactivate organization
router.patch("/organization/:id", async (req, res) => {
  const { id } = req.params;
  const update = {};
  if (typeof req.body.isActive === "boolean") update.isActive = req.body.isActive;
  if (req.body.name !== undefined) {
    const name = req.body.name.trim();
    if (!name || name.length > 100) throw new AppError(400, "Invalid organization name");
    update.name = name;
  }
  if (!Object.keys(update).length) throw new AppError(400, "Provide name or isActive to update");
  const data = await Organization.findByIdAndUpdate(id, update, { new: true, runValidators: true });
  if (!data) throw new AppError(404, "Organization not found");
  // Keep its admins aligned with organization status.
  if (typeof update.isActive === "boolean") {
    await User.updateMany({ organizationId: id, role: "admin" }, { isActive: update.isActive });
  }
  res.status(200).json({ message: "Organization updated", data });
});

// Backwards-compatible deactivate route
router.delete("/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid organization ID");
  const data = await Organization.findByIdAndUpdate(id, { isActive: false }, { new: true });
  if (!data) throw new AppError(404, "Organization not found");
  await User.updateMany({ organizationId: id, role: "admin" }, { isActive: false });
  res.status(200).json({ message: "Organization deactivated", data });
});

// Create an admin inside an organization
router.post("/organization/:id/admin", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid organization ID");
  const organization = await Organization.findById(id);
  if (!organization) throw new AppError(404, "Organization not found");
  const name = req.body.name?.trim();
  const email = req.body.email?.trim().toLowerCase();
  const { password } = req.body;
  if (!name || name.length < 2 || name.length > 20) throw new AppError(400, "Name must be 2-20 characters");
  if (!email || !validator.isEmail(email)) throw new AppError(400, "Enter a valid email");
  if (!password || !validator.isStrongPassword(password)) throw new AppError(400, "Use a strong password (upper/lowercase, number and symbol)");
  if (await User.findOne({ email })) throw new AppError(409, "Email is already registered");
  const data = await User.create({
    name, email, password: await bcrypt.hash(password, 10),
    organizationId: organization._id, role: "admin", isActive: organization.isActive,
  });
  res.status(201).json({ message: "Admin created", data: { _id: data._id, name: data.name, email: data.email, role: data.role, isActive: data.isActive } });
});

// List admins for one organization
router.get("/organization/:id/admin", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid organization ID");
  const organization = await Organization.findById(id);
  if (!organization) throw new AppError(404, "Organization not found");
  const data = await User.find({ organizationId: id, role: "admin" }).select("name email isActive createdAt");
  res.status(200).json({ data });
});

// Activate/deactivate an admin
router.patch("/admin/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid admin ID");
  if (typeof req.body.isActive !== "boolean") throw new AppError(400, "isActive must be true or false");
  const data = await User.findOneAndUpdate({ _id: id, role: "admin" }, { isActive: req.body.isActive }, { new: true }).select("name email role isActive organizationId");
  if (!data) throw new AppError(404, "Admin not found");
  res.status(200).json({ message: "Admin updated", data });
});

router.delete("/admin/:id", async (req, res) => {
  const { id } = req.params;
  if (!mongoose.Types.ObjectId.isValid(id)) throw new AppError(400, "Invalid admin ID");
  const data = await User.findOneAndUpdate({ _id: id, role: "admin" }, { isActive: false }, { new: true }).select("name email role isActive organizationId");
  if (!data) throw new AppError(404, "Admin not found");
  res.status(200).json({ message: "Admin deactivated", data });
});

module.exports = { OwnerRouter: router };
