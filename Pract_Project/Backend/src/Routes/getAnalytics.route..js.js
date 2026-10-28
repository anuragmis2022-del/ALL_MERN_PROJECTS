
const express = require("express");
const { isLoggedIn } = require("../Middleware/isLoggedIn");
const { authorize } = require("../Middleware/authorize");
const { Organization } = require("../Model/Organization.schema");
const { User } = require("../Model/User.Schema");

const router = express.Router();

// 1. Owner dashboard statistics
router.get("/", isLoggedIn, authorize("owner"), async (req, res) => {
  try {
    const totalOrganization = await Organization.countDocuments();

    const activeOrganization = await Organization.countDocuments({
      isActive: true,
    });

    const totalAdmins = await User.countDocuments({
      role: "admin",
    });

    res.status(200).json({
      data: {
        totalOrganization,
        activeOrganization,
        totalAdmins,
      },
    });
  } catch (err) {
    res.status(500).json({
      msg: "Failed to fetch analytics",
    });
  }
});

// 2. Get all organizations with their admin counts
router.get(
  "/all_Org_Admin",
  isLoggedIn,
  authorize("owner"),
  async (req, res) => {
    try {
      const organizations = await Organization.find();

      const data = [];

      for (let org of organizations) {
        const adminCount = await User.countDocuments({
          organizationId: org._id,
          role: "admin",
        });

        data.push({
          _id: org._id,
          name: org.name,
          isActive: org.isActive,
          createdAt: org.createdAt,
          adminCount,
        });
      }

      res.status(200).json({
        data,
      });
    } catch (err) {
      res.status(500).json({
        msg: "Failed to fetch organizations",
      });
    }
  }
);

module.exports = {
  Analytics: router,
};
