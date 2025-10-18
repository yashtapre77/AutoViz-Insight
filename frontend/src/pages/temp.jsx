import React, { useState, useEffect, useMemo } from 'react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    ScatterChart, Scatter, Line
} from 'recharts';

// --- Dataset Schema and Dashboard Spec (as constants for this component) ---
// In a real application, these would likely be passed as props or fetched from an API.
// For this exercise, they are hardcoded as per instructions.
const DATASET_SCHEMA = {
    'dataset': {
        'endpoint': 'http://127.0.0.1:8000/api/analysis/dataset/14',
        'method': 'GET',
        'columns': [
            {'name': 'Date', 'type': 'object'},
            {'name': 'Region', 'type': 'object'},
            {'name': 'Product', 'type': 'object'},
            {'name': 'Sales', 'type': 'int64'},
            {'name': 'Profit', 'type': 'int64'},
            {'name': 'Quantity', 'type': 'int64'},
            {'name': 'Discount', 'type': 'int64'}
        ]
    }
};

const DASHBOARD_SPEC = {
    'graphs': [
        {'title': 'Total Sales by Region', 'graph_type': 'bar', 'x_axis': {'feature': 'region', 'aggregation': 'none', 'bin_size': null, 'label': 'Region'}, 'y_axis': {'feature': 'sales', 'aggregation': 'sum', 'label': 'Total Sales'}, 'group_by': null, 'filters': [], 'color_scheme': null, 'additional_params': {'stacked': false, 'normalized': false, 'show_trendline': false, 'bins': null}},
        {'title': 'Total Profit by Region', 'graph_type': 'bar', 'x_axis': {'feature': 'region', 'aggregation': 'none', 'bin_size': null, 'label': 'Region'}, 'y_axis': {'feature': 'profit', 'aggregation': 'sum', 'label': 'Total Profit'}, 'group_by': null, 'filters': [], 'color_scheme': null, 'additional_params': {'stacked': false, 'normalized': false, 'show_trendline': false, 'bins': null}},
        {'title': 'Total Sales by Product', 'graph_type': 'bar', 'x_axis': {'feature': 'product', 'aggregation': 'none', 'bin_size': null, 'label': 'Product'}, 'y_axis': {'feature': 'sales', 'aggregation': 'sum', 'label': 'Total Sales'}, 'group_by': null, 'filters': [], 'color_scheme': null, 'additional_params': {'stacked': false, 'normalized': false, 'show_trendline': false, 'bins': null}},
        {'title': 'Total Profit by Product', 'graph_type': 'bar', 'x_axis': {'feature': 'product', 'aggregation': 'none', 'bin_size': null, 'label': 'Product'}, 'y_axis': {'feature': 'profit', 'aggregation': 'sum', 'label': 'Total Profit'}, 'group_by': null, 'filters': [], 'color_scheme': null, 'additional_params': {'stacked': false, 'normalized': false, 'show_trendline': false, 'bins': null}},
        {'title': 'Sales Performance by Region and Product', 'graph_type': 'stacked_bar', 'x_axis': {'feature': 'region', 'aggregation': 'none', 'bin_size': null, 'label': 'Region'}, 'y_axis': {'feature': 'sales', 'aggregation': 'sum', 'label': 'Total Sales'}, 'group_by': 'product', 'filters': [], 'color_scheme': null, 'additional_params': {'stacked': true, 'normalized': false, 'show_trendline': false, 'bins': null}},
        {'title': 'Discount vs. Profitability', 'graph_type': 'scatter', 'x_axis': {'feature': 'discount', 'aggregation': 'none', 'bin_size': null, 'label': 'Discount'}, 'y_axis': {'feature': 'profit', 'aggregation': 'none', 'label': 'Profit'}, 'group_by': null, 'filters': [], 'color_scheme': null, 'additional_params': {'stacked': false, 'normalized': false, 'show_trendline': true, 'bins': null}}
    ]
};

const DATA_ENDPOINT = 'http://127.0.0.1:8000/api/analysis/dataset/14';
const POLLING_INTERVAL_MS = 100000; // 100 seconds

// --- Helper Utilities ---

/**
 * Aggregates data based on the specified aggregation type.
 * @param {Array<Object>} data - The array of data objects.
 * @param {string} yFeature - The feature to aggregate.
 * @param {'sum'|'count'|'avg'} aggregationType - The type of aggregation.
 * @returns {number} The aggregated value.
 */
const aggregate = (data, yFeature, aggregationType) => {
    if (!data || data.length === 0) return 0;
    const values = data.map(d => parseFloat(d[yFeature])).filter(v => !isNaN(v));

    switch (aggregationType) {
        case 'sum':
            return values.reduce((acc, val) => acc + val, 0);
        case 'count':
            return values.length;
        case 'avg':
            return values.length > 0 ? values.reduce((acc, val) => acc + val, 0) / values.length : 0;
        default:
            return 0;
    }
};

