
  const express = require("express");
  const router = express.Router();

  const {
    addProduct,
    previewProduct,
    getProducts,
    deleteProduct,
    updateProduct,
    checkProduct,
    getPriceHistory,
    getMonitoringLogs,
    testLocation
  } = require("../Controller/ProductController");

  router.post("/test-location", testLocation);

  router.post("/preview", previewProduct);
  router.post("/add", addProduct);
  router.get("/", getProducts);
  router.get("/monitoring-logs", getMonitoringLogs);
  router.get("/:id/history", getPriceHistory);
  router.post("/:id/check", checkProduct);
  router.delete("/:id", deleteProduct);
  router.patch("/:id", updateProduct);

  module.exports = { ProductRouter: router };
