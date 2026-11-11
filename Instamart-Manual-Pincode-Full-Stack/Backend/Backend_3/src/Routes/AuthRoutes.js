const express = require("express");
const router = express.Router();
const { login, logout, getCurrentAdmin } = require("../Controller/AuthController");
const requireAdmin = require("../Middleware/requireAdmin");

router.post("/login", login);
router.post("/logout", logout);
router.get("/me", requireAdmin, getCurrentAdmin);

module.exports = { AuthRouter: router };
