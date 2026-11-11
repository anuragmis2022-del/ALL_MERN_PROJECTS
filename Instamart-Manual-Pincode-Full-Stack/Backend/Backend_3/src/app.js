  require("dotenv").config();

  const express = require("express");
  const cors = require("cors");
  const mongoose = require("mongoose");
  const dns = require("dns");
  const cookieParser = require("cookie-parser");

  const { ProductRouter } = require("./Routes/ProductRoutes");
  const { AuthRouter } = require("./Routes/AuthRoutes");
  const requireAdmin = require("./Middleware/requireAdmin");
  const Product = require("./Model/ProductSchema");
  const { checkProductPrice } = require("./Controller/ProductController");

  dns.setServers(["8.8.8.8", "8.8.4.4"]);

  const app = express();
  const allowedOrigins = ["http://localhost:5173", process.env.FRONTEND_URL].filter(Boolean);

  app.use(cors({
    origin: allowedOrigins,
    credentials: true
  }));
  app.use(express.json());
  app.use(cookieParser());

  // Login/logout/session routes are public as appropriate.
  app.use("/api/auth", AuthRouter);

  // All existing product, price-history and monitoring APIs now require admin login.
  app.use("/api/products", requireAdmin, ProductRouter);

  app.get("/", (req, res) => {
    res.status(200).json({ success: true, message: "Quick Commerce Watcher Backend is running!" });
  });

  let isChecking = false;

  const checkAllProducts = async () => {
    if (isChecking) {
      console.log("Previous checking cycle is still running. Skipping this cycle.");
      return;
    }

    isChecking = true;
    let successfulChecks = 0;
    let failedChecks = 0;
    const startedAt = new Date();

    console.log("Automatic product checking started:", startedAt.toLocaleString());

    try {
      const products = await Product.find();
      console.log("Total products:", products.length);

      for (const product of products) {
        const result = await checkProductPrice(product._id, "automatic");
        if (result.success) {
          successfulChecks += 1;
          console.log(`${product.productName}: Price checked at ₹${result.price}`);
        } else {
          failedChecks += 1;
          console.log(`${product.productName}: ${result.message}`);
        }
      }

      console.log("Automatic product checking completed.");
      console.log(`Cycle summary: ${successfulChecks} successful, ${failedChecks} failed.`);
    } catch (error) {
      console.log("Automatic checking error:", error.message);
    } finally {
      isChecking = false;
    }
  };

  const intervalMinutes = Number(process.env.CHECK_INTERVAL_MINUTES) || 15;
  const intervalMilliseconds = intervalMinutes * 60 * 1000;

  mongoose.connect(process.env.MONGO_URI)
    .then(() => {
      console.log("MongoDB Connected Successfully");
      if (!process.env.ADMIN_EMAIL || !process.env.ADMIN_PASSWORD || !process.env.JWT_SECRET) {
        console.warn("WARNING: Admin login is not configured. Add ADMIN_EMAIL, ADMIN_PASSWORD and JWT_SECRET to Backend/.env.");
      }
      const PORT = process.env.PORT || 5000;

      app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`);
        console.log(`Automatic checking interval: ${intervalMinutes} minutes`);
        checkAllProducts();
        setInterval(checkAllProducts, intervalMilliseconds);
      });
    })
    .catch((error) => {
      console.log("MongoDB Connection Failed:", error.message);
    });
