const mongoose = require("mongoose");

const OrganizationSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      maxLength: 100,
      unique: true,
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      immutable: true,
      ref: "User",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Organization = new mongoose.model("Organization", OrganizationSchema);

module.exports = {
  Organization,
};
