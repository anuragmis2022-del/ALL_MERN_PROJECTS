
const mongoose = require("mongoose");

const stockHistorySchema = new mongoose.Schema(
  {
    // Product whose stock status changed
    productId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },

    // Previous stock status
    previousStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Unknown"],
      required: true,
    },

    // New stock status
    newStatus: {
      type: String,
      enum: ["In Stock", "Out of Stock", "Unknown"],
      required: true,
    },

    // Time when stock status changed
    changedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

const StockHistory = mongoose.model(
  "StockHistory",
  stockHistorySchema
);

module.exports = StockHistory;
