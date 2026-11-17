
const axios = require("axios");
const { trackStockStatusChange } = require("../Services/stockService");
const StockHistory = require("../Model/StockHistory");
const Product = require("../Model/ProductSchema");
const PriceHistory = require("../Model/PriceHistorySchema");
const MonitoringLog = require("../Model/MonitoringLogSchema");
const sendEmail = require("../Utils/sendEmail");

const BASE_URL = "https://instamart.in";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";


// =====================================================
// 1. EXTRACT INSTAMART SPIN ID
// =====================================================

const getInstamartSpinId = (productUrl) => {
  try {
    const url = new URL(String(productUrl));

    if (!url.hostname.toLowerCase().endsWith("instamart.in")) {
      return null;
    }

    const lastPart = url.pathname.split("/").filter(Boolean).pop() || "";
    const match = lastPart.match(/([A-Z0-9]{10})$/i);

    return match ? match[1].toUpperCase() : null;
  } catch {
    return null;
  }
};


// =====================================================
// 2. RESOLVE PIN CODE TO INSTAMART STORE ID
// =====================================================

const resolveInstamartStoreId = async (pincode) => {
  const pin = String(pincode || "").trim();

  if (!/^\d{6}$/.test(pin)) {
    throw new Error("Please enter a valid 6-digit PIN code.");
  }

  console.log("Resolving Instamart location for:", pin);

  // Step 1: Get latitude and longitude from the PIN code.
  const geoResponse = await axios.get(
    "https://nominatim.openstreetmap.org/search",
    {
      params: {
        postalcode: pin,
        country: "India",
        countrycodes: "in",
        format: "jsonv2",
        limit: 1,
      },
      headers: {
        "User-Agent": "QuickCommerceStockWatcher/1.0",
      },
      timeout: 15000,
    }
  );

  if (!geoResponse.data?.length) {
    throw new Error(`Coordinates not found for PIN code ${pin}.`);
  }

  const lat = Number(geoResponse.data[0].lat);
  const lng = Number(geoResponse.data[0].lon);
  const address = geoResponse.data[0].display_name || "";

  // Step 2: Prepare request headers.
  const headers = {
    Accept: "application/json, */*",
    "Content-Type": "application/json",
    Origin: BASE_URL,
    Referer: `${BASE_URL}/`,
    "User-Agent": USER_AGENT,
  };

  if (process.env.INSTAMART_COOKIE) {
    headers.Cookie = process.env.INSTAMART_COOKIE;
  }

  // Step 3: Send the location to Instamart.
  const response = await axios.post(
    `${BASE_URL}/api/instamart/home/select-location/v2`,
    {
      data: {
        lat,
        lng,
        address,
        addressId: "",
        annotation: address,
        clientId: "INSTAMART-APP",
      },
    },
    {
      headers,
      timeout: 20000,
    }
  );

  console.log("LOCATION API STATUS:", response.status);
  console.log(
    "LOCATION API RESPONSE:",
    JSON.stringify(response.data, null, 2)
  );

  // Step 4: Find the primary store/POD ID in the response.
  const findPrimaryPodId = (value) => {
    if (!value || typeof value !== "object") {
      return null;
    }

    if (Array.isArray(value)) {
      for (const item of value) {
        const result = findPrimaryPodId(item);
        if (result) return result;
      }

      return null;
    }

    if (Array.isArray(value.podDetailsList)) {
      const primaryPod = value.podDetailsList.find(
        (pod) => pod.priority === "PRIORITY_PRIMARY"
      );

      if (primaryPod?.podId) {
        return primaryPod.podId;
      }
    }

    if (value.podDetails?.podId) {
      return value.podDetails.podId;
    }

    for (const child of Object.values(value)) {
      const result = findPrimaryPodId(child);
      if (result) return result;
    }

    return null;
  };

  const storeId = findPrimaryPodId(response.data);

  if (!storeId) {
    throw new Error(`Primary POD ID not found for PIN code ${pin}.`);
  }

  console.log("Primary Store ID:", storeId);

  return {
    storeId: String(storeId),
    lat,
    lng,
    address,
  };
};


// =====================================================
// 3. TEST LOCATION ENDPOINT
// =====================================================

