const mongoose = require("mongoose");

const monitoringLogSchema = new mongoose.Schema({
  productId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Product",
    default: null
  },
  productName: {
    type: String,
    default: "Unknown product"
  },
  status: {
    type: String,
    enum: ["success", "failed"],
    required: true
  },
  message: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    default: null
  },
  source: {
    type: String,
    enum: ["manual", "automatic"],
    default: "automatic"
  },
  checkedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

monitoringLogSchema.index({ checkedAt: -1 });

const MonitoringLog = mongoose.model("MonitoringLog", monitoringLogSchema);
module.exports = MonitoringLog;
