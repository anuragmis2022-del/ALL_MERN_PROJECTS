
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
    testLocation, 
      getStockHistory

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
router.get("/stock-history", getStockHistory);
  module.exports = { ProductRouter: router };
