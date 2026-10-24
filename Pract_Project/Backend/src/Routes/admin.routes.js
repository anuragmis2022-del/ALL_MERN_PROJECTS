const express = require("express");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");
const { Team } = require("../Model/Team.Schema");
const { AppError } = require("../Utils/AppError");
const mongoose = require("mongoose");
const validator = require("validator");
const router = express.Router();
const bcrypt = require("bcrypt");
const { User } = require("../Model/User.Schema");
const { Task } = require("../Model/Task.Schema");

router.post("/teams", isLoggedIn, authorize("admin"), async (req, res) => {
  const { name } = req.body;

  if (!name || !name.trim() || name.trim().length > 50) {
    throw new AppError(400, "Name is invalid");
  }
  // console.log(req.user.organizationId._id);

  const createdTeam = await Team.create({
    name,
    adminId: req.user._id,
    organizationId: req.user.organizationId._id,
  });
  res.status(201).json({
    message: "Team created successfully",
    data: createdTeam,
  });
});

router.get("/teams", isLoggedIn, authorize("admin"), async (req, res) => {
  const organizationId = req.user.organizationId._id;

  // console.log("organizationid", organizationId);
  const foundTeams = await Team.find({ organizationId }).sort({
    createdAt: -1,
  });

  if (!foundTeams) {
    throw new AppError(401, "Organization does not have any have teams ");
  }

  res.status(201).json({
    msg: "All teams are shown below of the specific organizations",
    data: foundTeams,
  });
});

router.get("/teams/:id", isLoggedIn, authorize("admin"), async (req, res) => {
  const { id } = req.params;

  // const organizationId = req.user.organizationId._id;
  // console.log("here i am printing req.user", req.user);

  // console.log("organizationid", organizationId);
  const foundTeams = await Team.findOne({
    _id: id,
    organizationId: req.user.organizationId._id,
  });

  // console.log("found team by id ", foundTeams);
  if (!foundTeams) {
    throw new AppError(401, "Organization does not have any have teams ");
  }

  res.status(201).json({
    msg: "All teams are shown below of the specific organizations",
    foundTeams,
  });
});

// router.patch();
router.delete(
  "/teams/:id",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      throw new AppError(400, "Invalid ID");
    }

    const deletedUser = await Team.findOne({
      _id: id,
      organizationId: req.user.organizationId._id,
    });

    if (!deletedUser) {
      throw new AppError(400, "Team does not found ");
    }

    deletedUser.isActive = false;

    await deletedUser.save();

    res.status(201).json({
      msg: "Team  is deleted Successfully ",
      data: deletedUser,
    });
  },
);

router.patch("/teams/:id", isLoggedIn, authorize("admin"), async (req, res) => {
  const { name, isActive } = req.body;
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    throw new AppError(400, "Id doesn't exist in DB");
  }
  if (!name || name.trim().length > 50) {
    throw new AppError(400, "Invalid name");
  }
  const updatedUser = await Team.findOneAndUpdate(
    { _id: id, organizationId: req.user.organizationId._id },
    { name: name.trim(), isActive: isActive ?? true },
    { new: true, runValidators: true },
  );

  if (!updatedUser) throw new AppError(404, "Team not found");

  res.status(201).json({
    msg: "updated Successfully ",
    data: updatedUser,
  });
});

/*
   Admin for employees 
*/

