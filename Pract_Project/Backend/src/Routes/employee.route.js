
const mongoose = require("mongoose");
const express = require("express");

const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");

const { Task } = require("../Model/Task.Schema");
const { User } = require("../Model/User.Schema");
const { Team } = require("../Model/Team.Schema");
const { AppError } = require("../Utils/AppError");

const router = express.Router();

// Get all tasks assigned to the logged-in employee
router.get(
  "/tasks",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const id = req.user._id;

    const alltask = await Task.find({
      assignedTo: id,
    });

    res.status(200).json({
      data: alltask,
    });
  }
);

// Get one task assigned to the logged-in employee
router.get(
  "/tasks/:taskId",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const id = req.user._id;
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid Task ID");
    }

    const data = await Task.findOne({
      assignedTo: id,
      _id: taskId,
    });

    if (!data) {
      throw new AppError(404, "Task not found");
    }

    res.status(200).json({
      data,
    });
  }
);

// Update task status
router.patch(
  "/tasks/:taskId",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const id = req.user._id;
    const { taskId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid Task ID");
    }

    const foundtask = await Task.findOne({
      assignedTo: id,
      _id: taskId,
    });

    if (!foundtask) {
      throw new AppError(
        404,
        "Task not found or not assigned to this employee"
      );
    }

    const { status } = req.body;

    if (
      !status ||
      !["todo", "in-progress", "completed"].includes(status)
    ) {
      throw new AppError(400, "Invalid status");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      { status },
      {
        runValidators: true,
        returnDocument: "after",
      }
    );

    res.status(200).json({
      msg: "Task updated",
      data: updatedTask,
    });
  }
);

// Get employees in the logged-in employee's team
router.get(
  "/team-members",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const employee = await User.findById(req.user._id);

    if (!employee || !employee.teamId) {
      return res.status(200).json({
        success: true,
        data: [],
      });
    }

    const employees = await User.find({
      teamId: employee.teamId,
      organizationId: employee.organizationId,
      role: "employee",
      isActive: true,
      _id: { $ne: employee._id },
    }).select("name email role");

    res.status(200).json({
      success: true,
      data: employees,
    });
  }
);

// Get the admin of the logged-in employee's team
router.get(
  "/team-admin",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const employee = await User.findById(req.user._id);

    if (!employee || !employee.teamId) {
      return res.status(404).json({
        success: false,
        message: "Employee is not assigned to a team",
      });
    }

    const team = await Team.findOne({
      _id: employee.teamId,
      organizationId: employee.organizationId,
      isActive: true,
    }).populate("adminId", "name email role");

    if (!team || !team.adminId) {
      return res.status(404).json({
        success: false,
        message: "Team admin not found",
      });
    }

    res.status(200).json({
      success: true,
      admin: team.adminId,
    });
  }
);

module.exports = {
  employeeRouter: router,
};
