require("dotenv").config();
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const { User } = require("../Model/User.Schema");

async function createOwner() {
  const { DB_URL, OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD } = process.env;
  if (!DB_URL || !OWNER_NAME || !OWNER_EMAIL || !OWNER_PASSWORD) {
    throw new Error("Set DB_URL, OWNER_NAME, OWNER_EMAIL and OWNER_PASSWORD in Backend/.env first");
  }
  await mongoose.connect(DB_URL);
  const email = OWNER_EMAIL.toLowerCase().trim();
  if (await User.findOne({ email })) {
    console.log("An account with this email already exists.");
    return;
  }
  const password = await bcrypt.hash(OWNER_PASSWORD, 10);
  await User.create({ name: OWNER_NAME.trim(), email, password, role: "owner" });
  console.log("Owner account created. You can now log in through the frontend.");
}

createOwner().catch((error) => { console.error(error.message); process.exitCode = 1; })
  .finally(async () => { if (mongoose.connection.readyState) await mongoose.disconnect(); });