router.post(
  "/teams/:teamId/employees",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    console.log(Team);
    const { teamId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new AppError(401, "team Id is invalid");
    }

    console.log("hello");

    const foundTeam = await Team.findOne({
      _id: teamId,
      organizationId: req.user.organizationId._id,
    });

    if (!foundTeam) {
      throw new AppError(
        402,
        "TEam not found, when trying to add employee in it ",
      );
    }

    if (!foundTeam.isActive) {
      throw new AppError(400, "Can not add employee in the Inactive Team. ");
    }

    const { name, email, password } = req.body;

    if (!name || name.trim().length > 50) {
      throw new AppError(401, "Invalid name");
    }
    if (!email || !validator.isEmail(email)) {
      throw new AppError(401, "Invalid Email");
    }
    if (!validator.isStrongPassword(password)) {
      throw new AppError(401, "Invalid password");
    }

    const hashPassword = await bcrypt.hash(password, 10);

    if (await User.findOne({ email: email.toLowerCase() }))
      throw new AppError(409, "Email is already registered");

    const createdEmployee = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashPassword,
      role: "employee",
      organizationId: req.user.organizationId._id,
      teamId: teamId,
    });

    res.status(201).json({
      message: "Employee created ",
      data: createdEmployee,
    });
  },
);

router.get(
  "/teams/:teamId/employees",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    const { teamId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(teamId)) {
      throw new AppError(400, "Team Id is invalid");
    }

    const foundTeam = await Team.findOne({
      _id: teamId,
      organizationId: req.user.organizationId._id,
    });

    if (!foundTeam) {
      throw new AppError(400, "Team not found");
    }

    const employees = await User.find({
      teamId: teamId,
      organizationId: req.user.organizationId._id,
      role: "employee",
    });

    res.status(200).json({
      message: "All employees of the team",
      data: employees,
    });
  },
);

router.delete(
  "/employees/:employeeId",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new AppError(400, "Invalid ID");
    }

    const foundEmployee = await User.findOne({
      _id: employeeId,
      role: "employee",
      organizationId: req.user.organizationId._id,
    });

    if (!foundEmployee) {
      throw new AppError(401, "Employee dooes not exist");
    }

    foundEmployee.isActive = false;
    await foundEmployee.save();
    res.status(201).json({
      message: "User deleted",
      data: foundEmployee,
    });
  },
);

router.patch(
  "/employees/:employeeId/activate",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    const { employeeId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new AppError(400, "Invalid ID");
    }

    const UpdateEmployee = await User.findOne({
      _id: employeeId,
      role: "employee",
      organizationId: req.user.organizationId._id,
    });

    if (!UpdateEmployee) {
      throw new AppError(401, "Employee dooes not exist");
    }

    UpdateEmployee.isActive = true;
    await UpdateEmployee.save();
    res.status(201).json({
      message: "User deleted",
      data: UpdateEmployee,
    });
  },
);

/*
   UPDATE TASK 
*/

router.post(
  "/tasks/employee/:employeeId",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      throw new AppError(400, "Employee Id Invalid ");
    }

    const foundEmployee = await User.findOne({
      _id: employeeId,
      role: "employee",
      isActive: true,
      teamId: { $ne: null },
      organizationId: req.user.organizationId._id,
    });

    if (!foundEmployee) {
      throw new AppError(
        401,
        "Task cannot be created as employee does not belong to either team or organization",
      );
    }

    console.log("Found Employeee-", foundEmployee);

    const { title, description, status, priority } = req.body;

    if (!title || title.trim().length > 100) {
      throw new AppError(401, "Invalid title");
    }

    if (!description || description.trim().length > 200) {
      throw new AppError(401, "Invalid description");
    }
    if (!status || !["todo", "in-progress", "completed"].includes(status)) {
      throw new AppError(401, "Invalid Status");
    }

    if (!priority || !["low", "medium", "high"].includes(priority)) {
      throw new AppError(401, "Invalid priority");
    }

    const createdTask = await Task.create({
      title,
      description,
      status,
      priority,
      organizationId: req.user.organizationId._id,
      teamId: foundEmployee.teamId,
      adminId: req.user._id,
      assignedTo: employeeId,
      createdBy: req.user._id,
    });

    console.log("createdtask...", createdTask);

    res.status(201).json({
      msg: "task completed succesfully",
      Task: createdTask,
    });
  },
);
router.get("/alltask", isLoggedIn, authorize("employee"), async (req, res) => {
  const foundAllTask = await Task.find({
    assignedTo: req.user._id,
    organizationId: req.user.organizationId._id,
  });

  res.status(201).json({
    msg: "All task are stated below",
    foundAllTask,
  });
});

