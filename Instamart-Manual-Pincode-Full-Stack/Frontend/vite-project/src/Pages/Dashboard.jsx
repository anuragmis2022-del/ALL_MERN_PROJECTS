import React, { useEffect, useRef, useState } from "react";
import axios from "axios";
import { useLocation } from "react-router-dom";

import {
  Boxes,
  CheckCircle,
  XCircle,
  RefreshCw,
  Plus,
  Package,
  Pencil,
  Trash2,
  ExternalLink,
  Activity,
  X,
  Search,
  Clock,
  Mail,
} from "lucide-react";

import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const API_BASE_URL =
  import.meta.env.VITE_API_URL || "http://localhost:5000/api";

const API_URL = `${API_BASE_URL}/products`;

function Dashboard() {
  const location = useLocation();

  const [products, setProducts] = useState([]);
  const [monitoringLogs, setMonitoringLogs] = useState([]);

  const [productName, setProductName] = useState("");
  const [productUrl, setProductUrl] = useState("");
  const [pincode, setPincode] = useState("");
  const [message, setMessage] = useState("");
  const [editId, setEditId] = useState(null);
  const [checkingId, setCheckingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPriceProduct, setSelectedPriceProduct] = useState("all");

  const [previewLoading, setPreviewLoading] = useState(false);
  const [previewData, setPreviewData] = useState(null);

  // Stores the URL and PIN code used for the successful preview.
  // This helps prevent using an old preview after changing the inputs.
  const [previewSource, setPreviewSource] = useState(null);

  const addProductSectionRef = useRef(null);
  const productNameInputRef = useRef(null);

  // Check whether preview belongs to the current URL and PIN.
  const hasValidPreview =
    Boolean(previewData) &&
    Boolean(previewSource) &&
    previewSource.productUrl === productUrl.trim() &&
    previewSource.pincode === pincode.trim() &&
    Boolean(String(previewData.productName || "").trim()) &&
    Number.isFinite(Number(previewData.price)) &&
    Number(previewData.price) > 0;

  // Fetch dashboard data.
  const fetchDashboardData = async () => {
    try {
      const productResponse = await axios.get(API_URL);

      const logResponse = await axios.get(
        `${API_URL}/monitoring-logs?limit=200`,
      );

      setProducts(productResponse.data.products || []);
      setMonitoringLogs(logResponse.data.logs || []);
    } catch (error) {
      console.log(error);
      setMessage("Unable to fetch dashboard data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  // Refresh dashboard.
  const refreshDashboard = async () => {
    try {
      setLoading(true);

      const productResponse = await axios.get(API_URL);

      const logResponse = await axios.get(
        `${API_URL}/monitoring-logs?limit=200`,
      );

      setProducts(productResponse.data.products || []);
      setMonitoringLogs(logResponse.data.logs || []);

      setMessage("Dashboard refreshed successfully");
    } catch (error) {
      console.log(error);
      setMessage("Unable to refresh dashboard");
    } finally {
      setLoading(false);
    }
  };

  // Statistics.
  const successfulChecks = monitoringLogs.filter(
    (log) => log.status === "success",
  ).length;

  const failedChecks = monitoringLogs.filter(
    (log) => log.status === "failed",
  ).length;

  const inStockProducts = products.filter(
    (product) => product.inStock === true,
  ).length;

  const outOfStockProducts = products.filter(
    (product) => product.stockStatus === "Out of Stock",
  ).length;

  // Search products.
  const filteredProducts = products.filter((product) =>
    `${product.productName} ${product.pincode} ${product.platform || "Instamart"}`
      .toLowerCase()
      .includes(searchTerm.toLowerCase()),
  );

  // Chart data comes from monitoring logs that contain a price.-1 chart formation
  const priceTrendData = monitoringLogs
    .filter(
      (log) =>
        log.price !== undefined &&
        log.price !== null &&
        log.checkedAt &&
        (selectedPriceProduct === "all" ||
          log.productName === selectedPriceProduct),
    )
    .slice()
    .reverse()
    .map((log) => ({
      time: new Date(log.checkedAt).toLocaleString([], {
        day: "2-digit",
        month: "short",
        hour: "2-digit",
        minute: "2-digit",
      }),
      price: Number(log.price),
    }));

  useEffect(() => {
    if (location.hash === "#products") {
      document
        .getElementById("products")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [location.hash]);

  // Bring Add Product form into view and focus the first field.
  useEffect(() => {
    if (showForm) {
      addProductSectionRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "center",
      });

      productNameInputRef.current?.focus({ preventScroll: true });
    }
  }, [showForm, editId]);

  // Monitoring activity chart data. -2nd Chart formation
  const activityByDate = {};

  monitoringLogs.forEach((log) => {
    if (!log.checkedAt) return;

    const dateKey = new Date(log.checkedAt).toISOString().slice(0, 10);

    const dateLabel = new Date(log.checkedAt).toLocaleDateString([], {
      day: "2-digit",
      month: "short",
    });

    if (!activityByDate[dateKey]) {
      activityByDate[dateKey] = {
        date: dateLabel,
        successful: 0,
        failed: 0,
      };
    }

    if (log.status === "success") {
      activityByDate[dateKey].successful += 1;
    }

    if (log.status === "failed") {
      activityByDate[dateKey].failed += 1;
    }
  });

  const activityChartData = Object.keys(activityByDate)
    .sort()
    .slice(-7)
    .map((dateKey) => activityByDate[dateKey]);

  // Reset form.
  const resetForm = () => {
    setEditId(null);
    setProductName("");
    setProductUrl("");
    setPincode("");
    setPreviewData(null);
    setPreviewSource(null);
    setShowForm(false);
  };

  // Clear preview whenever the URL or PIN changes.
  const clearPreview = () => {
    setPreviewData(null);
    setPreviewSource(null);
  };

  // Open edit form.
  const openEditForm = (product) => {
    setEditId(product._id);
    setProductName(product.productName || "");
    setProductUrl(product.productUrl || "");
    setPincode(product.pincode || "201001");
    setPreviewData(null);
    setPreviewSource(null);
    setShowForm(true);
    setMessage("");
  };

  // Fetch fresh products and logs after an action.
  const reloadDashboardData = async () => {
    const updatedProducts = await axios.get(API_URL);

    const updatedLogs = await axios.get(`${API_URL}/monitoring-logs?limit=200`);

    setProducts(updatedProducts.data.products || []);
    setMonitoringLogs(updatedLogs.data.logs || []);
  };

  // Dashboard statistic cards.
  const statCards = [
    {
      title: "Total Products",
      value: products.length,
      description: "Products monitored",
      icon: Boxes,
      color: "text-blue-600",
      background: "bg-blue-50",
    },
    {
      title: "In Stock",
      value: inStockProducts,
      description: "Currently available",
      icon: CheckCircle,
      color: "text-emerald-700",
      background: "bg-emerald-50",
    },
    {
      title: "Out of Stock",
      value: outOfStockProducts,
      description: "Currently unavailable",
      icon: XCircle,
      color: "text-rose-700",
      background: "bg-rose-50",
    },
    {
      title: "Successful Checks",
      value: successfulChecks,
      description: `${failedChecks} failed checks`,
      icon: Activity,
      color: "text-violet-700",
      background: "bg-violet-50",
    },
  ];

  return (
    <div className="w-full min-h-full bg-slate-50 px-4 py-6 text-slate-700 sm:px-6 lg:px-8 xl:px-10">
      <div className="w-full">
        {/* Dashboard Header */}
        <div className="mb-8 flex flex-col justify-between gap-5 sm:flex-row sm:items-center">
          <div>
            <p className="mb-2 text-xs font-semibold uppercase tracking-[2px] text-blue-600">
              Overview
            </p>

            <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
              Dashboard
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Monitor your products, prices and availability.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={refreshDashboard}
              disabled={loading}
              className="flex items-center justify-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100 disabled:opacity-50"
            >
              <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
              Refresh
            </button>

            <button
              onClick={() => {
                resetForm();
                setShowForm(true);
                setMessage("");
              }}
              className="flex items-center justify-center gap-2 rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500"
            >
              <Plus size={17} />
              Add Product
            </button>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="mb-5 flex items-center justify-between gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-800">
            <span>{message}</span>

            <button
              onClick={() => setMessage("")}
              className="shrink-0 rounded p-1 hover:bg-blue-100"
            >
              <X size={17} />
            </button>
          </div>
        )}

        {/* Instamart Notice */}
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-blue-200 bg-blue-50 p-4">
          <Activity size={19} className="mt-0.5 shrink-0 text-blue-700" />

          <div>
            <p className="text-sm font-semibold text-blue-900">
              Instamart Monitoring
            </p>

            <p className="mt-1 text-xs leading-5 text-slate-600">
              Product name, price and stock details are fetched from the
              Instamart product API. A product is added only after a successful
              preview with a valid product name and price.
            </p>
          </div>
        </div>

        {/* Statistics */}
        <section className="mb-8">
          <div className="mb-4">
            <h2 className="text-base font-semibold text-slate-900">
              Monitoring Overview
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Summary of your product monitoring activity
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {statCards.map((card) => {
              const Icon = card.icon;

              return (
                <div
                  key={card.title}
                  className="min-w-0 rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-200"
                >
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-slate-500">
                      {card.title}
                    </p>

                    <div
                      className={`shrink-0 rounded-lg p-2.5 ${card.background}`}
                    >
                      <Icon size={20} className={card.color} />
                    </div>
                  </div>

                  <h3 className="mt-4 text-3xl font-bold text-slate-900">
                    {card.value}
                  </h3>

                  <p className="mt-2 text-xs text-slate-500">
                    {card.description}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        {/* Analytics Charts */}
        <section className="mb-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
          {/* Price Trend */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Price Trend
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Recorded prices from monitoring logs ·{" "}
                  {selectedPriceProduct === "all"
                    ? "All products"
                    : selectedPriceProduct}
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <select
                  value={selectedPriceProduct}
                  onChange={(e) => setSelectedPriceProduct(e.target.value)}
                  className="max-w-[180px] rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-700 outline-none focus:border-blue-500"
                  aria-label="Filter price trend by product"
                >
                  <option value="all">All products</option>

                  {products.map((product) => (
                    <option key={product._id} value={product.productName}>
                      {product.productName}
                    </option>
                  ))}
                </select>

                <span className="rounded-lg bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700">
                  {priceTrendData.length} records
                </span>
              </div>
            </div>

            {priceTrendData.length === 0 ? (
              <div className="flex h-64 flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center">
                <Activity size={28} className="text-slate-400" />

                <p className="mt-3 text-sm font-semibold text-slate-700">
                  No price records yet
                </p>

                <p className="mt-1 max-w-xs text-xs leading-5 text-slate-500">
                  Run Check Now on a product. The chart will use prices returned
                  in your monitoring logs.
                </p>
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart
                    data={priceTrendData}
                    margin={{ top: 8, right: 12, left: 0, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="time"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      tickFormatter={(value) => `₹${value}`}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      formatter={(value) => [`₹${value}`, "Price"]}
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    />

                    <Line
                      type="monotone"
                      dataKey="price"
                      stroke="#2563eb"
                      strokeWidth={3}
                      dot={{ r: 3 }}
                      activeDot={{ r: 6 }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>

          {/* Monitoring Activity */}
          <div className="min-w-0 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5">
              <h2 className="text-base font-semibold text-slate-900">
                Monitoring Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Successful and failed checks by date
              </p>
            </div>

            {activityChartData.length === 0 ? (
              <div className="flex h-64 items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50 px-5 text-center text-xs text-slate-500">
                No monitoring activity available yet.
              </div>
            ) : (
              <div className="h-64 w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart
                    data={activityChartData}
                    margin={{ top: 8, right: 8, left: -18, bottom: 4 }}
                  >
                    <CartesianGrid
                      strokeDasharray="3 3"
                      stroke="#e2e8f0"
                      vertical={false}
                    />

                    <XAxis
                      dataKey="date"
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <YAxis
                      allowDecimals={false}
                      tick={{ fill: "#64748b", fontSize: 11 }}
                      axisLine={false}
                      tickLine={false}
                    />

                    <Tooltip
                      contentStyle={{
                        borderRadius: 12,
                        border: "1px solid #e2e8f0",
                      }}
                    />

                    <Legend />

                    <Bar
                      dataKey="successful"
                      name="Successful"
                      fill="#16a34a"
                      radius={[4, 4, 0, 0]}
                    />

                    <Bar
                      dataKey="failed"
                      name="Failed"
                      fill="#e11d48"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        </section>

        {/* System Information */}
        <section className="mb-8 grid grid-cols-1 gap-4 lg:grid-cols-2">
          {/* Automatic Monitoring */}
          <div className="flex min-w-0 gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
              <Clock size={20} className="text-blue-600" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">
                Automatic Monitoring
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Products are checked automatically at the interval configured in
                Backend/.env.
              </p>

              <p className="mt-3 text-xs font-medium text-blue-600">
                Default interval: 15 minutes
              </p>
            </div>
          </div>

          {/* Email Notifications */}
          <div className="flex min-w-0 gap-4 rounded-xl border border-slate-200 bg-white p-5">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <Mail size={20} className="text-emerald-700" />
            </div>

            <div className="min-w-0">
              <h3 className="text-sm font-semibold text-slate-900">
                Email Notifications
              </h3>

              <p className="mt-2 text-xs leading-5 text-slate-500">
                Email notifications are configured for qualifying price changes.
              </p>

              <p className="mt-3 text-xs font-medium text-emerald-700">
                Email alerts enabled
              </p>
            </div>
          </div>
        </section>

        {/* Add / Edit Product Form */}
        {showForm && (
          <section
            id="add-product-form"
            ref={addProductSectionRef}
            className="mb-8 scroll-mt-24 rounded-xl border border-slate-200 bg-white p-5 sm:p-6"
          >
            <div className="mb-6 flex items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editId ? "Edit Product" : "Add New Product"}
                </h2>

                <p className="mt-1 text-xs text-slate-500">
                  Enter the product details below.
                </p>
              </div>

              <button
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                <X size={19} />
              </button>
            </div>

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              {/* Product Name */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Product Name
                </label>

                <input
                  ref={productNameInputRef}
                  type="text"
                  placeholder="Example: Amul Buttermilk"
                  value={productName}
                  onChange={(e) => setProductName(e.target.value)}
                  disabled={!editId && Boolean(previewData)}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500 disabled:opacity-70"
                />
              </div>

              {/* Product URL */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Product URL
                </label>

                <input
                  type="text"
                  placeholder="Enter product URL"
                  value={productUrl}
                  onChange={(e) => {
                    setProductUrl(e.target.value);
                    clearPreview();
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>

              {/* Pincode */}
              <div>
                <label className="mb-2 block text-xs font-medium text-slate-500">
                  Delivery Pincode
                </label>

                <input
                  type="text"
                  inputMode="numeric"
                  placeholder=" Example: 201001"
                  value={pincode}
                  maxLength={6}
                  onChange={(e) => {
                    setPincode(e.target.value.replace(/\D/g, "").slice(0, 6));

                    clearPreview();
                  }}
                  className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-blue-500"
                />
              </div>

              {/* Platform */}
              <div className="rounded-lg border border-blue-100 bg-blue-50 p-3">
                <p className="text-sm font-semibold text-blue-900">
                  Platform: Swiggy Instamart
                </p>

                <p className="mt-1 text-xs text-blue-700">
                  Spin ID is extracted from the product URL. Store ID is
                  resolved by the backend using the PIN code you enter.
                </p>
              </div>
            </div>

            <p className="mt-3 text-xs text-slate-500">
              Use Fetch Product Details to read the product name, price and
              stock before saving. Enter only an Instamart product URL and a
              6-digit delivery PIN code.
            </p>

            {/* Preview Details */}
            {previewData && (
              <div className="mt-4 rounded-lg border border-blue-100 bg-blue-50 p-4">
                <p className="text-sm font-semibold text-blue-900">
                  Fetched product details
                </p>

                <div className="mt-2 grid grid-cols-2 gap-3 text-xs text-slate-700 sm:grid-cols-4">
                  <p>
                    <span className="text-slate-500">Name</span>
                    <br />
                    {previewData.productName || "Not provided"}
                  </p>

                  <p>
                    <span className="text-slate-500">Price</span>
                    <br />
                    {previewData.price !== null &&
                    previewData.price !== undefined
                      ? `₹${previewData.price}`
                      : "Not provided"}
                  </p>

                  <p>
                    <span className="text-slate-500">MRP</span>
                    <br />
                    {previewData.mrp !== null && previewData.mrp !== undefined
                      ? `₹${previewData.mrp}`
                      : "Not provided"}
                  </p>

                  <p>
                    <span className="text-slate-500">Stock</span>
                    <br />
                    {previewData.stockStatus || "Unknown"}
                  </p>
                </div>

                <p className="mt-3 text-xs font-medium text-emerald-700">
                  <CheckCircle size={13} className="mr-1 inline" />
                  Preview successful. Product details are ready for saving.
                </p>
              </div>
            )}

            {/* Buttons */}
            <div className="mt-6 flex flex-wrap gap-3">
              {/* Fetch Product Details */}
              <button
                type="button"
                disabled={previewLoading || saving}
                onClick={async () => {
                  try {
                    const cleanUrl = productUrl.trim();
                    const cleanPin = pincode.trim();

                    if (!cleanUrl || !/^[0-9]{6}$/.test(cleanPin)) {
                      setMessage(
                        "Please enter an Instamart product URL and a valid 6-digit PIN code.",
                      );
                      return;
                    }

                    setPreviewLoading(true);
                    setMessage("");
                    clearPreview();

                    const response = await axios.post(`${API_URL}/preview`, {
                      productUrl: cleanUrl,
                      pincode: cleanPin,
                    });

                    const details = response.data?.details;

                    const fetchedName = String(
                      details?.productName || "",
                    ).trim();

                    const fetchedPrice = Number(details?.price);

                    // Frontend also validates the preview response.
                    if (!fetchedName) {
                      throw new Error(
                        "Instamart did not return a valid product name.",
                      );
                    }

                    if (
                      details?.price === null ||
                      details?.price === undefined ||
                      details?.price === "" ||
                      !Number.isFinite(fetchedPrice) ||
                      fetchedPrice <= 0
                    ) {
                      throw new Error(
                        "Instamart did not return a valid price. You cannot add this product.",
                      );
                    }

                    setPreviewData(details);

                    setPreviewSource({
                      productUrl: cleanUrl,
                      pincode: cleanPin,
                    });

                    setProductName(fetchedName);

                    setMessage(
                      response.data.message ||
                        "Product details fetched successfully.",
                    );
                  } catch (error) {
                    console.log(error);

                    clearPreview();

                    setMessage(
                      error.response?.data?.message ||
                        error.message ||
                        "Unable to fetch product details.",
                    );
                  } finally {
                    setPreviewLoading(false);
                  }
                }}
                className="flex items-center gap-2 rounded-lg border border-blue-200 bg-blue-50 px-5 py-2.5 text-sm font-semibold text-blue-700 transition hover:bg-blue-100 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={previewLoading ? "animate-spin" : ""}
                />

                {previewLoading
                  ? "Fetching details..."
                  : "Fetch Product Details"}
              </button>

              {/* Add / Update Product */}
              <button
                disabled={
                  saving || previewLoading || (!editId && !hasValidPreview)
                }
                onClick={async () => {
                  try {
                    const cleanUrl = productUrl.trim();
                    const cleanPin = pincode.trim();

                    if (!cleanUrl || !/^[0-9]{6}$/.test(cleanPin)) {
                      setMessage(
                        "Please enter a valid Instamart URL and 6-digit PIN code.",
                      );
                      return;
                    }

                    // New products must have a successful preview.
                    if (!editId && !hasValidPreview) {
                      setMessage(
                        "Please fetch valid product details before adding this product.",
                      );
                      return;
                    }

                    if (editId && !productName.trim()) {
                      setMessage("Please enter a product name.");
                      return;
                    }

                    setSaving(true);
                    setMessage("");

                    // Do not send initialDetails.
                    // Backend fetches fresh Instamart details before saving.
                    const productData = {
                      productName: productName.trim(),
                      productUrl: cleanUrl,
                      pincode: cleanPin,
                    };

                    let response;

                    if (editId) {
                      response = await axios.patch(
                        `${API_URL}/${editId}`,
                        productData,
                      );
                    } else {
                      response = await axios.post(
                        `${API_URL}/add`,
                        productData,
                      );
                    }

                    setMessage(response.data.message);

                    resetForm();

                    await reloadDashboardData();
                  } catch (error) {
                    console.log(error);

                    setMessage(
                      error.response?.data?.message || "Operation failed.",
                    );
                  } finally {
                    setSaving(false);
                  }
                }}
                className="flex items-center gap-2 rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {saving ? (
                  <RefreshCw size={16} className="animate-spin" />
                ) : (
                  <Plus size={16} />
                )}

                {saving
                  ? "Saving..."
                  : editId
                    ? "Update Product"
                    : "Add Product"}
              </button>

              <button
                onClick={resetForm}
                className="rounded-lg border border-slate-200 px-5 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                Cancel
              </button>
            </div>

            {!editId && !hasValidPreview && (
              <p className="mt-3 text-xs text-amber-700">
                Fetch successful product details before you can add this
                product.
              </p>
            )}
          </section>
        )}

        {/* Products Section */}
        <section
          id="products"
          className="mb-8 w-full scroll-mt-24 overflow-hidden rounded-xl border border-slate-200 bg-white"
        >
          <div className="flex flex-col justify-between gap-3 border-b border-slate-200 p-5 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                My Products
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Manage and monitor your products.
              </p>
            </div>

            <span className="w-fit rounded-md border border-blue-200 bg-blue-50 px-3 py-1.5 text-[10px] font-semibold tracking-wide text-blue-800">
              INSTAMART DATA
            </span>
          </div>

          {/* Search */}
          <div className="border-b border-slate-200 px-5 py-4">
            <div className="relative w-full sm:max-w-sm">
              <Search
                size={17}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"
              />

              <input
                type="text"
                placeholder="Search product or pincode..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none placeholder:text-slate-500 focus:border-blue-500"
              />
            </div>
          </div>

          {/* Product Loading */}
          {loading ? (
            <div className="py-16 text-center">
              <RefreshCw
                size={24}
                className="mx-auto animate-spin text-blue-600"
              />

              <p className="mt-3 text-sm text-slate-500">Loading products...</p>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="px-5 py-16 text-center">
              <Package size={30} className="mx-auto text-slate-600" />

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {products.length === 0
                  ? "No products added yet"
                  : "No matching products"}
              </h3>

              <p className="mt-2 text-xs text-slate-500">
                {products.length === 0
                  ? "Add your first product to start monitoring."
                  : "Try another product name or pincode."}
              </p>

              {products.length === 0 && (
                <button
                  onClick={() => {
                    resetForm();
                    setShowForm(true);
                  }}
                  className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white hover:bg-blue-500"
                >
                  Add Your First Product
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Mobile Product Cards */}
              <div className="divide-y divide-slate-100 sm:hidden">
                {filteredProducts.map((product) => (
                  <article key={product._id} className="space-y-3 p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex min-w-0 items-center gap-3">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                          <Package size={19} className="text-blue-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="break-words text-sm font-semibold text-slate-900">
                            {product.productName}
                          </p>

                          <p className="mt-1 text-xs text-slate-500">
                            PIN: {product.pincode} · INSTAMART
                          </p>
                        </div>
                      </div>

                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${
                          product.stockStatus === "In Stock"
                            ? "bg-emerald-50 text-emerald-700"
                            : product.stockStatus === "Out of Stock"
                              ? "bg-rose-50 text-rose-700"
                              : "bg-slate-100 text-slate-600"
                        }`}
                      >
                        {product.stockStatus || "Unknown"}
                      </span>
                    </div>

                    <div className="flex flex-wrap justify-between gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-slate-800">
                        {product.lastCheckedAt
                          ? `₹${product.price ?? 0}`
                          : "Price not checked"}
                      </span>

                      <span>
                        {product.lastCheckedAt
                          ? new Date(product.lastCheckedAt).toLocaleString()
                          : "Not checked yet"}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      {/* Check Now */}
                      <button
                        title="Check Now"
                        disabled={checkingId === product._id}
                        onClick={async () => {
                          try {
                            setCheckingId(product._id);
                            setMessage("");

                            const response = await axios.post(
                              `${API_URL}/${product._id}/check`,
                            );

                            setMessage(
                              response.data.price !== null &&
                                response.data.price !== undefined
                                ? `${response.data.message}. Latest price: ₹${response.data.price}`
                                : response.data.message,
                            );

                            await reloadDashboardData();
                          } catch (error) {
                            setMessage(
                              error.response?.data?.message ||
                                "Unable to check product",
                            );

                            try {
                              await reloadDashboardData();
                            } catch (refreshError) {
                              console.log(refreshError);
                            }
                          } finally {
                            setCheckingId(null);
                          }
                        }}
                        className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2.5 text-xs font-semibold text-blue-700 disabled:opacity-50"
                      >
                        <RefreshCw
                          size={14}
                          className={
                            checkingId === product._id ? "animate-spin" : ""
                          }
                        />

                        {checkingId === product._id ? "Checking" : "Check Now"}
                      </button>

                      {/* Edit */}
                      <button
                        title="Edit Product"
                        onClick={() => openEditForm(product)}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-slate-200 px-3 py-2.5 text-xs font-medium text-slate-700"
                      >
                        <Pencil size={14} />
                        Edit
                      </button>

                      {/* Delete */}
                      <button
                        title="Delete Product"
                        onClick={async () => {
                          if (
                            !window.confirm(
                              `Are you sure you want to delete ${product.productName}?`,
                            )
                          ) {
                            return;
                          }

                          try {
                            const response = await axios.delete(
                              `${API_URL}/${product._id}`,
                            );

                            setMessage(response.data.message);

                            if (editId === product._id) {
                              resetForm();
                            }

                            await reloadDashboardData();
                          } catch (error) {
                            setMessage(
                              error.response?.data?.message ||
                                "Unable to delete product",
                            );
                          }
                        }}
                        className="flex items-center justify-center gap-1.5 rounded-lg border border-rose-200 px-3 py-2.5 text-xs font-medium text-rose-700"
                      >
                        <Trash2 size={14} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop Product Table */}
              <div className="hidden w-full overflow-x-auto sm:block">
                <table className="w-full min-w-[850px] text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      {[
                        "Product",
                        "Price",
                        "Pincode",
                        "Stock Status",
                        "Last Checked",
                        "Actions",
                      ].map((heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                        >
                          {heading}
                        </th>
                      ))}
                    </tr>
                  </thead>

                  <tbody>
                    {filteredProducts.map((product) => (
                      <tr
                        key={product._id}
                        className="border-t border-slate-200 transition hover:bg-slate-50"
                      >
                        {/* Product */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-blue-50">
                              <Package size={19} className="text-blue-600" />
                            </div>

                            <div>
                              <p className="text-sm font-medium text-slate-900">
                                {product.productName}
                              </p>

                              <a
                                href={product.productUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="mt-1 inline-flex items-center gap-1 text-[11px] text-blue-600 hover:text-blue-700"
                              >
                                View product
                                <ExternalLink size={11} />
                              </a>
                            </div>
                          </div>
                        </td>

                        {/* Price */}
                        <td className="px-5 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {product.lastCheckedAt
                              ? `₹${product.price ?? 0}`
                              : "—"}
                          </p>

                          <p className="mt-1 text-[10px] text-slate-500">
                            {product.lastCheckedAt
                              ? "Last checked price"
                              : "Not checked"}
                          </p>
                        </td>

                        {/* Pincode */}
                        <td className="px-5 py-4 text-sm text-slate-700">
                          {product.pincode}
                        </td>

                        {/* Stock Status */}
                        <td className="px-5 py-4">
                          <span
                            className={`inline-flex items-center gap-2 rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                              product.stockStatus === "In Stock"
                                ? "bg-emerald-50 text-emerald-700"
                                : product.stockStatus === "Out of Stock"
                                  ? "bg-rose-50 text-rose-700"
                                  : "bg-slate-100 text-slate-600"
                            }`}
                          >
                            <span
                              className={`h-1.5 w-1.5 rounded-full ${
                                product.stockStatus === "In Stock"
                                  ? "bg-emerald-500"
                                  : product.stockStatus === "Out of Stock"
                                    ? "bg-rose-500"
                                    : "bg-slate-400"
                              }`}
                            />

                            {product.stockStatus || "Unknown"}
                          </span>
                        </td>

                        {/* Last Checked */}
                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {product.lastCheckedAt
                            ? new Date(product.lastCheckedAt).toLocaleString()
                            : "Not checked yet"}
                        </td>

                        {/* Actions */}
                        <td className="px-5 py-4">
                          <div className="flex items-center gap-2">
                            {/* Check Now */}
                            <button
                              title="Check Now"
                              disabled={checkingId === product._id}
                              onClick={async () => {
                                try {
                                  setCheckingId(product._id);
                                  setMessage("");

                                  const response = await axios.post(
                                    `${API_URL}/${product._id}/check`,
                                  );

                                  setMessage(
                                    response.data.price !== null &&
                                      response.data.price !== undefined
                                      ? `${response.data.message}. Latest price: ₹${response.data.price}`
                                      : response.data.message,
                                  );

                                  await reloadDashboardData();
                                } catch (error) {
                                  console.log(error);

                                  setMessage(
                                    error.response?.data?.message ||
                                      "Unable to check product",
                                  );

                                  try {
                                    await reloadDashboardData();
                                  } catch (refreshError) {
                                    console.log(refreshError);
                                  }
                                } finally {
                                  setCheckingId(null);
                                }
                              }}
                              className="flex items-center gap-1.5 rounded-lg bg-blue-50 px-3 py-2 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:opacity-50"
                            >
                              <RefreshCw
                                size={13}
                                className={
                                  checkingId === product._id
                                    ? "animate-spin"
                                    : ""
                                }
                              />

                              {checkingId === product._id
                                ? "Checking"
                                : "Check"}
                            </button>

                            {/* Edit */}
                            <button
                              title="Edit Product"
                              onClick={() => openEditForm(product)}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-blue-500/50 hover:bg-blue-50 hover:text-blue-600"
                            >
                              <Pencil size={15} />
                            </button>

                            {/* Delete */}
                            <button
                              title="Delete Product"
                              onClick={async () => {
                                if (
                                  !window.confirm(
                                    `Are you sure you want to delete ${product.productName}?`,
                                  )
                                ) {
                                  return;
                                }

                                try {
                                  const response = await axios.delete(
                                    `${API_URL}/${product._id}`,
                                  );

                                  setMessage(response.data.message);

                                  if (editId === product._id) {
                                    resetForm();
                                  }

                                  await reloadDashboardData();
                                } catch (error) {
                                  console.log(error);

                                  setMessage(
                                    error.response?.data?.message ||
                                      "Unable to delete product",
                                  );
                                }
                              }}
                              className="rounded-lg border border-slate-200 p-2 text-slate-500 transition hover:border-rose-500/50 hover:bg-rose-50 hover:text-rose-700"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* Product Count */}
          <div className="border-t border-slate-200 px-5 py-3">
            <p className="text-xs text-slate-500">
              Showing {filteredProducts.length} of {products.length} products
            </p>
          </div>
        </section>

        {/* Recent Activity */}
        <section className="w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
          <div className="flex items-center justify-between gap-3 border-b border-slate-200 p-5">
            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Recent Activity
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Latest product monitoring records.
              </p>
            </div>

            <div className="rounded-lg bg-blue-50 p-2.5">
              <Activity size={19} className="text-blue-600" />
            </div>
          </div>

          {monitoringLogs.length === 0 ? (
            <p className="py-12 text-center text-sm text-slate-500">
              No monitoring activity available yet.
            </p>
          ) : (
            <>
              {/* Mobile Activity Cards */}
              <div className="divide-y divide-slate-100 sm:hidden">
                {monitoringLogs.slice(0, 6).map((log) => (
                  <article key={log._id} className="space-y-2 p-4">
                    <div className="flex items-center justify-between gap-3">
                      <p className="min-w-0 break-words text-sm font-semibold text-slate-900">
                        {log.productName || "Unknown product"}
                      </p>

                      <span
                        className={`shrink-0 rounded-md px-2 py-1 text-[11px] font-medium ${
                          log.status === "success"
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-rose-50 text-rose-700"
                        }`}
                      >
                        {log.status}
                      </span>
                    </div>

                    <p className="text-xs leading-5 text-slate-500">
                      {log.message}
                    </p>

                    <div className="flex justify-between gap-2 text-[11px] text-slate-500">
                      <span>{log.source || "automatic"}</span>

                      <span>
                        {log.checkedAt
                          ? new Date(log.checkedAt).toLocaleString()
                          : "Not available"}
                      </span>
                    </div>
                  </article>
                ))}
              </div>

              {/* Desktop Activity Table */}
              <div className="hidden w-full overflow-x-auto sm:block">
                <table className="w-full min-w-[650px] text-left">
                  <thead>
                    <tr className="bg-slate-50">
                      {["Product", "Result", "Message", "Source", "Time"].map(
                        (heading) => (
                          <th
                            key={heading}
                            className="px-5 py-4 text-[10px] font-semibold uppercase tracking-wider text-slate-500"
                          >
                            {heading}
                          </th>
                        ),
                      )}
                    </tr>
                  </thead>

                  <tbody>
                    {monitoringLogs.slice(0, 6).map((log) => (
                      <tr
                        key={log._id}
                        className="border-t border-slate-200 hover:bg-slate-50"
                      >
                        <td className="px-5 py-4 text-sm font-medium text-slate-900">
                          {log.productName || "Unknown product"}
                        </td>

                        <td className="px-5 py-4">
                          <span
                            className={`rounded-md px-2.5 py-1.5 text-[11px] font-medium ${
                              log.status === "success"
                                ? "bg-emerald-50 text-emerald-700"
                                : "bg-rose-50 text-rose-700"
                            }`}
                          >
                            {log.status}
                          </span>
                        </td>

                        <td className="max-w-xs px-5 py-4 text-xs leading-5 text-slate-500">
                          {log.message}
                        </td>

                        <td className="px-5 py-4 text-xs capitalize text-slate-500">
                          {log.source || "automatic"}
                        </td>

                        <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                          {log.checkedAt
                            ? new Date(log.checkedAt).toLocaleString()
                            : "Not available"}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </section>
      </div>
    </div>
  );
}

export default Dashboard;
