const express = require("express");
const mongoose = require("mongoose");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");
const { Organization } = require("../Model/Organization.schema");
const { User } = require("../Model/User.Schema");
const router = express.Router();

router.get("/", isLoggedIn, authorize("owner"), async (req, res) => {
  //   const totalOrganization = await Organization.countDocuments();

  const totalAdmins = await User.countDocuments({
    role: "admin",
  });






  const demo = await Organization.aggregate([
    {
      $group: {
        _id: null,
        totalOrganization: {
          $sum: 1,
        },
        activeOrganization: {
          $sum: {
            $cond: ["$isActive", 1, 0],
          },
        },
      },
    },
  ]);

  res.status(200).json({
    data: {
      ...demo[0],
      totalAdmins,
    },
  });
});



router.get("/all_Org_Admin", isLoggedIn, authorize("owner"), async (req, res) => {
  const data = await Organization.aggregate([
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "organizationId",
        as: "admins",
      },
    },
    {
      $addFields: {
        adminCount: {
          $size: {
            $filter: {
              input: "$admins",
              as: "admin",
              cond: {
                $eq: ["$$admin.role", "admin"],
              },
            },
          },
        },
      },
    },
    {
      $project: {
        name: 1,
        isActive: 1,
        createdAt: 1,
        adminCount: 1,
      },
    },
  ]);

  res.status(200).json({
    data,
  });
});



module.exports = {
  Analytics: router,
};