router.get(
  "/task/:taskId",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const { taskId } = req.params;

    const foundtask = await Task.findOne({
      _id: taskId,
      organizationId: req.user.organizationId._id,
    });

    if (!foundtask) {
      throw new AppError(401, "Task not found");
    }

    res.status(201).json({
      data: foundtask,
    });
  },
);

router.patch(
  "/task/:taskId",
  isLoggedIn,
  authorize("employee"),
  async (req, res) => {
    const { taskId } = req.params;
    const { title, description, status, priority } = req.body;

    const taskChecking = await Task.findOne({
      _id: taskId,
      organizationId: req.user.organizationId._id,
    });

    if (!taskChecking) {
      throw new AppError(401, "Invalid Task Id ");
    }

    if (status && !["todo", "in-progress", "completed"].includes(status))
      throw new AppError(400, "Invalid status");
    const updatedTask = await Task.findOneAndUpdate(
      { _id: taskId, assignedTo: req.user._id },
      { status },
      { new: true, runValidators: true },
    );

    res.status(200).json({
      msg: "Task updated",
      data: updatedTask,
    });
  },
);

// router.delete("/task/:taskId", isLoggedIn, authorize, async(req, res)=>{

// })

router.post("/employees", isLoggedIn, authorize("admin"), async (req, res) => {
  const { name, email, password } = req.body;

  if (!name || name.trim().length < 2 || name.trim().length > 20) {
    throw new AppError(400, "Invalid employee name");
  }

  if (!email || !validator.isEmail(email)) {
    throw new AppError(400, "Invalid email");
  }

  if (!password || !validator.isStrongPassword(password)) {
    throw new AppError(400, "Password is not strong enough");
  }

  const normalizedEmail = email.trim().toLowerCase();

  const existingEmployee = await User.findOne({
    email: normalizedEmail,
  });

  if (existingEmployee) {
    throw new AppError(409, "Email is already registered");
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const employee = await User.create({
    name: name.trim(),
    email: normalizedEmail,
    password: hashedPassword,
    role: "employee",
    organizationId: req.user.organizationId._id,
    // No teamId: employee is initially unassigned.
  });

  res.status(201).json({
    message: "Employee created successfully",
    data: employee,
  });
});

router.get("/employees", isLoggedIn, authorize("admin"), async (req, res) => {
  const employees = await User.find({
    organizationId: req.user.organizationId._id,
    role: "employee",
    isActive: true,
  })
    .select("-password")
    .populate("teamId", "name");

  res.status(200).json({
    message: "Organization employees",
    data: employees,
  });
});

router.patch(
  "/teams/:teamId/employees/:employeeId",
  isLoggedIn,
  authorize("admin"),
  async (req, res) => {
    const { teamId, employeeId } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(teamId) ||
      !mongoose.Types.ObjectId.isValid(employeeId)
    ) {
      throw new AppError(400, "Invalid team or employee ID");
    }

    const organizationId = req.user.organizationId._id;

    const team = await Team.findOne({
      _id: teamId,
      organizationId,
      isActive: true,
    });

    if (!team) {
      throw new AppError(404, "Active team not found");
    }

    const employee = await User.findOne({
      _id: employeeId,
      organizationId,
      role: "employee",
      isActive: true,
    });

    if (!employee) {
      throw new AppError(404, "Active employee not found");
    }

    // Assign or move the employee to the selected team.
    employee.teamId = team._id;
    await employee.save();

    res.status(200).json({
      message: "Employee assigned to team successfully",
      data: {
        _id: employee._id,
        name: employee.name,
        email: employee.email,
        teamId: employee.teamId,
      },
    });
  },
);

module.exports = {
  adminRouter: router,
};
