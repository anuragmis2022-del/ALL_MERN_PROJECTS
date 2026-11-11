
const axios = require("axios");

const Product = require("../Model/ProductSchema");
const PriceHistory = require("../Model/PriceHistorySchema");
const MonitoringLog = require("../Model/MonitoringLogSchema");
const sendEmail = require("../Utils/sendEmail");

const BASE_URL = "https://instamart.in";

const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36";


// 1. EXTRACT SPIN ID

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


// 2. EXTRACT POD IDs WITH THEIR JSON PATHS

const findPodIdsWithPaths = (
  value,
  results = [],
  path = "data",
  depth = 0
) => {
  if (!value || typeof value !== "object" || depth > 20) {
    return results;
  }

  if (Array.isArray(value)) {
    value.forEach((item, index) => {
      findPodIdsWithPaths(
        item,
        results,
        `${path}[${index}]`,
        depth + 1
      );
    });

    return results;
  }

  for (const [key, child] of Object.entries(value)) {
    if (
      key.toLowerCase() === "podid" &&
      child !== null &&
      child !== undefined &&
      String(child).trim() !== ""
    ) {
      results.push({
        value: String(child).trim(),
        path: `${path}.${key}`,
      });
    }

    if (child && typeof child === "object") {
      findPodIdsWithPaths(
        child,
        results,
        `${path}.${key}`,
        depth + 1
      );
    }
  }

  return results;
};


// 3. AUTOMATIC PINCODE → POD ID RESOLUTION


const resolveInstamartStoreId = async (pincode) => {
  const pin = String(pincode || "").trim();

  if (!/^\d{6}$/.test(pin)) {
    throw new Error("Please enter a valid 6-digit PIN code.");
  }

  console.log("Resolving Instamart location for:", pin);

  // Step 1: Get coordinates from pincode.

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

  // Step 2: Send coordinates to Instamart.

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

console.log(
  "LOCATION API RESPONSE:",
  JSON.stringify(response.data, null, 2)
);
  // Step 3: Get the primary POD ID.

  const storeId =
    response.data?.data?.configs?.IM_PAGE_CONFIGS
      ?.configInfo?.[0]?.card?.podDetails?.podId;

  if (!storeId) {
    throw new Error(
      `Primary POD ID not found for PIN code ${pin}.`
    );
  }

  console.log("Primary Store ID:", storeId);

  return {
    storeId: String(storeId),
    lat,
    lng,
    address,
  };
};



// 4. TEST LOCATION ENDPOINT

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


// 5. PRICE HELPER

const parseMoney = (value) => {
  if (value === null || value === undefined) return null;

  if (typeof value === "object") {
    const units = Number(value.units);
    const nanos = Number(value.nanos || 0);

    if (!Number.isFinite(units) || !Number.isFinite(nanos)) {
      return null;
    }

    return Number((units + nanos / 1000000000).toFixed(2));
  }

  const amount = Number(String(value).replace(/,/g, ""));

  return Number.isFinite(amount) && amount >= 0 ? amount : null;
};


// 6. FIND EXACT PRODUCT VARIATION

const findInstamartVariation = (value, spinId, depth = 0) => {
  if (!value || typeof value !== "object" || depth > 20) {
    return null;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findInstamartVariation(item, spinId, depth + 1);
      if (found) return found;
    }

    return null;
  }

  const ids = [
    value.spinId,
    value.spin_id,
    value.id,
    value.productId,
  ];

  if (
    ids.some((id) => String(id || "").toUpperCase() === spinId) &&
    value.price
  ) {
    return value;
  }

  if (Array.isArray(value.variations)) {
    for (const variation of value.variations) {
      const id = String(
        variation.spinId ||
        variation.spin_id ||
        variation.id ||
        variation.productId ||
        ""
      ).toUpperCase();

      if (id === spinId && variation.price) {
        return variation;
      }
    }
  }

  for (const child of Object.values(value)) {
    const found = findInstamartVariation(child, spinId, depth + 1);
    if (found) return found;
  }

  return null;
};


// 7. FETCH PRODUCT FROM INSTAMART

const fetchInstamartData = async (product, resolvedLocation = null) => {
  const spinId =
    product.instamartSpinId ||
    getInstamartSpinId(product.productUrl);

  if (!spinId) {
    throw new Error("Could not extract Instamart Spin ID.");
  }

  const location =
    resolvedLocation?.storeId
      ? resolvedLocation
      : await resolveInstamartStoreId(product.pincode);

  const headers = {
    Accept: "application/json, */*",
    Origin: BASE_URL,
    Referer: product.productUrl || `${BASE_URL}/`,
    "User-Agent": USER_AGENT,
  };

  if (process.env.INSTAMART_COOKIE) {
    headers.Cookie = process.env.INSTAMART_COOKIE;
  }

  const url =
    `${BASE_URL}/api/instamart/item/v2/spin/` +
    `${encodeURIComponent(spinId)}?storeId=${encodeURIComponent(location.storeId)}`;

  console.log("Fetching Spin ID:", spinId);
  console.log("Using Store ID:", location.storeId);

  const response = await axios.get(url, {
    headers,
    timeout: 20000,
    maxRedirects: 3,
  });

  console.log("Instamart item API status:", response.status);

  const item = findInstamartVariation(response.data, spinId);

  if (!item) {
    throw new Error(`Product ${spinId} was not found in Instamart response.`);
  }

  const stockValue = item.inventory?.inStock ?? item.inStock;

  const stockStatus =
    typeof stockValue === "boolean"
      ? stockValue ? "In Stock" : "Out of Stock"
      : "Unknown";

  return {
    productName: item.displayName || item.name || item.productName || null,
    price: parseMoney(item.price?.offerPrice ?? item.price?.sellingPrice),
    mrp: parseMoney(item.price?.mrp),
    stockStatus,
    availableUnits: null,
    instamartSpinId: spinId,
    storeId: String(location.storeId),
    locationLat: location.lat,
    locationLng: location.lng,
    locationAddress: location.address || "",
  };
};


