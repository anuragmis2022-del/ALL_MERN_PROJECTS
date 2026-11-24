
import React, { useEffect, useState } from "react";
import axios from "axios";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

import {
  TrendingUp,
  Package,
  Clock,
  RefreshCw,
  BarChart3,
} from "lucide-react";

const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const API_URL = `${API_BASE_URL}/products`;

function PriceHistory() {
  const [products, setProducts] = useState([]);
  const [selectedProductId, setSelectedProductId] = useState("");
  const [history, setHistory] = useState([]);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(false);

  // Fetch products
  useEffect(() => {
    const getProducts = async () => {
      try {
        const response = await axios.get(API_URL);
        const productList = response.data.products || [];

        setProducts(productList);

        if (productList.length > 0) {
          setSelectedProductId(productList[0]._id);
        }
      } catch (error) {
        console.log(error);
        setMessage("Unable to load products");
      } finally {
        setLoading(false);
      }
    };

    getProducts();
  }, []);

  // Fetch price history
  useEffect(() => {
    if (!selectedProductId) {
      setHistory([]);
      return;
    }

    const getHistory = async () => {
      try {
        setHistoryLoading(true);
        setMessage("");

        const response = await axios.get(
          `${API_URL}/${selectedProductId}/history`
        );

        setHistory(response.data.history || []);
      } catch (error) {
        console.log(error);
        setMessage("Unable to load price history");
        setHistory([]);
      } finally {
        setHistoryLoading(false);
      }
    };

    getHistory();
  }, [selectedProductId]);

  const selectedProduct = products.find(
    (product) => product._id === selectedProductId
  );

  // Chart data
  const chartData = history.map((item) => ({
    date: new Date(item.checkedAt).toLocaleString(),
    price: item.price,
  }));

  const latestPrice =
    history.length > 0
      ? history[history.length - 1].price
      : null;

  const highestPrice =
    history.length > 0
      ? Math.max(...history.map((item) => item.price))
      : null;

  const lowestPrice =
    history.length > 0
      ? Math.min(...history.map((item) => item.price))
      : null;

  const statCards = [
    {
      title: "Latest Recorded Price",
      value: latestPrice !== null ? `₹${latestPrice}` : "—",
      description: "Latest available record",
      icon: TrendingUp,
      iconColor: "text-blue-600",
      iconBg: "bg-blue-50",
    },
    {
      title: "Highest Recorded Price",
      value: highestPrice !== null ? `₹${highestPrice}` : "—",
      description: "Based on available history",
      icon: BarChart3,
      iconColor: "text-orange-700",
      iconBg: "bg-orange-50",
    },
    {
      title: "Lowest Recorded Price",
      value: lowestPrice !== null ? `₹${lowestPrice}` : "—",
      description: "Based on available history",
      icon: TrendingUp,
      iconColor: "text-emerald-700",
      iconBg: "bg-emerald-50",
    },
  ];

  return (
<div className="min-h-full w-full bg-slate-50 px-4 py-6 text-slate-700 sm:px-6 lg:px-8">

      <div className="mx-auto max-w-[1500px]">

        {/* Header */}
        <div className="mb-7">
          <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-blue-600">
            Analytics
          </p>

          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            Price History
          </h1>

          <p className="mt-2 text-sm text-slate-500">
            Track historical prices and review product price changes.
          </p>
        </div>

        {/* Demo Notice */}
        <div className="mb-7 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-4">
          <div className="rounded-lg bg-amber-50 p-2">
            <TrendingUp size={19} className="text-amber-700" />
          </div>

          <div>
            <p className="text-sm font-semibold text-amber-800">
              Recorded Product Page Prices
            </p>

            <p className="mt-1 text-xs leading-5 text-amber-200/">
              These records are saved when the backend successfully reads a price from the configured product page. A failed page check does not create a price-history record.
            </p>
          </div>
        </div>

        {/* Product Selector */}
        <section className="mb-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

          <div className="mb-4 flex items-center gap-3">
            <div className="rounded-xl bg-blue-50 p-3">
              <Package size={21} className="text-blue-600" />
            </div>

            <div>
              <h2 className="text-base font-semibold text-slate-900">
                Select Product
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                Choose a product to view its price records.
              </p>
            </div>
          </div>

          {loading ? (
            <p className="text-sm text-slate-500">
              Loading products...
            </p>
          ) : (
            <select
              value={selectedProductId}
              onChange={(e) => setSelectedProductId(e.target.value)}
              className="w-full max-w-lg rounded-lg border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
            >
              {products.length === 0 && (
                <option value="">No products available</option>
              )}

              {products.map((product) => (
                <option key={product._id} value={product._id}>
                  {product.productName}
                </option>
              ))}
            </select>
          )}
        </section>

        {/* Error Message */}
        {message && (
          <div className="mb-5 rounded-lg border border-rose-500/20 bg-rose-50 px-4 py-3 text-sm text-rose-700">
            {message}
          </div>
        )}

        {/* Statistics */}
        <section className="mb-7 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">

          {statCards.map((card) => {
            const Icon = card.icon;

            return (
              <div
                key={card.title}
                className="rounded-xl border border-slate-200 bg-white p-5 transition hover:border-slate-200"
              >
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium text-slate-500">
                    {card.title}
                  </p>

                  <div className={`rounded-lg p-2.5 ${card.iconBg}`}>
                    <Icon size={19} className={card.iconColor} />
                  </div>
                </div>

                <h3 className="mt-4 text-2xl font-bold text-slate-900">
                  {card.value}
                </h3>

                <p className="mt-2 text-xs text-slate-500">
                  {card.description}
                </p>
              </div>
            );
          })}

        </section>

        {/* Price Chart */}
        <section className="mb-7 rounded-xl border border-slate-200 bg-white p-5 sm:p-6">

          <div className="mb-6 flex flex-wrap items-center justify-between gap-3">

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Price Trend
              </h2>

              <p className="mt-1 text-xs text-slate-500">
                {selectedProduct
                  ? `Price history for ${selectedProduct.productName}`
                  : "Select a product to view its price trend."}
              </p>
            </div>

            <span className="rounded-lg border border-blue-500/20 bg-blue-50 px-3 py-2 text-xs font-semibold text-blue-600">
              {history.length} Records
            </span>

          </div>

          {historyLoading ? (
            <div className="flex h-[320px] items-center justify-center">
              <RefreshCw
                size={25}
                className="animate-spin text-blue-600"
              />
            </div>
          ) : history.length === 0 ? (
            <div className="flex h-[300px] flex-col items-center justify-center rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <TrendingUp size={35} className="text-slate-600" />

              <p className="mt-3 text-sm font-semibold text-slate-700">
                No price history available
              </p>

              <p className="mt-2 max-w-sm px-4 text-center text-xs leading-5 text-slate-500">
                Go to Dashboard and click Check Now on this product to
                generate a price record.
              </p>
            </div>
          ) : (
            <div className="h-[320px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart
                  data={chartData}
                  margin={{
                    top: 10,
                    right: 15,
                    left: 5,
                    bottom: 5,
                  }}
                >
                  <CartesianGrid
                    strokeDasharray="4 4"
                    stroke="#374151"
                    vertical={false}
                  />

                  <XAxis
                    dataKey="date"
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={{ stroke: "#374151" }}
                    minTickGap={30}
                  />

                  <YAxis
                    domain={["auto", "auto"]}
                    tickFormatter={(value) => `₹${value}`}
                    tick={{ fill: "#94a3b8", fontSize: 11 }}
                    tickLine={false}
                    axisLine={false}
                  />

                  <Tooltip
                    contentStyle={{
                      backgroundColor: "#111827",
                      borderRadius: "10px",
                      border: "1px solid #374151",
                      color: "#fff",
                    }}
                    labelStyle={{ color: "#cbd5e1" }}
                    formatter={(value) => [`₹${value}`, "Price"]}
                  />

                  <Line
                    type="monotone"
                    dataKey="price"
                    stroke="#3b82f6"
                    strokeWidth={3}
                    dot={{ r: 4, fill: "#3b82f6" }}
                    activeDot={{
                      r: 7,
                      stroke: "#1e3a8a",
                      strokeWidth: 5,
                    }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

        </section>

        {/* Price Records Table */}
        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white">

          <div className="border-b border-slate-200 p-5 sm:p-6">
            <h2 className="text-lg font-semibold text-slate-900">
              Price Records
            </h2>

            <p className="mt-1 text-xs text-slate-500">
              Complete recorded price history for the selected product.
            </p>
          </div>

          {history.length === 0 ? (
            <p className="py-10 text-center text-sm text-slate-500">
              No records found.
            </p>
          ) : (
            <>
            <div className="divide-y divide-slate-100 sm:hidden">
              {[...history].reverse().map((item, index) => (
                <article key={item._id} className="flex items-center justify-between gap-3 p-4">
                  <div>
                    <p className="text-xs text-slate-500">Record {index + 1}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">₹{item.price}</p>
                  </div>
                  <p className="text-right text-xs text-slate-500">{new Date(item.checkedAt).toLocaleString()}</p>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto sm:block">
              <table className="w-full min-w-[450px] text-left">

                <thead>
                  <tr className="bg-slate-50">
                    {["No.", "Price", "Checked At"].map(
                      (heading) => (
                        <th
                          key={heading}
                          className="px-5 py-4 text-[11px] font-semibold uppercase tracking-wider text-slate-500"
                        >
                          {heading}
                        </th>
                      )
                    )}
                  </tr>
                </thead>

                <tbody>
                  {[...history].reverse().map((item, index) => (
                    <tr
                      key={item._id}
                      className="border-t border-slate-200 transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4 text-sm text-slate-500">
                        {index + 1}
                      </td>

                      <td className="px-5 py-4 text-sm font-semibold text-slate-900">
                        ₹{item.price}
                      </td>

                      <td className="whitespace-nowrap px-5 py-4 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-2">
                          <Clock size={14} />
                          {new Date(item.checkedAt).toLocaleString()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>

              </table>
            </div>
            </>
          )}

        </section>

        {/* Footer */}
        <footer className="mt-7 border-t border-slate-800 pt-5 text-xs text-slate-500">
          Quick Commerce Stock Watcher · Price History
        </footer>

      </div>
    </div>
  );
}

export default PriceHistory;