const testLocation = async (req, res) => {
  try {
    const location = await resolveInstamartStoreId(req.body.pincode);

    return res.status(200).json({
      success: true,
      message: "Instamart location resolved successfully.",
      pincode: String(req.body.pincode).trim(),
      ...location,
    });
  } catch (error) {
    console.error(
      "Location test failed:",
      error.response?.data || error.message
    );

    return res.status(error.response?.status || 422).json({
      success: false,
      message: error.message,
      instamartResponse: error.response?.data || null,
    });
  }
};


// =====================================================
// 4. PRICE HELPER
// =====================================================

const parseMoney = (value) => {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  // Instamart may return money as { units, nanos }.
  if (typeof value === "object") {
    const units = Number(value.units);
    const nanos = Number(value.nanos || 0);

    if (!Number.isFinite(units) || !Number.isFinite(nanos)) {
      return null;
    }

    return Number((units + nanos / 1000000000).toFixed(2));
  }

  // Handle normal numbers and strings such as "1,299".
  const amount = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};


// =====================================================
// 5. FIND PRODUCT USING ITS SPIN ID
// =====================================================

const findInstamartVariation = (value, spinId) => {
  if (!value || typeof value !== "object") {
    return null;
  }

  // Search each item when the response contains an array.
  if (Array.isArray(value)) {
    for (const item of value) {
      const result = findInstamartVariation(item, spinId);
      if (result) return result;
    }

    return null;
  }

  // Check the possible ID fields.
  const ids = [
    value.spinId,
    value.spin_id,
    value.productId,
    value.product_id,
    value.id,
  ];

  const matched = ids.some(
    (id) => String(id || "").trim().toUpperCase() === spinId
  );

  if (matched) {
    return value;
  }

  // Search inside nested objects.
  for (const child of Object.values(value)) {
    const result = findInstamartVariation(child, spinId);
    if (result) return result;
  }

  return null;
};


// =====================================================
// 6. FETCH PRODUCT DETAILS FROM INSTAMART
// =====================================================

const fetchInstamartData = async (product, resolvedLocation = null) => {
  // Get the Spin ID from the saved product or product URL.
  const spinId =
    product.instamartSpinId ||
    getInstamartSpinId(product.productUrl);

  if (!spinId) {
    throw new Error("Could not extract Instamart Spin ID.");
  }

  // Use the supplied location or resolve it using the PIN code.
  const location = resolvedLocation?.storeId
    ? resolvedLocation
    : await resolveInstamartStoreId(product.pincode);

  if (!location?.storeId) {
    throw new Error("Instamart Store ID is missing.");
  }

  // Prepare request headers.
  const headers = {
    Accept: "application/json, */*",
    Origin: BASE_URL,
    Referer: product.productUrl || `${BASE_URL}/`,
    "User-Agent": USER_AGENT,
  };

  if (process.env.INSTAMART_COOKIE) {
    headers.Cookie = process.env.INSTAMART_COOKIE;
  }

  // Create the product API URL.
  const url =
    `${BASE_URL}/api/instamart/item/v2/spin/` +
    `${encodeURIComponent(spinId)}?storeId=${encodeURIComponent(location.storeId)}`;

  console.log("Instamart Product API URL:", url);
  console.log("Fetching Spin ID:", spinId);
  console.log("Using Store ID:", location.storeId);

  // Request product details from Instamart.
  const response = await axios.get(url, {
    headers,
    timeout: 20000,
    maxRedirects: 3,
  });

  console.log("PRODUCT API STATUS:", response.status);
  console.log("PRODUCT RESPONSE TYPE:", typeof response.data);
  console.log("PRODUCT RESPONSE DATA:", JSON.stringify(response.data));

  // Find the product in the API response.
  const item = findInstamartVariation(response.data, spinId);

  console.log("TARGET SPIN ID:", spinId);
  console.log("MATCHING PRODUCT:", item ? "Found" : "Not found");

  if (!item) {
    throw new Error(
      `Product ${spinId} was not found in the Instamart response.`
    );
  }

  // Get stock information.
  const stockValue =
    item.inventory?.inStock ??
    item.inStock ??
    item.isAvail;

  const stockStatus =
    typeof stockValue === "boolean"
      ? stockValue
        ? "In Stock"
        : "Out of Stock"
      : "Unknown";

  // Get price and MRP.
  const priceObject = item.price || {};

  const price = parseMoney(
    priceObject.offerPrice ??
    priceObject.sellingPrice ??
    priceObject.price ??
    item.offerPrice ??
    item.sellingPrice
  );

  const mrp = parseMoney(
    priceObject.mrp ??
    item.mrp
  );

  return {
    productName:
      item.displayName ||
      item.name ||
      item.productName ||
      null,

    price,
    mrp,
    stockStatus,

    availableUnits:
      item.inventory?.availableUnits ??
      item.availableUnits ??
      null,

    instamartSpinId: spinId,
    storeId: String(location.storeId),
    locationLat: location.lat,
    locationLng: location.lng,
    locationAddress: location.address || "",
  };
};


