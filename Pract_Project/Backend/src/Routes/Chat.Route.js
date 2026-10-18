
const express = require("express");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");

const {
  getMessages,
  sendMessage,
} = require("../Controller/Chat.Controller");

const router = express.Router();

router.get(
  "/:receiverId",
  isLoggedIn,
  authorize("admin", "employee"),
  getMessages
);

router.post(
  "/:receiverId",
  isLoggedIn,
  authorize("admin", "employee"),
  sendMessage
);

module.exports = {
  chatRouter: router,
};
