
const { User } = require("../Model/User.Schema");
const bcrypt = require("bcrypt");

const addUser = async ({ name, email, password }) => {

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    console.log("Owner already exists");
    return;
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  await User.create({
    name: name,
    email: email,
    password: hashedPassword,
    role: "owner",
    isActive: true,
  });

  console.log("Owner created successfully");
};

module.exports = { addUser };
