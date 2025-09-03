import React, { useState, useEffect, useMemo } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
  LineChart, Line, ScatterChart, Scatter, ComposedChart
} from 'recharts';

// --- Configuration from Inputs ---
const DATASET_SCHEMA = {
  dataset: {
    endpoint: 'http://127.0.0.1:8000/api/analysis/dataset/11',
    method: 'GET',
    columns: [
      { name: 'Date', type: 'object' },
      { name: 'Region', type: 'object' },
      { name: 'Product', type: 'object' },
      { name: 'Sales', type: 'int64' },
      { name: 'Profit', type: 'int64' },
      { name: 'Quantity', type: 'int64' },
      { name: 'Discount', type: 'int64' }
    ]
  }
};

const DASHBOARD_SPEC = {
  'bar chart(columns)': { x: 'Region', y: 'Sales' },
  'stacked bar chart': { x: 'Region', y: 'Sales' },
  'scatter plot': { x: 'Discount', y: 'Profit' },
  'line chart': { x: 'Date', y: 'Sales' }, // Changed 'date' to 'Date' to match schema
  'box plot': { x: 'Region', y: 'Sales' }, // This type will be explicitly skipped
  'lollipop chart': { x: 'Product', y: 'Profit' }
};

// --- Helper Utilities ---

const groupBy = (data, key) => {
  if (!data || !key) return {};
  return data.reduce((acc, item) => {
    const groupValue = item[key];
    if (!acc[groupValue]) {
      acc[groupValue] = [];
    }
    acc[groupValue].push(item);
    return acc;
  }, {});
};

const aggregate = (data, valueKey, aggType) => {
  if (!data || data.length === 0) return 0;

  const numericValues = data
    .map(item => item[valueKey])
    .filter(value => typeof value === 'number' && !isNaN(value));

  if (numericValues.length === 0) {
    return aggType === 'count' ? data.length : 0;
  }

  switch (aggType) {
    case 'sum':
      return numericValues.reduce((sum, val) => sum + val, 0);
    case 'count':
      return data.length;
    case 'avg':
      return numericValues.reduce((sum, val) => sum + val, 0) / numericValues.length;
    default:
      return 0;
  }
};

const inferXType = (xKey, schemaColumns) => {
  const column = schemaColumns.find(col => col.name === xKey);
  if (column && (column.name.toLowerCase().includes('date') || column.type === 'object')) {
    return 'time';
  }
  if (column && (column.type === 'int64' || column.type === 'float64')) {
    return 'number';
  }
  return 'category';
};

const getProcessedData = (rawData, xKey, yKey, aggType, stackKey = null, schemaColumns) => {
  if (!rawData || rawData.length === 0) return [];

  const xType = inferXType(xKey, schemaColumns);

  const parsedData = rawData.map(item => {
    const newItem = { ...item };
    if (xType === 'time' && item[xKey]) {
      newItem[xKey] = new Date(item[xKey]).getTime();
    }
    return newItem;
  });

  if (!yKey) {
    const grouped = groupBy(parsedData, xKey);
    return Object.keys(grouped).map(key => ({
      [xKey]: xType === 'time' ? new Date(parseInt(key)).getTime() : key,
      count: grouped[key].length
    }));
  }

  if (stackKey) {
    const groupedByXAndStack = parsedData.reduce((acc, item) => {
      const xValue = item[xKey];
      const stackValue = item[stackKey];
      if (!acc[xValue]) acc[xValue] = {};
      if (!acc[xValue][stackValue]) acc[xValue][stackValue] = [];
      acc[xValue][stackValue].push(item);
      return acc;
    }, {});

    return Object.keys(groupedByXAndStack).map(xVal => {
      const row = { [xKey]: xType === 'time' ? new Date(parseInt(xVal)).getTime() : xVal };
      Object.keys(groupedByXAndStack[xVal]).forEach(stackVal => {
        row[stackVal] = aggregate(groupedByXAndStack[xVal][stackVal], yKey, aggType);
      });
      return row;
    });
  }

  const grouped = groupBy(parsedData, xKey);
  return Object.keys(grouped).map(key => ({
    [xKey]: xType === 'time' ? new Date(parseInt(key)).getTime() : key,
    [yKey]: aggregate(grouped[key], yKey, aggType)
  }));
};

// --- Main Component ---

const AutoVizDashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const endpoint = DATASET_SCHEMA.dataset.endpoint;
  const schemaColumns = DATASET_SCHEMA.dataset.columns;

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await fetch(endpoint);
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const result = await response.json();
      setData(result);
    } catch (e) {
      console.error("Failed to fetch data:", e);
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    const intervalId = setInterval(fetchData, 100000);
    return () => clearInterval(intervalId);
  }, [endpoint]);

  const processedChartData = useMemo(() => {
    if (!data) return {};

    const chartData = {};
    for (const chartName in DASHBOARD_SPEC) {
      const config = DASHBOARD_SPEC[chartName];
      const { x: xKey, y: yKey } = config;

      let aggType = 'sum';
      const yColumn = schemaColumns.find(col => col.name === yKey);
      if (!yColumn || (yColumn.type !== 'int64' && yColumn.type !== 'float64')) {
        aggType = 'count';
      }

      let stackKey = null;
      if (chartName === 'stacked bar chart') {
        const availableCategoricalColumns = schemaColumns.filter(
          col => col.type === 'object' && col.name !== xKey && col.name !== yKey
        );
        if (availableCategoricalColumns.length > 0) {
          stackKey = availableCategoricalColumns[0].name;
        } else {
          console.warn(
            `Stacked bar chart "${chartName}" requires a third categorical dimension for stacking, but none found. Rendering as a regular bar chart.`
          );
        }
      }

      chartData[chartName] = getProcessedData(data, xKey, yKey, aggType, stackKey, schemaColumns);
    }
    return chartData;
  }, [data, schemaColumns]);

  const renderChart = (chartName, config) => {
    const { x: xKey, y: yKey } = config;
    const chartData = processedChartData[chartName];
    const xType = inferXType(xKey, schemaColumns);

    if (!chartData || chartData.length === 0) {
      return <div style={{ textAlign: 'center', padding: '20px', color: '#666' }}>No data for {chartName}.</div>;
    }

    const commonProps = {
      data: chartData,
      margin: { top: 20, right: 30, left: 20, bottom: 5 },
      style: { fontSize: '12px' }
    };

    const xAxisProps = {
      dataKey: xKey,
      angle: xType === 'category' && chartData.length > 5 ? -45 : 0,
      textAnchor: xType === 'category' && chartData.length > 5 ? 'end' : 'middle',
      height: xType === 'category' && chartData.length > 5 ? 60 : 30,
      interval: 0,
      tickFormatter: xType === 'time' ? tickItem => new Date(tickItem).toLocaleDateString() : undefined,
      type: xType === 'time' ? 'number' : xType,
      domain: xType === 'time' ? ['dataMin', 'dataMax'] : undefined,
      scale: xType === 'time' ? 'time' : undefined,
      label: { value: xKey, position: 'insideBottom', offset: -5 }
    };

    const yAxisProps = {
      label: { value: yKey || 'Count', angle: -90, position: 'insideLeft' }
    };

    switch (chartName) {
      case 'bar chart(columns)':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip formatter={value => value.toLocaleString()} />
              <Legend />
              <Bar dataKey={yKey} fill="#8884d8" name={yKey} />
            </BarChart>
          </ResponsiveContainer>
        );

      case 'stacked bar chart': {
        const stackCategories = Array.from(
          new Set(chartData.flatMap(item => Object.keys(item).filter(k => k !== xKey)))
        );
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#a4de6c', '#d0ed57'];

        if (stackCategories.length <= 1) {
          return (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart {...commonProps}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis {...xAxisProps} />
                <YAxis {...yAxisProps} />
                <Tooltip formatter={value => value.toLocaleString()} />
                <Legend />
                <Bar dataKey={yKey} fill="#8884d8" name={yKey} />
              </BarChart>
            </ResponsiveContainer>
          );
        }

        return (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip formatter={value => value.toLocaleString()} />
              <Legend />
              {stackCategories.map((category, index) => (
                <Bar
                  key={category}
                  dataKey={category}
                  stackId="a"
                  fill={colors[index % colors.length]}
                  name={category}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        );
      }

      case 'scatter plot':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ScatterChart {...commonProps}>
              <CartesianGrid />
              <XAxis {...xAxisProps} type="number" domain={['auto', 'auto']} />
              <YAxis {...yAxisProps} type="number" domain={['auto', 'auto']} />
              <Tooltip cursor={{ strokeDasharray: '3 3' }} formatter={value => value.toLocaleString()} />
              <Legend />
              <Scatter name={chartName} dataKey={yKey} fill="#8884d8" />
            </ScatterChart>
          </ResponsiveContainer>
        );

      case 'line chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <LineChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip formatter={value => value.toLocaleString()} />
              <Legend />
              <Line type="monotone" dataKey={yKey} stroke="#8884d8" activeDot={{ r: 8 }} name={yKey} />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'lollipop chart':
        return (
          <ResponsiveContainer width="100%" height={300}>
            <ComposedChart {...commonProps}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis {...xAxisProps} />
              <YAxis {...yAxisProps} />
              <Tooltip formatter={value => value.toLocaleString()} />
              <Legend />
              <Bar dataKey={yKey} fill="#8884d8" barSize={2} name={yKey} />
              <Scatter dataKey={yKey} fill="#8884d8" shape="circle" radius={5} />
            </ComposedChart>
          </ResponsiveContainer>
        );

      case 'box plot':
        return (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#ff6666',
              border: '1px dashed #ff6666',
              borderRadius: '5px'
            }}
          >
            Box Plot is not directly supported by Recharts and is skipped.
          </div>
        );

      default:
        return (
          <div
            style={{
              textAlign: 'center',
              padding: '20px',
              color: '#ff6666',
              border: '1px dashed #ff6666',
              borderRadius: '5px'
            }}
          >
            Unsupported chart type: {chartName}
          </div>
        );
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px' }}>Loading data...</div>;
  }

  if (error) {
    return <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: 'red' }}>Error: {error}</div>;
  }

  if (!data || data.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '50px', fontSize: '20px', color: '#666' }}>
        No data available to display.
      </div>
    );
  }

  return (
    <div
      style={{
        fontFamily: 'Arial, sans-serif',
        padding: '20px',
        maxWidth: '1200px',
        margin: '0 auto'
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '30px', color: '#333' }}>AutoViz Dashboard</h1>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(450px, 1fr))',
          gap: '30px'
        }}
      >
        {Object.entries(DASHBOARD_SPEC).map(([chartName, config]) => (
          <div
            key={chartName}
            style={{
              border: '1px solid #e0e0e0',
              borderRadius: '8px',
              padding: '15px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
              backgroundColor: '#fff'
            }}
          >
            <h2
              style={{
                textAlign: 'center',
                marginBottom: '15px',
                fontSize: '1.2em',
                color: '#555'
              }}
            >
              {chartName
                .split(' ')
                .map(word => word.charAt(0).toUpperCase() + word.slice(1))
                .join(' ')}
            </h2>
            {renderChart(chartName, config)}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutoVizDashboard;
