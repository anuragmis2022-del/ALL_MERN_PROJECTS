const mongoose = require("mongoose");
const express = require("express");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");
const { Task } = require("../Model/Task.Schema");
const { AppError } = require("../Utils/AppError");
const router = express.Router();

router.post("/tasks", isLoggedIn, authorize("employee"), async (req, res) => {
  const id = req.user._id;
  const alltask = await Task.find({
    assignedTo: id,
  });

  res.status(200).json({
    data: alltask,
  });
});
router.get(
  "/tasks/:taskId",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const id = req.user._id;
    const { taskId } = req.params;

    console.log("task", Task, "And taskId", taskId);
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid Task ID ");
    }

    const data = await Task.findOne({
      assignedTo: id,
      _id: taskId,
    });

    res.status(200).json({
      data,
    });
  },
);
router.patch(
  "/tasks/:taskId",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const id = req.user._id;
    const { taskId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(taskId)) {
      throw new AppError(400, "Invalid Task ID ");
    }

    const foundtask = await Task.findOne({
      assignedTo: id,
      _id : taskId,
    });

    if (!foundtask) {
      throw new AppError(
        400,
        "Task does not found or not task is assigned to the employee ",
      );
    }

    const { status } = req.body;

    if (!status || !["todo", "in-progress", "completed"].includes(status)) {
      throw new AppError(400, "Invalid Status is given");
    }

    const updatedTask = await Task.findByIdAndUpdate(
      taskId,
      {
        status,
      },
      { runValidators: true, returnDocument: "after" },
    );

    res.status(200).json({
      msg: "Updated Task ",
      data: updatedTask,
    });
  },
);

module.exports = {
  employeeRouter: router,
};
