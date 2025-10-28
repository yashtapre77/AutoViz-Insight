import React, { useState, useEffect, useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  ScatterChart,
  Scatter,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

const DashboardComponent = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    let isMounted = true;
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await fetch("http://127.0.0.1:8000/api/analysis/dataset/17");
        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Failed to fetch data: ${response.status} ${response.statusText} - ${errorText}`);
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
  }, [retryCount]);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        kpis: {
          totalSales: 0,
          totalProfit: 0,
          averageDiscount: 0,
          profitMargin: 0,
        },
        charts: {
          salesByRegion: [],
          profitByProduct: [],
          salesOverTime: [],
          profitDiscountScatter: [],
          quantityByRegion: [],
          salesProfitByProduct: [],
        },
      };
    }

    try {
      const safeParseInt = (value) => {
        const parsed = parseInt(value, 10);
        return isNaN(parsed) ? 0 : parsed;
      };

      let totalSales = 0;
      let totalProfit = 0;
      let totalDiscount = 0;
      let totalQuantity = 0;
      let validEntries = 0;

      const salesByRegion = {};
      const profitByProduct = {};
      const salesOverTime = {};
      const profitDiscountScatter = [];
      const quantityByRegion = {};
      const salesProfitByProduct = {};

      data.forEach((item) => {
        const sales = safeParseInt(item.Sales);
        const profit = safeParseInt(item.Profit);
        const quantity = safeParseInt(item.Quantity);
        const discount = safeParseInt(item.Discount);
        const region = item.Region || "Unknown";
        const product = item.Product || "Unknown";
        const date = item.Date;

        if (sales !== 0 || profit !== 0 || quantity !== 0) {
          totalSales += sales;
          totalProfit += profit;
          totalDiscount += discount;
          totalQuantity += quantity;
          validEntries++;
        }

        salesByRegion[region] = (salesByRegion[region] || 0) + sales;

        profitByProduct[product] = (profitByProduct[product] || 0) + profit;

        if (date) {
          try {
            const d = new Date(date);
            if (!isNaN(d.getTime())) {
              const monthYear = `${d.getFullYear()}-${(d.getMonth() + 1).toString().padStart(2, "0")}`;
              salesOverTime[monthYear] = (salesOverTime[monthYear] || 0) + sales;
            }
          } catch (e) {
            // console.warn("Invalid date format:", date, e);
          }
        }

        profitDiscountScatter.push({
          profit: profit,
          discount: discount,
          region: region,
          product: product,
        });

        quantityByRegion[region] = (quantityByRegion[region] || 0) + quantity;

        salesProfitByProduct[product] = {
          sales: (salesProfitByProduct[product]?.sales || 0) + sales,
          profit: (salesProfitByProduct[product]?.profit || 0) + profit,
        };
      });

      const formattedSalesByRegion = Object.keys(salesByRegion).map((key) => ({
        region: key,
        sales: salesByRegion[key],
      }));

      const formattedProfitByProduct = Object.keys(profitByProduct).map((key) => ({
        product: key,
        profit: profitByProduct[key],
      }));

      const formattedSalesOverTime = Object.keys(salesOverTime)
        .sort()
        .map((key) => ({
          date: key,
          sales: salesOverTime[key],
        }));

      const formattedQuantityByRegion = Object.keys(quantityByRegion).map((key) => ({
        name: key,
        value: quantityByRegion[key],
      }));

      const formattedSalesProfitByProduct = Object.keys(salesProfitByProduct).map((key) => ({
        product: key,
        sales: salesProfitByProduct[key].sales,
        profit: salesProfitByProduct[key].profit,
      }));

      const averageDiscount = validEntries > 0 ? totalDiscount / validEntries : 0;
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      return {
        kpis: {
          totalSales: totalSales,
          totalProfit: totalProfit,
          averageDiscount: averageDiscount,
          profitMargin: profitMargin,
        },
        charts: {
          salesByRegion: formattedSalesByRegion,
          profitByProduct: formattedProfitByProduct,
          salesOverTime: formattedSalesOverTime,
          profitDiscountScatter: profitDiscountScatter,
          quantityByRegion: formattedQuantityByRegion,
          salesProfitByProduct: formattedSalesProfitByProduct,
        },
      };
    } catch (e) {
      setError("Error processing data for charts: " + e.message);
      return {
        kpis: {
          totalSales: 0,
          totalProfit: 0,
          averageDiscount: 0,
          profitMargin: 0,
        },
        charts: {
          salesByRegion: [],
          profitByProduct: [],
          salesOverTime: [],
          profitDiscountScatter: [],
          quantityByRegion: [],
          salesProfitByProduct: [],
        },
      };
    }
  }, [data]);

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7300", "#0088FE", "#00C49F", "#FFBB28", "#FF8042"];

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-blue-500 border-solid mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white p-8 rounded-lg shadow-md text-center">
          <p className="text-xl text-red-600 font-bold mb-4">Error: {error}</p>
          <p className="text-gray-700 mb-6">Failed to load data. Please try again.</p>
          <button
            onClick={() => setRetryCount((prev) => prev + 1)}
            className="px-6 py-3 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 transition duration-300"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const kpis = processedData.kpis || {};
  const charts = processedData.charts || {};

  const renderCustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
          <p className="font-bold text-gray-800">{label}</p>
          {payload.map((entry, index) => (
            <p key={`item-${index}`} style={{ color: entry.color }}>
              {entry.name}: <span className="font-medium">{entry.value.toLocaleString()}</span>
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  const renderScatterTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const dataPoint = payload[0].payload;
      return (
        <div className="p-3 bg-white border border-gray-300 rounded-md shadow-lg text-sm">
          <p className="font-bold text-gray-800">Product: {dataPoint.product}</p>
          <p className="text-gray-700">Region: {dataPoint.region}</p>
          <p className="text-blue-600">Profit: {dataPoint.profit.toLocaleString()}</p>
          <p className="text-green-600">Discount: {dataPoint.discount.toLocaleString()}</p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-8 text-center">Sales Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-600">Total Sales</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">${(kpis.totalSales || 0).toLocaleString()}</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-blue-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-600">Total Profit</p>
            <p className="text-3xl font-bold text-green-600 mt-1">${(kpis.totalProfit || 0).toLocaleString()}</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-green-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
            />
          </svg>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-600">Average Discount</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{(kpis.averageDiscount || 0).toFixed(2)}</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-purple-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z"
            />
          </svg>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 flex items-center justify-between">
          <div>
            <p className="text-lg font-medium text-gray-600">Profit Margin</p>
            <p className="text-3xl font-bold text-yellow-600 mt-1">{(kpis.profitMargin || 0).toFixed(2)}%</p>
          </div>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10 text-yellow-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
            />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.salesByRegion || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="region" angle={-15} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Total Sales", angle: -90, position: "insideLeft", fontSize: 14 }} tick={{ fontSize: 12 }} />
              <Tooltip content={renderCustomTooltip} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="sales" fill="#8884d8" name="Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Profit by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={charts.profitByProduct || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="product" angle={-15} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Total Profit", angle: -90, position: "insideLeft", fontSize: 14 }} tick={{ fontSize: 12 }} />
              <Tooltip content={renderCustomTooltip} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar dataKey="profit" fill="#82ca9d" name="Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={charts.salesOverTime || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="date" angle={-15} textAnchor="end" interval="preserveStartEnd" height={60} tick={{ fontSize: 12 }} />
              <YAxis label={{ value: "Total Sales", angle: -90, position: "insideLeft", fontSize: 14 }} tick={{ fontSize: 12 }} />
              <Tooltip content={renderCustomTooltip} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Line type="monotone" dataKey="sales" stroke="#ffc658" activeDot={{ r: 8 }} name="Sales" />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Profit vs. Discount</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis type="number" dataKey="discount" name="Discount" unit="" label={{ value: "Discount", position: "bottom", fontSize: 14 }} tick={{ fontSize: 12 }} />   
              <YAxis type="number" dataKey="profit" name="Profit" unit="" label={{ value: "Profit", angle: -90, position: "insideLeft", fontSize: 14 }} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} content={renderScatterTooltip} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Scatter name="Profit vs Discount" data={charts.profitDiscountScatter || []} fill="#ff7300" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Quantity by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <Pie
                data={charts.quantityByRegion || []}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label
              >
                {(charts.quantityByRegion || []).map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={renderCustomTooltip} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white rounded-lg shadow-md p-4">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales & Profit by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={charts.salesProfitByProduct || []} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" />
              <XAxis dataKey="product" angle={-15} textAnchor="end" interval={0} height={60} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="left" label={{ value: "Sales", angle: -90, position: "insideLeft", fontSize: 14 }} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Profit", angle: 90, position: "insideRight", fontSize: 14 }} tick={{ fontSize: 12 }} />
              <Tooltip content={renderCustomTooltip} />
              <Legend wrapperStyle={{ paddingTop: "10px" }} />
              <Bar yAxisId="left" dataKey="sales" fill="#413ea0" name="Sales" />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#ff7300" name="Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;