/**
 * Calculates a simple linear regression line for scatter plots.
 * @param {Array<Object>} data - The data points.
 * @param {string} xKey - The key for the x-axis values.
 * @param {string} yKey - The key for the y-axis values.
 * @returns {Array<Object>} An array of two points representing the trendline.
 */
const calculateLinearRegression = (data, xKey, yKey) => {
    if (!data || data.length < 2) return [];

    let sumX = 0;
    let sumY = 0;
    let sumXY = 0;
    let sumXX = 0;

    const filteredData = data.filter(d => typeof d[xKey] === 'number' && typeof d[yKey] === 'number');
    const n = filteredData.length;

    if (n < 2) return [];

    filteredData.forEach(d => {
        sumX += d[xKey];
        sumY += d[yKey];
        sumXY += d[xKey] * d[yKey];
        sumXX += d[xKey] * d[xKey];
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const minX = Math.min(...filteredData.map(d => d[xKey]));
    const maxX = Math.max(...filteredData.map(d => d[xKey]));

    return [
        { [xKey]: minX, [yKey]: slope * minX + intercept },
        { [xKey]: maxX, [yKey]: slope * maxX + intercept }
    ];
};

/**
 * Processes raw data into a format suitable for Recharts based on graph configuration.
 * Handles date parsing, numerical parsing, grouping, and aggregation.
 * @param {Array<Object>} rawData - The raw data fetched from the endpoint.
 * @param {Object} graphConfig - The configuration for a single graph.
 * @param {Object} datasetSchema - The schema of the dataset.
 * @returns {Array<Object>} The processed data array.
 */
const processDataForGraph = (rawData, graphConfig, datasetSchema) => {
    if (!rawData || rawData.length === 0) return [];

    const xFeature = graphConfig.x_axis.feature.toLowerCase();
    const yFeature = graphConfig.y_axis.feature.toLowerCase();
    const aggregationType = graphConfig.y_axis.aggregation;
    const groupByFeature = graphConfig.group_by ? graphConfig.group_by.toLowerCase() : null;

    // Step 1: Initial Data Preparation (Parsing Dates and numbers)
    const processedRawData = rawData.map(row => {
        const newRow = {};
        for (const key in row) {
            const schemaCol = datasetSchema.dataset.columns.find(c => c.name.toLowerCase() === key.toLowerCase());
            if (schemaCol) {
                // Parse date fields using new Date(value) when xType === "time".
                // Assuming 'object' type columns might be dates, and if used as x-axis, treat as time.
                if (schemaCol.type === 'object' && key.toLowerCase() === xFeature) {
                    try {
                        const dateValue = new Date(row[key]);
                        if (!isNaN(dateValue.getTime())) { // Check if it's a valid date
                            newRow[key.toLowerCase()] = dateValue;
                        } else {
                            newRow[key.toLowerCase()] = row[key]; // Fallback if not a valid date
                        }
                    } catch (e) {
                        newRow[key.toLowerCase()] = row[key]; // Fallback on error
                    }
                } else if (schemaCol.type === 'int64' || schemaCol.type === 'float64') {
                    newRow[key.toLowerCase()] = parseFloat(row[key]);
                } else {
                    newRow[key.toLowerCase()] = row[key];
                }
            } else {
                newRow[key.toLowerCase()] = row[key]; // Keep other columns as is
            }
        }
        return newRow;
    });

    // For scatter plots, no aggregation is needed, just map the raw data
    if (graphConfig.graph_type === 'scatter') {
        return processedRawData.map(item => ({
            [xFeature]: item[xFeature],
            [yFeature]: item[yFeature]
        }));
    }

    // Step 2: Aggregation & Grouping for bar charts
    const groupedData = {};

    processedRawData.forEach(item => {
        const xValue = item[xFeature];
        if (xValue === undefined || xValue === null) return; // Skip items with no x-value

        // Handle date objects for grouping keys by converting to ISO string
        const keyXValue = xValue instanceof Date ? xValue.toISOString() : xValue;

        if (groupByFeature) {
            const groupValue = item[groupByFeature];
            if (groupValue === undefined || groupValue === null) return;

            if (!groupedData[keyXValue]) {
                groupedData[keyXValue] = {};
            }
            if (!groupedData[keyXValue][groupValue]) {
                groupedData[keyXValue][groupValue] = [];
            }
            groupedData[keyXValue][groupValue].push(item);
        } else {
            if (!groupedData[keyXValue]) {
                groupedData[keyXValue] = [];
            }
            groupedData[keyXValue].push(item);
        }
    });

    const result = [];

    for (const keyXValue in groupedData) {
        const entry = { [xFeature]: keyXValue }; // Use the string key for grouping

        if (groupByFeature) {
            for (const groupValue in groupedData[keyXValue]) {
                const aggregatedValue = aggregate(groupedData[keyXValue][groupValue], yFeature, aggregationType);
                entry[groupValue] = aggregatedValue;
            }
        } else {
            const aggregatedValue = aggregate(groupedData[keyXValue], yFeature, aggregationType);
            entry[yFeature] = aggregatedValue;
        }
        result.push(entry);
    }

    // If xFeature was a Date object, convert back for Recharts XAxis to handle date formatting
    if (processedRawData.length > 0 && processedRawData[0][xFeature] instanceof Date) {
        return result.map(item => ({
            ...item,
            [xFeature]: new Date(item[xFeature]) // Convert back to Date object
        }));
    }

    return result;
};

/**
 * Custom Tooltip component for Recharts to display formatted values.
 */
const CustomTooltip = ({ active, payload, label, xFeatureLabel, yFeatureLabel, groupByFeature }) => {
    if (active && payload && payload.length) {
        const xValue = label instanceof Date ? label.toLocaleDateString() : label;
        return (
            <div style={{
                backgroundColor: '#fff',
                border: '1px solid #ccc',
                padding: '10px',
                borderRadius: '4px',
                boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
            }}>
                <p style={{ margin: 0, fontWeight: 'bold' }}>{xFeatureLabel}: {xValue}</p>
                {payload.map((entry, index) => (
                    <p key={`item-${index}`} style={{ color: entry.color, margin: '5px 0 0 0' }}>
                        {entry.name}: {entry.value !== undefined ? entry.value.toLocaleString() : 'N/A'}
                    </p>
                ))}
            </div>
        );
    }
    return null;
};

// List of supported graph types from the DASHBOARD_SPEC
const SUPPORTED_GRAPH_TYPES = ['bar', 'stacked_bar', 'scatter'];

// --- Main Component ---
const AutoVizDashboard = () => {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    /**
     * Fetches data from the specified endpoint.
     */
    const fetchData = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(DATA_ENDPOINT);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            const result = await response.json();
            console.log("Fetched data:", result);
            setData(result);
        } catch (e) {
            console.error("Failed to fetch data:", e);
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    // Effect hook for initial data fetch and polling
    useEffect(() => {
        fetchData(); // Initial fetch

        const intervalId = setInterval(fetchData, POLLING_INTERVAL_MS);

        return () => clearInterval(intervalId); // Cleanup on unmount
    }, []);

    // Memoize processed data for all graphs to avoid re-processing on every render
    const processedGraphsData = useMemo(() => {
        if (!data) return [];
        return DASHBOARD_SPEC.graphs.map(graphConfig => {
            if (!SUPPORTED_GRAPH_TYPES.includes(graphConfig.graph_type)) {
                console.warn(`Unsupported graph type: ${graphConfig.graph_type}. Skipping graph: ${graphConfig.title}`);
                return { ...graphConfig, processedData: [], error: `Unsupported graph type: ${graphConfig.graph_type}` };
            }
            try {
                const processedData = processDataForGraph(data, graphConfig, DATASET_SCHEMA);
                return { ...graphConfig, processedData };
            } catch (e) {
                console.error(`Error processing data for graph "${graphConfig.title}":`, e);
                return { ...graphConfig, processedData: [], error: e.message };
            }
        });
    }, [data]);

    if (loading) {
        return <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>Loading dashboard data...</div>;
    }

    if (error) {
        return <div style={{ padding: '20px', textAlign: 'center', color: 'red', fontSize: '1.2em' }}>Error: {error}. Please check the data endpoint.</div>;
    }

    if (!data || data.length === 0) {
        return <div style={{ padding: '20px', textAlign: 'center', fontSize: '1.2em' }}>No data available to display.</div>;
    }

    /**
     * Renders a single graph based on its configuration.
     * @param {Object} graphConfig - The configuration for the graph.
     * @param {number} index - The index of the graph in the list.
     * @returns {JSX.Element} The rendered graph component or an error/empty state.
     */
    const renderGraph = (graphConfig, index) => {
        const { title, graph_type, x_axis, y_axis, group_by, processedData, error: graphError } = graphConfig;
        const xFeature = x_axis.feature.toLowerCase();
        const yFeature = y_axis.feature.toLowerCase();
        const groupByFeature = group_by ? group_by.toLowerCase() : null;

        if (graphError) {
            return (
                <div key={index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', backgroundColor: '#fdd' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h3>
                    <p style={{ color: 'red', textAlign: 'center' }}>Error rendering graph: {graphError}</p>
                </div>
            );
        }

        if (!processedData || processedData.length === 0) {
            return (
                <div key={index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', minHeight: '300px', backgroundColor: '#f9f9f9' }}>
                    <h3 style={{ margin: '0 0 10px 0', color: '#333' }}>{title}</h3>
                    <p style={{ color: '#666', textAlign: 'center' }}>No data available for this graph.</p>
                </div>
            );
        }

        // A set of distinct colors for chart elements
        const colors = ['#8884d8', '#82ca9d', '#ffc658', '#d0ed57', '#a4de6c', '#8dd1e1', '#ff8042', '#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

        const commonChartProps = {
            data: processedData,
            margin: { top: 20, right: 30, left: 20, bottom: 5 },
        };

        // Custom tick formatter for XAxis, especially for Date objects
        const xAxisTickFormatter = (value) => {
            if (value instanceof Date) {
                return value.toLocaleDateString(); // Format date for display
            }
            return value;
        };

        // Renders Bar components for bar and stacked bar charts
        const renderBars = () => {
            if (groupByFeature) {
                // For stacked bar, get all unique group values to render multiple bars
                // This assumes that all possible group values are present in at least one data point
                const allGroupValues = Array.from(new Set(processedData.flatMap(item =>
                    Object.keys(item).filter(key => key !== xFeature && key !== yFeature)
                )));
                return allGroupValues.map((groupKey, i) => (
                    <Bar key={groupKey} dataKey={groupKey} stackId="a" fill={colors[i % colors.length]} name={groupKey} />
                ));
            } else {
                return <Bar dataKey={yFeature} fill={colors[0]} name={y_axis.label} />;
            }
        };

        const renderChart = () => {
            switch (graph_type) {
                case 'bar':
                case 'stacked_bar':
                    return (
                        <BarChart {...commonChartProps}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey={xFeature} label={{ value: x_axis.label, position: 'insideBottom', offset: -5 }} tickFormatter={xAxisTickFormatter} />
                            <YAxis label={{ value: y_axis.label, angle: -90, position: 'insideLeft' }} />
                            <Tooltip content={<CustomTooltip xFeatureLabel={x_axis.label} yFeatureLabel={y_axis.label} groupByFeature={groupByFeature} />} />
                            <Legend />
                            {renderBars()}
                        </BarChart>
                    );
                case 'scatter':
                    const trendlineData = graphConfig.additional_params.show_trendline ? calculateLinearRegression(processedData, xFeature, yFeature) : [];
                    return (
                        <ScatterChart {...commonChartProps}>
                            <CartesianGrid />
                            <XAxis type="number" dataKey={xFeature} name={x_axis.label} label={{ value: x_axis.label, position: 'insideBottom', offset: -5 }} />
                            <YAxis type="number" dataKey={yFeature} name={y_axis.label} label={{ value: y_axis.label, angle: -90, position: 'insideLeft' }} />
                            <Tooltip cursor={{ strokeDasharray: '3 3' }} content={<CustomTooltip xFeatureLabel={x_axis.label} yFeatureLabel={y_axis.label} />} />
                            <Legend />
                            <Scatter name={y_axis.label} dataKey={yFeature} fill={colors[0]} />
                            {graphConfig.additional_params.show_trendline && trendlineData.length > 0 && (
                                <Line
                                    data={trendlineData}
                                    dataKey={yFeature}
                                    stroke="#ff7300"
                                    dot={false}
                                    activeDot={false}
                                    legendType="none" // Hide trendline from legend
                                    name="Trendline"
                                />
                            )}
                        </ScatterChart>
                    );
                default:
                    return <p style={{ color: 'orange' }}>Unsupported graph type: {graph_type}</p>;
            }
        };

        return (
            <div key={index} style={{ border: '1px solid #eee', padding: '15px', borderRadius: '8px', display: 'flex', flexDirection: 'column', minHeight: '300px', backgroundColor: '#fff' }}>
                <h3 style={{ margin: '0 0 10px 0', color: '#333', textAlign: 'center' }}>{title}</h3>
                <ResponsiveContainer width="100%" height={300}>
                    {renderChart()}
                </ResponsiveContainer>
            </div>
        );
    };

    return (
        <div style={{ fontFamily: 'Arial, sans-serif', padding: '20px', backgroundColor: '#f0f2f5' }}>
            <h1 style={{ textAlign: 'center', color: '#333', marginBottom: '30px' }}>AutoViz Dashboard</h1>
            <div style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', // Responsive grid, min 350px wide, up to 3 columns
                gap: '20px',
                maxWidth: '1200px', // Max width for the grid container
                margin: '0 auto' // Center the grid
            }}>
                {processedGraphsData.map(renderGraph)}
            </div>
        </div>
    );
};

export default AutoVizDashboard;