// =====================================================
// 7. VALIDATE FETCHED PRODUCT DETAILS
// =====================================================

const validateFetchedProduct = (details) => {
  const productName = String(details?.productName || "").trim();
  const price = Number(details?.price);

  if (!productName) {
    throw new Error(
      "Instamart did not return a valid product name."
    );
  }

  if (
    details?.price === null ||
    details?.price === undefined ||
    details?.price === "" ||
    !Number.isFinite(price) ||
    price <= 0
  ) {
    throw new Error(
      "Instamart did not return a valid product price."
    );
  }

  return {
    ...details,
    productName,
    price,
  };
};


// =====================================================
// 8. SAVE MONITORING LOG
// =====================================================

const saveMonitoringLog = async (logData) => {
  try {
    await MonitoringLog.create(logData);
  } catch (error) {
    console.error("Monitoring log failed:", error.message);
  }
};


// =====================================================
// 9. PREVIEW PRODUCT
// =====================================================

const previewProduct = async (req, res) => {
  try {
    const { productUrl, pincode } = req.body;

    if (!productUrl || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Instamart URL and PIN code are required.",
      });
    }

    const pin = String(pincode).trim();
    const cleanUrl = String(productUrl).trim();

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code.",
      });
    }

    const spinId = getInstamartSpinId(cleanUrl);

    if (!spinId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Instamart product URL.",
      });
    }

    // Resolve the PIN code to a store ID.
    const location = await resolveInstamartStoreId(pin);

    // Fetch product details using the URL and location.
    const fetchedDetails = await fetchInstamartData(
      {
        productUrl: cleanUrl,
        pincode: pin,
        instamartSpinId: spinId,
      },
      location
    );

    const details = validateFetchedProduct(fetchedDetails);

    return res.status(200).json({
      success: true,
      message: `Instamart product fetched for PIN code ${pin}.`,
      details: {
        ...details,
        pincode: pin,
      },
    });
  } catch (error) {
    console.error("Preview failed:", error.message);

    return res.status(error.response?.status || 422).json({
      success: false,
      message: error.message,
      instamartStatus: error.response?.status || null,
      instamartResponse: error.response?.data || null,
    });
  }
};


// =====================================================
// 10. ADD PRODUCT
// =====================================================

const addProduct = async (req, res) => {
  try {
    // Current frontend sends productUrl and pincode.
    const { productUrl, pincode } = req.body;

    if (!productUrl || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Instamart URL and PIN code are required.",
      });
    }

    const pin = String(pincode).trim();
    const cleanUrl = String(productUrl).trim();

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code.",
      });
    }

    const spinId = getInstamartSpinId(cleanUrl);

    if (!spinId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Instamart product URL.",
      });
    }

    // Resolve location.
    const location = await resolveInstamartStoreId(pin);

    // Fetch the latest product details.
    const fetchedDetails = await fetchInstamartData(
      {
        productUrl: cleanUrl,
        pincode: pin,
        instamartSpinId: spinId,
      },
      location
    );

    const details = validateFetchedProduct(fetchedDetails);
    const checkedAt = new Date();

    // Save the product in MongoDB.
    const product = await Product.create({
      productName: details.productName,
      productUrl: cleanUrl,
      pincode: pin,
      instamartSpinId: spinId,
      storeId: location.storeId,
      locationLat: location.lat,
      locationLng: location.lng,
      locationAddress: location.address,
      price: details.price,
      mrp: details.mrp,
      inStock: details.stockStatus === "In Stock",
      stockStatus: details.stockStatus,
      availableUnits: details.availableUnits,
      stockCheckedAt: checkedAt,
      lastCheckedAt: checkedAt,
    });

    // Save the first price record.
    await PriceHistory.create({
      productId: product._id,
      price: details.price,
    });

    // Save the initial monitoring log.
    await saveMonitoringLog({
      productId: product._id,
      productName: product.productName,
      status: "success",
      message: "Initial Instamart product details saved.",
      price: details.price,
      source: "manual",
    });

    return res.status(201).json({
      success: true,
      message: "Instamart product added successfully.",
      product,
    });
  } catch (error) {
    console.error("Add product failed:", error.message);

    return res.status(error.response?.status || 422).json({
      success: false,
      message: error.message,
      instamartStatus: error.response?.status || null,
      instamartResponse: error.response?.data || null,
    });
  }
};


