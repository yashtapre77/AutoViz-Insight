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
        const response = await fetch('http://127.0.0.1:8000/api/analysis/dataset/35');
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
  }, [retryCount]);

  const processedData = useMemo(() => {
    if (!data || data.length === 0) {
      return {
        totalSales: 0,
        totalProfit: 0,
        averageDiscount: 0,
        profitMargin: 0,
        salesByRegion: [],
        profitByProduct: [],
        salesOverTime: [],
        profitVsDiscount: [],
        salesProfitByRegion: [],
        productQuantityDistribution: [],
      };
    }

    try {
      let totalSales = 0;
      let totalProfit = 0;
      let totalDiscount = 0;
      let validDiscountCount = 0;

      const salesByRegionMap = new Map();
      const profitByProductMap = new Map();
      const salesOverTimeMap = new Map();
      const profitVsDiscountData = [];
      const salesProfitByRegionMap = new Map();
      const productQuantityDistributionMap = new Map();

      data.forEach(item => {
        const sales = typeof item.Sales === 'number' ? item.Sales : 0;
        const profit = typeof item.Profit === 'number' ? item.Profit : 0;
        const discount = typeof item.Discount === 'number' ? item.Discount : 0;
        const quantity = typeof item.Quantity === 'number' ? item.Quantity : 0;
        const region = typeof item.Region === 'string' ? item.Region : 'Unknown';
        const product = typeof item.Product === 'string' ? item.Product : 'Unknown';
        const date = typeof item.Date === 'string' ? new Date(item.Date) : null;

        totalSales += sales;
        totalProfit += profit;
        if (discount !== null && discount !== undefined) {
          totalDiscount += discount;
          validDiscountCount++;
        }

        salesByRegionMap.set(region, (salesByRegionMap.get(region) || 0) + sales);
        profitByProductMap.set(product, (profitByProductMap.get(product) || 0) + profit);

        if (date && !isNaN(date)) {
          const monthYear = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}`;
          salesOverTimeMap.set(monthYear, (salesOverTimeMap.get(monthYear) || 0) + sales);
        }

        profitVsDiscountData.push({ discount: discount, profit: profit });

        const currentRegionData = salesProfitByRegionMap.get(region) || { sales: 0, profit: 0 };
        currentRegionData.sales += sales;
        currentRegionData.profit += profit;
        salesProfitByRegionMap.set(region, currentRegionData);

        productQuantityDistributionMap.set(product, (productQuantityDistributionMap.get(product) || 0) + quantity);
      });

      const averageDiscount = validDiscountCount > 0 ? totalDiscount / validDiscountCount : 0;
      const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;

      const salesByRegion = Array.from(salesByRegionMap, ([region, sales]) => ({ region, sales }));
      const profitByProduct = Array.from(profitByProductMap, ([product, profit]) => ({ product, profit }));
      const salesOverTime = Array.from(salesOverTimeMap, ([monthYear, sales]) => ({ monthYear, sales }))
        .sort((a, b) => a.monthYear.localeCompare(b.monthYear));
      const salesProfitByRegion = Array.from(salesProfitByRegionMap, ([region, values]) => ({ region, sales: values.sales, profit: values.profit }));
      const productQuantityDistribution = Array.from(productQuantityDistributionMap, ([product, quantity]) => ({ product, quantity }));

      return {
        totalSales,
        totalProfit,
        averageDiscount,
        profitMargin,
        salesByRegion,
        profitByProduct,
        salesOverTime,
        profitVsDiscount: profitVsDiscountData,
        salesProfitByRegion,
        productQuantityDistribution,
      };
    } catch (e) {
      console.error("Error processing data:", e);
      setError("Error processing data for charts.");
      return {
        totalSales: 0,
        totalProfit: 0,
        averageDiscount: 0,
        profitMargin: 0,
        salesByRegion: [],
        profitByProduct: [],
        salesOverTime: [],
        profitVsDiscount: [],
        salesProfitByRegion: [],
        productQuantityDistribution: [],
      };
    }
  }, [data]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          <p className="mt-4 text-lg text-gray-700">Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="flex flex-col items-center p-6 bg-white rounded-lg shadow-lg text-red-600">
          <p className="text-xl font-bold mb-4">Error: {error}</p>
          <p className="text-gray-700 mb-4">Failed to load data. Please try again.</p>
          <button
            onClick={() => setRetryCount(prev => prev + 1)}
            className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  const {
    totalSales,
    totalProfit,
    averageDiscount,
    profitMargin,
    salesByRegion,
    profitByProduct,
    salesOverTime,
    profitVsDiscount,
    salesProfitByRegion,
    productQuantityDistribution,
  } = processedData;

  const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <h1 className="text-3xl font-bold text-gray-800 mb-6 text-center">Sales Performance Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-600">Total Sales</p>
            <p className="text-3xl font-bold text-blue-600 mt-1">${totalSales.toLocaleString()}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V3m0 9v3m0-9c-1.11 0-2.08-.402-2.599-1M12 12c-1.11 0-2.08.402-2.599 1M12 12V9m0 3v3m0 0h.01M12 12h.01" />
          </svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-600">Total Profit</p>
            <p className={`text-3xl font-bold mt-1 ${totalProfit >= 0 ? 'text-green-600' : 'text-red-600'}`}>${totalProfit.toLocaleString()}</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${totalProfit >= 0 ? 'text-green-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
          </svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-600">Avg. Discount</p>
            <p className="text-3xl font-bold text-purple-600 mt-1">{averageDiscount.toFixed(2)}%</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10 text-purple-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
          </svg>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex items-center justify-between">
          <div>
            <p className="text-lg font-semibold text-gray-600">Profit Margin</p>
            <p className={`text-3xl font-bold mt-1 ${profitMargin >= 0 ? 'text-teal-600' : 'text-red-600'}`}>{profitMargin.toFixed(2)}%</p>
          </div>
          <svg xmlns="http://www.w3.org/2000/svg" className={`h-10 w-10 ${profitMargin >= 0 ? 'text-teal-400' : 'text-red-400'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={salesByRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 12 }} label={{ value: "Region", position: "insideBottom", offset: 0, dy: 15 }} />
              <YAxis label={{ value: "Sales", angle: -90, position: "insideLeft", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="sales" fill="#8884d8" name="Total Sales" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Profit by Product</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={profitByProduct}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="product" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 12 }} label={{ value: "Product", position: "insideBottom", offset: 0, dy: 15 }} />
              <YAxis label={{ value: "Profit", angle: -90, position: "insideLeft", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar dataKey="profit" fill="#82ca9d" name="Total Profit" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Monthly Sales Trend</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={salesOverTime}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthYear" tick={{ fontSize: 12 }} label={{ value: "Month-Year", position: "insideBottom", offset: 0, dy: 15 }} />
              <YAxis label={{ value: "Sales", angle: -90, position: "insideLeft", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Line type="monotone" dataKey="sales" stroke="#ffc658" name="Total Sales" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Profit vs. Discount</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis type="number" dataKey="discount" name="Discount" unit="%" label={{ value: "Discount (%)", position: "insideBottom", offset: 0, dy: 15 }} tick={{ fontSize: 12 }} />
              <YAxis type="number" dataKey="profit" name="Profit" unit="$" label={{ value: "Profit ($)", angle: -90, position: "insideLeft", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ strokeDasharray: "3 3" }} formatter={(value, name) => name === "Profit" ? `$${value.toLocaleString()}` : `${value}%`} />
              <Legend />
              <Scatter name="Profit vs. Discount" data={profitVsDiscount} fill="#ff7300" />
            </ScatterChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Sales & Profit by Region</h2>
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart data={salesProfitByRegion}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="region" angle={-15} textAnchor="end" height={60} tick={{ fontSize: 12 }} label={{ value: "Region", position: "insideBottom", offset: 0, dy: 15 }} />
              <YAxis yAxisId="left" label={{ value: "Sales", angle: -90, position: "insideLeft", dy: 15, dx: -10, fontSize: 12 }} tick={{ fontSize: 12 }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Profit", angle: 90, position: "insideRight", dy: 15, dx: 10, fontSize: 12 }} tick={{ fontSize: 12 }} />
              <Tooltip formatter={(value) => `$${value.toLocaleString()}`} />
              <Legend />
              <Bar yAxisId="left" dataKey="sales" fill="#8884d8" name="Total Sales" />
              <Line yAxisId="right" type="monotone" dataKey="profit" stroke="#ff7300" name="Total Profit" />
            </ComposedChart>
          </ResponsiveContainer>
        </div>

        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Product Quantity Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={productQuantityDistribution}
                dataKey="quantity"
                nameKey="product"
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                label={(entry) => `${entry.product} (${entry.quantity})`}
              >
                {productQuantityDistribution.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip formatter={(value) => `${value.toLocaleString()} units`} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default DashboardComponent;