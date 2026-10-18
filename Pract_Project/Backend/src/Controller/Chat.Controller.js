
const mongoose = require("mongoose");
const { Message } = require("../Model/Message.Schema");
const { User } = require("../Model/User.Schema");
const { Team } = require("../Model/Team.Schema");

// Get the logged-in user's ID from authentication middleware
const getCurrentUserId = (req) => {
  return req.user?._id || req.user?.id || null;
};

// Check whether a user can chat with another user.
// Return the authorized team document, not just true/false.
const getAuthorizedTeam = async (currentUser, receiver) => {
  if (!currentUser || !receiver) return null;

  if (!currentUser.isActive || !receiver.isActive) {
    return null;
  }

  if (
    !currentUser.organizationId ||
    !receiver.organizationId ||
    currentUser.organizationId.toString() !==
      receiver.organizationId.toString()
  ) {
    return null;
  }

  // Employee must belong to the same organization and team
  // managed by the selected admin.
  if (
    currentUser.role === "employee" &&
    receiver.role === "admin"
  ) {
    if (!currentUser.teamId) return null;

    return Team.findOne({
      _id: currentUser.teamId,
      adminId: receiver._id,
      organizationId: currentUser.organizationId,
      isActive: true,
    });
  }

  // Admin can chat with an employee only in a team
  // managed by that admin.
  if (
    currentUser.role === "admin" &&
    receiver.role === "employee"
  ) {
    if (!receiver.teamId) return null;

    return Team.findOne({
      _id: receiver.teamId,
      adminId: currentUser._id,
      organizationId: currentUser.organizationId,
      isActive: true,
    });
  }

  // Employees can chat with other employees on their team.
  if (
    currentUser.role === "employee" &&
    receiver.role === "employee"
  ) {
    if (
      !currentUser.teamId ||
      !receiver.teamId ||
      currentUser.teamId.toString() !==
        receiver.teamId.toString()
    ) {
      return null;
    }

    return Team.findOne({
      _id: currentUser.teamId,
      organizationId: currentUser.organizationId,
      isActive: true,
    });
  }

  return null;
};

// Shared validation for GET and POST requests.
const getChatContext = async (req, res) => {
  const currentUserId = getCurrentUserId(req);
  const { receiverId } = req.params;

  if (!currentUserId) {
    res.status(401).json({
      success: false,
      message: "User is not logged in",
    });
    return null;
  }

  if (
    !mongoose.Types.ObjectId.isValid(
      currentUserId.toString()
    ) ||
    !mongoose.Types.ObjectId.isValid(receiverId)
  ) {
    res.status(400).json({
      success: false,
      message: "Invalid user ID",
    });
    return null;
  }

  if (currentUserId.toString() === receiverId.toString()) {
    res.status(400).json({
      success: false,
      message: "You cannot chat with yourself",
    });
    return null;
  }

  const [currentUser, receiver] = await Promise.all([
    User.findById(currentUserId),
    User.findById(receiverId),
  ]);

  if (!currentUser || !receiver) {
    res.status(404).json({
      success: false,
      message: "User not found",
    });
    return null;
  }

  const team = await getAuthorizedTeam(
    currentUser,
    receiver
  );

  if (!team) {
    res.status(403).json({
      success: false,
      message: "You are not allowed to chat with this user",
    });
    return null;
  }

  return {
    currentUser,
    receiver,
    team,
  };
};

// GET /api/chat/:receiverId
const getMessages = async (req, res, next) => {
  try {
    const context = await getChatContext(req, res);
    if (!context) return;

    const { currentUser, receiver, team } = context;

    // Use sender and receiver, matching Message.Schema.js.
    // Restrict the history to this team's conversation.
    const messages = await Message.find({
      teamId: team._id,
      $or: [
        {
          sender: currentUser._id,
          receiver: receiver._id,
        },
        {
          sender: receiver._id,
          receiver: currentUser._id,
        },
      ],
    }).sort({ createdAt: 1 });

    return res.status(200).json({
      success: true,
      messages,
    });
  } catch (error) {
    next(error);
  }
};

// POST /api/chat/:receiverId
const sendMessage = async (req, res, next) => {
  try {
    const context = await getChatContext(req, res);
    if (!context) return;

    const { currentUser, receiver, team } = context;
    const { message, text, content } = req.body || {};

    const messageText =
      typeof message === "string"
        ? message
        : typeof text === "string"
          ? text
          : typeof content === "string"
            ? content
            : "";

    if (!messageText.trim()) {
      return res.status(400).json({
        success: false,
        message: "Message cannot be empty",
      });
    }

    // These field names EXACTLY match Message.Schema.js.
    const newMessage = await Message.create({
      sender: currentUser._id,
      receiver: receiver._id,
      teamId: team._id,
      message: messageText.trim(),
    });

    // Emit to the receiver's private Socket.IO room.
    const io = req.app.get("io");

    if (io) {
      io.to(receiver._id.toString()).emit(
        "receiveMessage",
        newMessage
      );
    }

    return res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getMessages,
  sendMessage,
};
