const express = require("express");
const mongoose = require("mongoose");

const teamSchema = new mongoose.Schema(
  {
    name: {
      type: "String",
      unique: true,
      maxLength: 50,
      required: true,
    },
    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      immutable: true,
    },
    adminId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      immutable: true,
    },
    isActive: {
      type:Boolean,
      default: true,
    },
  },
  { timestamps: true },
);

const Team = mongoose.model("Team", teamSchema);

module.exports={
    Team
}