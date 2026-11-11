const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true,
    trim: true,
  },
  productUrl: {
    type: String,
    required: true,
    trim: true,
  },
  // Instamart product identifier extracted from the product URL.
  instamartSpinId: {
    type: String,
    required: true,
    trim: true,
  },
  // Store ID returned by Instamart after selecting the PIN-code location.
  storeId: {
    type: String,
    default: "",
    trim: true,
  },
  // Approximate coordinates resolved from the manually entered PIN code.
  locationLat: {
    type: Number,
    default: null,
  },
  locationLng: {
    type: Number,
    default: null,
  },
  locationAddress: {
    type: String,
    default: "",
  },
  pincode: {
    type: String,
    required: true,
    match: /^\d{6}$/,
  },
  mrp: {
    type: Number,
    default: null,
    min: 0,
  },
  price: {
    type: Number,
    default: 0,
    min: 0,
  },
  inStock: {
    type: Boolean,
    default: false,
  },
  stockStatus: {
    type: String,
    enum: ["In Stock", "Out of Stock", "Unknown"],
    default: "Unknown",
  },
  availableUnits: {
    type: Number,
    default: null,
    min: 0,
  },
  stockCheckedAt: {
    type: Date,
    default: null,
  },
  lastCheckedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

const Product = mongoose.model("Product", productSchema);
module.exports = Product;
