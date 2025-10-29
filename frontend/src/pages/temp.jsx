import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
  ComposedChart,
} from "recharts";

const DashboardComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/analysis/dataset/42");
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const result = await response.json();
        if (isMounted) {
          setData(Array.isArray(result) ? result : []);
          setLoading(false);
        }
      } catch (err) {
        if (isMounted) {
          setError(err.message);
          setLoading(false);
        }
      }
    };
    fetchData();
    return () => {
      isMounted = false;
    };
  }, []);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        kpis: {
          totalSales: 0,
          totalProfit: 0,
          averageDiscount: 0,
          profitMargin: 0,
        },
        salesByRegion: [],
        profitByProduct: [],
        salesTrend: [],
        profitVsDiscount: [],
        quantityByProduct: [],
        salesProfitByRegion: [],
      };
    }

    try {
      const totalSales = data.reduce((acc, item) => acc + (typeof item.Sales === "number" ? item.Sales : 0), 0);
      const totalProfit = data.reduce((acc, item) => acc + (typeof item.Profit === "number" ? item.Profit : 0), 0);
      const totalDiscount = data.reduce((acc, item) => acc + (typeof item.Discount === "number" ? item.Discount : 0), 0);
      const averageDiscount = data.length > 0 ? totalDiscount / data.length : 0;
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      const salesByRegionMap = new Map();
      const profitByProductMap = new Map();
      const salesTrendMap = new Map();
      const quantityByProductMap = new Map();
      const salesProfitByRegionMap = new Map();

      data.forEach((item) => {
        const region = item.Region || "Unknown";
        const product = item.Product || "Unknown";
        const sales = typeof item.Sales === "number" ? item.Sales : 0;
        const profit = typeof item.Profit === "number" ? item.Profit : 0;
        const quantity = typeof item.Quantity === "number" ? item.Quantity : 0;
        const discount = typeof item.Discount === "number" ? item.Discount : 0;
        const date = item.Date ? new Date(item.Date) : null;
        const formattedDate = date ? date.toISOString().split("T")[0] : "Unknown Date";

        salesByRegionMap.set(region, (salesByRegionMap.get(region) || 0) + sales);
        profitByProductMap.set(product, (profitByProductMap.get(product) || 0) + profit);

        if (formattedDate !== "Unknown Date") {
          salesTrendMap.set(formattedDate, (salesTrendMap.get(formattedDate) || 0) + sales);
        }

        quantityByProductMap.set(product, (quantityByProductMap.get(product) || 0) + quantity);

        const currentRegionData = salesProfitByRegionMap.get(region) || { region: region, sales: 0, profit: 0 };
        currentRegionData.sales += sales;
        currentRegionData.profit += profit;
        salesProfitByRegionMap.set(region, currentRegionData);
      });

      const salesByRegion = Array.from(salesByRegionMap, ([region, sales]) => ({ region, sales }));
      const profitByProduct = Array.from(profitByProductMap, ([product, profit]) => ({ product, profit }));
      const salesTrend = Array.from(salesTrendMap, ([date, sales]) => ({ date, sales })).sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
      const profitVsDiscount = data.map(item => ({
        discount: typeof item.Discount === "number" ? item.Discount : 0,
        profit: typeof item.Profit === "number" ? item.Profit : 0,
        id: `${item.Region || ""}-${item.Product || ""}-${item.Date || ""}-${Math.random()}`
      }));
      const quantityByProduct = Array.from(quantityByProductMap, ([product, quantity]) => ({ name: product, value: quantity }));
      const salesProfitByRegion = Array.from(salesProfitByRegionMap.values());

      return {
        kpis: {
          totalSales,
          totalProfit,
          averageDiscount,
          profitMargin,
        },
        salesByRegion,
        profitByProduct,
        salesTrend,
        profitVsDiscount,
        quantityByProduct,
        salesProfitByRegion,
      };
    } catch (processingError) {
      setError("Failed to process data for charts and KPIs.");
      return {
        kpis: {
          totalSales: 0,
          totalProfit: 0,
          averageDiscount: 0,
          profitMargin: 0,
        },
        salesByRegion: [],
        profitByProduct: [],
        salesTrend: [],
        profitVsDiscount: [],
        quantityByProduct: [],
        salesProfitByRegion: [],
      };
    }
  }, [data]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="flex flex-col items-center space-y-4">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
          <p className="text-lg text-gray-600">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-red-600 font-bold mb-4">Error: {error}</p>
          <p className="text-gray-700">Failed to load data. Please try again later.</p>
          <button
            onClick={() => {
              setLoading(true);
              setError(null);
              window.location.reload();
            }}
            className="mt-4 px-6 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const { kpis, salesByRegion, profitByProduct, salesTrend, profitVsDiscount, quantityByProduct, salesProfitByRegion } = processedData;

  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sales Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <p className="text-lg font-semibold text-gray-600">Total Sales</p>
          <p className="text-3xl font-bold text-blue-600 mt-2">${kpis.totalSales.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <p className="text-lg font-semibold text-gray-600">Total Profit</p>
          <p className="text-3xl font-bold text-green-600 mt-2">${kpis.totalProfit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <p className="text-lg font-semibold text-gray-600">Average Discount</p>
          <p className="text-3xl font-bold text-purple-600 mt-2">{kpis.averageDiscount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 flex flex-col items-center justify-center">
          <p className="text-lg font-semibold text-gray-600">Profit Margin</p>
          <p className="text-3xl font-bold text-yellow-600 mt-2">{kpis.profitMargin.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}%</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Sales by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByRegion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Sales ($)", angle: -90, position: "insideLeft", fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Total Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Profit by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitByProduct} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Profit ($)", angle: -90, position: "insideLeft", fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="profit" fill="#82ca9d" name="Total Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Sales Trend Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesTrend} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="date" tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Sales ($)", angle: -90, position: "insideLeft", fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#ffc658" activeDot={{ r: 8 }} name="Total Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Profit vs. Discount</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="discount" name="Discount (%)" unit="%" tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="profit" name="Profit ($)" unit="$" tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => [`$${value.toLocaleString()}`, name]} />
              <Legend />
              <Scatter name="Profit vs. Discount" data={profitVsDiscount} fill="#ff7300" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Quantity Sold by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={quantityByProduct}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                labelLine={false}
                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
              >
                {quantityByProduct.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => value.toLocaleString()} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4 text-center">Sales & Profit by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesProfitByRegion} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-45} textAnchor="end" height={60} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" label={{ value: "Sales ($)", angle: -90, position: "insideLeft", fontSize: 12 }} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Profit ($)", angle: 90, position: "insideRight", fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" fill="#413ea0" name="Total Sales" />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#ff7300" name="Total Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;