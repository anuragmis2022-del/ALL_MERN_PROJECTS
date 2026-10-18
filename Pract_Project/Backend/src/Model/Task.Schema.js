const mongoose = require("mongoose");

const TaskSchema = new mongoose.Schema(
  {
    title: {
      type: "String",
      required: true,
      maxLength: 100,
      trim: true,
    },
    description: {
      type: String,
      required: true,
      maxLength: 200,
    },
    status: {
      type: String,

      enum: ["todo", "in-progress", "completed"],
      default: "todo",
    },

    priority: {
      type: String,

      enum: ["low", "medium", "high"],
      default: "medium",
    },

    organizationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Organization",
      required: true,
      immutable:true 
    },
    teamId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      immutable:true
    },
    adminId:{
      type:mongoose.Schema.Types.ObjectId, 
      required:true, 
      ref:"User", 
      immutable:true
    },
    isActive:{
      type:Boolean, 
      default :true
    }, 
    assignedTo:{
      type:mongoose.Schema.Types.ObjectId, 
      required:true, 
      ref:"User", 
      
      
    }, 
    createdBy:{
      type:mongoose.Schema.Types.ObjectId, 
      required:true, 
      ref:"User", 

    }, 
    dueDate:{
      type:Date
    }
  },
  {
    timestamps: true,
  },
);

const Task = mongoose.model("Task", TaskSchema);

module.exports = {
  Task,
};