// =====================================================
// 11. GET ALL PRODUCTS
// =====================================================

const getProducts = async (req, res) => {
  try {
    const products = await Product.find().sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      totalProducts: products.length,
      products,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// 12. DELETE PRODUCT
// =====================================================

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    // Also delete the product's history and monitoring logs.
    await PriceHistory.deleteMany({ productId: product._id });
    await MonitoringLog.deleteMany({ productId: product._id });

    return res.status(200).json({
      success: true,
      message: "Product deleted successfully.",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// 13. UPDATE PRODUCT
// =====================================================

const updateProduct = async (req, res) => {
  try {
    const { productName, productUrl, pincode } = req.body;

    if (!productName || !productUrl || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Product name, Instamart URL and PIN code are required.",
      });
    }

    const pin = String(pincode).trim();
    const cleanUrl = String(productUrl).trim();

    if (!/^\d{6}$/.test(pin)) {
      return res.status(400).json({
        success: false,
        message: "Please enter a valid 6-digit PIN code.",
      });
    }

    const spinId = getInstamartSpinId(cleanUrl);

    if (!spinId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Instamart product URL.",
      });
    }

    const location = await resolveInstamartStoreId(pin);

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      {
        productName: String(productName).trim(),
        productUrl: cleanUrl,
        pincode: pin,
        instamartSpinId: spinId,
        storeId: location.storeId,
        locationLat: location.lat,
        locationLng: location.lng,
        locationAddress: location.address,
        inStock: false,
        stockStatus: "Unknown",
        availableUnits: null,
        stockCheckedAt: null,
      },
      {
        new: true,
        runValidators: true,
      }
    );

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Instamart product updated.",
      product,
    });
  } catch (error) {
    console.error("Update product failed:", error.message);

    return res.status(error.response?.status || 422).json({
      success: false,
      message: error.message,
      instamartStatus: error.response?.status || null,
      instamartResponse: error.response?.data || null,
    });
  }
};


// =====================================================
// 14. CHECK PRODUCT PRICE AND STOCK
// =====================================================