// 8. SAVE MONITORING LOG

const saveMonitoringLog = async (logData) => {
  try {
    await MonitoringLog.create(logData);
  } catch (error) {
    console.error("Monitoring log failed:", error.message);
  }
};


// 9. PREVIEW PRODUCT

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
    const spinId = getInstamartSpinId(cleanUrl);

    if (!spinId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Instamart product URL.",
      });
    }

    const location = await resolveInstamartStoreId(pin);

    const details = await fetchInstamartData(
      {
        productUrl: cleanUrl,
        pincode: pin,
        instamartSpinId: spinId,
      },
      location
    );

    return res.status(200).json({
      success: true,
      message: `Instamart product fetched for PIN code ${pin}.`,
      details: { ...details, pincode: pin },
    });
  } catch (error) {
    console.error("Preview failed:", error.response?.data || error.message);

    return res.status(error.response?.status === 403 ? 403 : 422).json({
      success: false,
      message: error.message,
    });
  }
};


// 10. ADD PRODUCT

const addProduct = async (req, res) => {
  try {
    const { productName, productUrl, pincode, initialDetails } = req.body;

    if (!productName || !productUrl || !pincode) {
      return res.status(400).json({
        success: false,
        message: "Product name, Instamart URL and PIN code are required.",
      });
    }

    const pin = String(pincode).trim();
    const cleanUrl = String(productUrl).trim();
    const spinId = getInstamartSpinId(cleanUrl);

    if (!spinId) {
      return res.status(400).json({
        success: false,
        message: "Invalid Instamart product URL.",
      });
    }

    const location = await resolveInstamartStoreId(pin);

    const price = parseMoney(initialDetails?.price);
    const mrp = parseMoney(initialDetails?.mrp);

    const stockStatus = [
      "In Stock",
      "Out of Stock",
      "Unknown",
    ].includes(initialDetails?.stockStatus)
      ? initialDetails.stockStatus
      : "Unknown";

    const checkedAt = new Date();

    const hasCheckData =
      price !== null || mrp !== null || stockStatus !== "Unknown";

    const product = await Product.create({
      productName: String(initialDetails?.productName || productName).trim(),
      productUrl: cleanUrl,
      pincode: pin,
      instamartSpinId: spinId,
      storeId: location.storeId,
      locationLat: location.lat,
      locationLng: location.lng,
      locationAddress: location.address,
      price: price ?? 0,
      mrp,
      inStock: stockStatus === "In Stock",
      stockStatus,
      availableUnits: null,
      stockCheckedAt: hasCheckData ? checkedAt : null,
      lastCheckedAt: price !== null ? checkedAt : null,
    });

    if (price !== null) {
      await PriceHistory.create({
        productId: product._id,
        price,
      });
    }

    await saveMonitoringLog({
      productId: product._id,
      productName: product.productName,
      status: hasCheckData ? "success" : "failed",
      message: hasCheckData
        ? "Initial Instamart product details saved."
        : "Product saved; price and stock will be checked during monitoring.",
      price,
      source: "manual",
    });

    return res.status(201).json({
      success: true,
      message: "Instamart product added successfully.",
      product,
    });
  } catch (error) {
    console.error("Add product failed:", error.message);

    return res.status(422).json({
      success: false,
      message: error.message,
    });
  }
};


// 11. GET PRODUCTS

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


// 12. DELETE PRODUCT

const deleteProduct = async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id);

    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found.",
      });
    }

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


// 13. UPDATE PRODUCT

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
      { new: true, runValidators: true }
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

    return res.status(422).json({
      success: false,
      message: error.message,
    });
  }
};


// 14. CHECK PRICE AND STOCK

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
      location = await resolveInstamartStoreId(product.pincode);

      product.storeId = location.storeId;
      product.locationLat = location.lat;
      product.locationLng = location.lng;
      product.locationAddress = location.address;
    }

    const extracted = await fetchInstamartData(product, location);
    const now = new Date();
    const previousPrice = Number(product.price || 0);

    if (extracted.productName) {
      product.productName = extracted.productName;
    }

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


// 15. MANUAL PRODUCT CHECK

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


// 16. PRICE HISTORY

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


// 17. MONITORING LOGS

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


// 18. EXPORT

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
};
