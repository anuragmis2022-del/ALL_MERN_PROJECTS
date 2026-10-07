const bcrypt = require("bcrypt");
const { User } = require("../Model/User.Schema");

const addUser = (name, email, password, role) => {
  bcrypt.hash(password, 10).then((data) => {
    User.create({
      name,
      email,
      password: data,
      role: role,
    });
  });
};

module.exports = { addUser };