const checkProductPrice = async (productId, source = "automatic") => {
  let product;

  try {
    product = await Product.findById(productId);

    if (!product) {
      return {
        success: false,
        message: "Product not found.",
      };
    }

    let location;

    // Reuse the saved store ID when location details are available.
    if (
      product.storeId &&
      product.locationLat !== null &&
      product.locationLat !== undefined &&
      product.locationLng !== null &&
      product.locationLng !== undefined
    ) {
      location = {
        storeId: product.storeId,
        lat: product.locationLat,
        lng: product.locationLng,
        address: product.locationAddress,
      };
    } else {
      // Otherwise resolve the location again.
      location = await resolveInstamartStoreId(product.pincode);

      product.storeId = location.storeId;
      product.locationLat = location.lat;
      product.locationLng = location.lng;
      product.locationAddress = location.address;
    }

    // Fetch the latest product information.
    const extracted = await fetchInstamartData(product, location);

    const now = new Date();
    const previousPrice = Number(product.price || 0);

    if (extracted.productName) {
      product.productName = extracted.productName;
    }

    // Update price and save price history.
    if (extracted.price !== null) {
      product.price = extracted.price;
      product.lastCheckedAt = now;

      await PriceHistory.create({
        productId: product._id,
        price: extracted.price,
      });
    }

    if (extracted.mrp !== null) {
      product.mrp = extracted.mrp;
    }

    // Track stock changes before updating the saved stock status.
    await trackStockStatusChange(product, extracted.stockStatus);

    // Update stock information.
    product.stockStatus = extracted.stockStatus;
    product.inStock = extracted.stockStatus === "In Stock";
    product.availableUnits = extracted.availableUnits;
    product.stockCheckedAt = now;

    await product.save();

    const foundData =
      extracted.price !== null ||
      extracted.mrp !== null ||
      extracted.stockStatus !== "Unknown";

    const message = foundData
      ? `Instamart check completed. Stock: ${product.stockStatus}; ${
          extracted.price !== null
            ? `price: ₹${extracted.price}`
            : "price not returned"
        }.`
      : "Instamart returned no usable price or stock information.";

    // Send an email when the price changes.
    if (
      extracted.price !== null &&
      previousPrice > 0 &&
      previousPrice !== extracted.price
    ) {
      const direction =
        extracted.price < previousPrice ? "decreased" : "increased";

      const emailMessage = `
Hello,

The price of your tracked Instamart product has changed.

Product: ${product.productName}
Previous Price: ₹${previousPrice}
Current Price: ₹${extracted.price}
Price ${direction} by: ₹${Math.abs(previousPrice - extracted.price)}
PIN code: ${product.pincode}
Product Link: ${product.productUrl}
Checked At: ${now.toLocaleString()}

Quick Commerce Stock Watcher
`;

      const emailResult = await sendEmail(
        `Price Alert: ${product.productName}`,
        emailMessage
      );

      if (!emailResult?.success) {
        console.log("Price alert email failed:", emailResult?.message);
      }
    }

    // Save the result of this monitoring cycle.
    await saveMonitoringLog({
      productId: product._id,
      productName: product.productName,
      status: foundData ? "success" : "failed",
      message,
      price: extracted.price,
      source,
    });

    return {
      success: foundData,
      message,
      price: extracted.price,
      stockStatus: product.stockStatus,
      product,
    };
  } catch (error) {
    const message =
      `${error.message}. Previously saved product details were kept.`;

    console.error(
      `${product?.productName || "Instamart product"} check failed:`,
      error.message
    );

    await saveMonitoringLog({
      productId: product?._id || productId,
      productName: product?.productName || "Unknown product",
      status: "failed",
      message,
      source,
    });

    return {
      success: false,
      message,
    };
  }
};


// =====================================================
// 15. MANUAL PRODUCT CHECK
// =====================================================

const checkProduct = async (req, res) => {
  try {
    const result = await checkProductPrice(req.params.id, "manual");

    const statusCode = result.success
      ? 200
      : result.message === "Product not found."
        ? 404
        : 422;

    return res.status(statusCode).json(result);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// 16. GET PRICE HISTORY
// =====================================================

const getPriceHistory = async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

    const history = await PriceHistory.find({
      productId: req.params.id,
    }).sort({ checkedAt: 1 });

    return res.status(200).json({
      success: true,
      productName: product.productName,
      history,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// 17. GET MONITORING LOGS
// =====================================================

const getMonitoringLogs = async (req, res) => {
  try {
    let limit = Number(req.query.limit) || 100;

    limit = Math.min(Math.max(limit, 1), 500);

    const logs = await MonitoringLog.find()
      .sort({ checkedAt: -1 })
      .limit(limit);

    return res.status(200).json({
      success: true,
      totalLogs: logs.length,
      logs,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};


// =====================================================
// 18. GET STOCK HISTORY
// =====================================================

const getStockHistory = async (req, res) => {
  try {
    const history = await StockHistory.find()
      .populate("productId", "productName productUrl pincode")
      .sort({ changedAt: -1 });

    return res.status(200).json({
      success: true,
      totalRecords: history.length,
      history,
    });

  } catch (error) {
    return res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

module.exports = {
  addProduct,
  previewProduct,
  getProducts,
  deleteProduct,
  updateProduct,
  checkProduct,
  getPriceHistory,
  getMonitoringLogs,
  checkProductPrice,
  testLocation,
    getStockHistory,
};
