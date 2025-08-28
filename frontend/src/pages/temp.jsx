import React from 'react';
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, AreaChart, Area, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ComposedChart, CartesianGrid, XAxis, YAxis, Tooltip, Legend, ResponsiveContainer } from 'recharts';

// --- Dummy Data ---

// Data for Line Chart (Monthly Sales)
const salesData = [
  { name: 'Jan', sales: 4000, revenue: 2400 },
  { name: 'Feb', sales: 3000, revenue: 1398 },
  { name: 'Mar', sales: 2000, revenue: 9800 },
  { name: 'Apr', sales: 2780, revenue: 3908 },
  { name: 'May', sales: 1890, revenue: 4800 },
  { name: 'Jun', sales: 2390, revenue: 3800 },
  { name: 'Jul', sales: 3490, revenue: 4300 },
];

// Data for Bar Chart (Website Traffic by Source)
const trafficData = [
  { source: 'Google', users: 1200 },
  { source: 'Facebook', users: 950 },
  { source: 'Twitter', users: 600 },
  { source: 'Direct', users: 800 },
  { source: 'Referral', users: 450 },
];

// Data for Pie Chart (Device Usage)
const deviceData = [
  { name: 'Desktop', value: 400 },
  { name: 'Mobile', value: 300 },
  { name: 'Tablet', value: 300 },
];
const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28'];

// Data for Area Chart (User Signups)
const signupData = [
  { month: 'Jan', signups: 21 },
  { month: 'Feb', signups: 35 },
  { month: 'Mar', signups: 28 },
  { month: 'Apr', signups: 80 },
  { month: 'May', signups: 42 },
  { month: 'Jun', signups: 95 },
];

// Data for Composed Chart (Product Performance)
const productData = [
  { name: 'Product A', uv: 590, pv: 800, amt: 1400 },
  { name: 'Product B', uv: 868, pv: 967, amt: 1506 },
  { name: 'Product C', uv: 1397, pv: 1098, amt: 989 },
  { name: 'Product D', uv: 1480, pv: 1200, amt: 1228 },
  { name: 'Product E', uv: 1520, pv: 1108, amt: 1100 },
  { name: 'Product F', uv: 1400, pv: 680, amt: 1700 },
];

// Data for Radar Chart (Feature Satisfaction)
const featureData = [
  { subject: 'UI/UX', A: 120, B: 110, fullMark: 150 },
  { subject: 'Performance', A: 98, B: 130, fullMark: 150 },
  { subject: 'Features', A: 86, B: 130, fullMark: 150 },
  { subject: 'Support', A: 99, B: 100, fullMark: 150 },
  { subject: 'Price', A: 85, B: 90, fullMark: 150 },
  { subject: 'Reliability', A: 65, B: 85, fullMark: 150 },
];


// --- Chart Card Component ---
// A reusable component to wrap each chart in a styled card.
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-300">
    <h3 className="text-xl font-semibold text-gray-700 mb-4">{title}</h3>
    <div style={{ width: '100%', height: 300 }}>
      {children}
    </div>
  </div>
);


// --- Main Dashboard App Component ---
export default function Dashboard() {
  return (
    <div className="min-h-screen bg-gray-100 p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Analytics Dashboard</h1>
          <p className="text-gray-500 mt-1">Overview of key business metrics.</p>
        </header>

        {/* Grid for the charts */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          
          {/* Chart 1: Monthly Sales (Line Chart) */}
          <ChartCard title="Monthly Sales">
            <ResponsiveContainer>
              <LineChart data={salesData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="sales" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="revenue" stroke="#82ca9d" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 2: Website Traffic (Bar Chart) */}
          <ChartCard title="Website Traffic by Source">
            <ResponsiveContainer>
              <BarChart data={trafficData} layout="vertical" margin={{ top: 5, right: 20, left: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="source" type="category" width={80} />
                <Tooltip />
                <Legend />
                <Bar dataKey="users" fill="#4A90E2" barSize={20} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 3: Device Usage (Pie Chart) */}
          <ChartCard title="Device Usage">
            <ResponsiveContainer>
              <PieChart>
                <Pie data={deviceData} cx="50%" cy="50%" labelLine={false} outerRadius={120} fill="#8884d8" dataKey="value" label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}>
                  {deviceData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 4: User Signups (Area Chart) */}
          <ChartCard title="User Signups">
            <ResponsiveContainer>
              <AreaChart data={signupData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="signups" stroke="#FF7300" fill="#FF7300" fillOpacity={0.3} />
              </AreaChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 5: Product Performance (Composed Chart) */}
          <ChartCard title="Product Performance">
            <ResponsiveContainer>
              <ComposedChart data={productData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                <CartesianGrid stroke="#f5f5f5" />
                <XAxis dataKey="name" scale="band" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Area type="monotone" dataKey="amt" fill="#8884d8" stroke="#8884d8" />
                <Bar dataKey="pv" barSize={20} fill="#413ea0" />
                <Line type="monotone" dataKey="uv" stroke="#ff7300" />
              </ComposedChart>
            </ResponsiveContainer>
          </ChartCard>

          {/* Chart 6: Feature Satisfaction (Radar Chart) */}
          <ChartCard title="Feature Satisfaction">
            <ResponsiveContainer>
              <RadarChart cx="50%" cy="50%" outerRadius="80%" data={featureData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="subject" />
                <PolarRadiusAxis />
                <Tooltip />
                <Legend />
                <Radar name="Survey A" dataKey="A" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                <Radar name="Survey B" dataKey="B" stroke="#82ca9d" fill="#82ca9d" fillOpacity={0.6} />
              </RadarChart>
            </ResponsiveContainer>
          </ChartCard>

        </div>
      </div>
    </div>
  );
}
