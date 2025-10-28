from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
import pandas as pd
import json
import re
# from app.core.config import settings

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",
    temperature=0,
    # google_api_key=settings.GOOGLE_API_KEY_FLASH,
    google_api_key="AIzaSyBrKYD0SugwmDRtZyTvuYK4u1fgbAY7rPM",
)

charts_list = [
    "bar chart(rows)",
    "bar chart(columns)",
    "bar chart(side by side)",
    "stacked bar chart",
    "bubble chart",
    "scatter chart",
    "line chart",
    "dual line chart",
    "bar and line chart",
    "pie chart",
    "donut chart",
    "full stacked bar chart",
    "box plot",
    "area chart",
    "Radar chart",
]


def infer_column_type_llm(col_name, series: pd.Series, llm):
    prompt_data_cleaning = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a data analyst. Based on column samples, classify the column type.",
            ),
            (
                "human",
                "Column name: {col_name}\n"
                "Sample values: {samples}\n\n"
                "Possible types: numeric, categorical, datetime, boolean, text, ID/code.\n"
                "Which type best fits? Reply with only the type.",
            ),
        ]
    )
    samples = series.dropna().astype(str).unique()[:10].tolist()
    if not samples:
        return "unknown"

    chain = prompt_data_cleaning | llm
    response = chain.invoke({"col_name": col_name, "samples": samples})

    print("Inferred column type response:")
    return response.content.strip().lower()


async def get_graphs_suggestions_llm(
    col_names, user_query, llm, charts_list=charts_list
):
    prompt_graph_suggestions = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a data visualization expert. Based on the dataset columns and user query, "
                "suggest the most relevant types of graphs to visualize the data.",
            ),
            (
                "human",
                "Column names: {col_names}\n"
                "User query: {user_query}\n\n"
                "Suggest exactly 6 graph types (choose only from: {charts_list}).\n"
                "All the Graphs should be able to be plotted in a single dashboard.\n\n"
                """When generating the list of graphs, return them strictly in JSON format. 
            For each graph, specify ALL details required to plot it. Use the following schema for each graph object:

            {{
            "title": "<string> Title of the graph>",
            "graph_type": "<string> (bar, line, scatter, histogram, pie, stacked_bar, heatmap, etc.)",
            "x_axis": {{
                "feature": "<string: column name from dataset>",
                "aggregation": "<string: sum, avg, count, min, max, none>",
                "bin_size": "<integer or null, required only for histogram or binned data>",
                "label": "<string label to display>"
            }},
            "y_axis": {{
                "feature": "<string: column name from dataset>",
                "aggregation": "<string: sum, avg, count, min, max, none>",
                "label": "<string label to display>"
            }},
            "group_by": "<string or null: feature to group data by>",
            "filters": [
                {{ "feature": "<string>", "condition": "<e.g., >, <, =>", "value": "<value>" }}
            ],
            "color_scheme": "<string or null: e.g., category10, viridis, etc.>",
            "additional_params": {{
                "stacked": "<true/false, for bar charts>",
                "normalized": "<true/false, for percentages>",
                "show_trendline": "<true/false, for scatter/line>",
                "bins": "<integer, for histograms>"
            }}
            }}

            Always make sure that:
            1. The 'feature' values match dataset column names exactly.
            2. Include 'aggregation' even if it's 'none'.
            3. Provide bin_size only when graph_type = histogram or when binning is required.
            4. Return an array of such graph objects under the key 'graphs'.
            """,
            ),
        ]
    )

    chain = prompt_graph_suggestions | llm
    response = await chain.ainvoke(
        {
            "col_names": ", ".join(col_names),
            "user_query": user_query,
            "charts_list": ", ".join(charts_list),
        }
    )

    # Extract text depending on LLM wrapper
    raw_text = response.content if hasattr(response, "content") else str(response)

    # Try parsing JSON safely
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        json_str = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_str:
            parsed = json.loads(json_str.group())
        else:
            raise ValueError("LLM did not return valid JSON:\n" + raw_text)
    print("Graph suggestions completed")
    return parsed


async def generate_dashboard(
    dataset_schema: dict, graph_suggestions: dict, llm, requirement_id
):
    """
    create dataset schema object in json format
    create graphs list object in json format
    create prompt object specify all requirements
    call llm with prompt
    parse llm response to get dashboard code
    link dashboard code to dataset
    setup inference function to run the dashboard code
    return dashboard inference function
    """

    prompt_dashboard_generation = ChatPromptTemplate.from_messages(
        [
            (
                "system",
                "You are a senior front-end engineer and expert in React and Recharts. "
                "Your job is to generate clean, production-ready React code that runs directly in the browser. "
                "Do not include markdown formatting, explanations, or comments — only pure React code. "
                "All hooks (useState, useEffect, useMemo) must follow React's Rules of Hooks and never be called conditionally.",
            ),
            (
                "human",
                """Generate a **single complete React component** that visualizes data as per the specifications below.

        ### Requirements:
        - Must use **React (with hooks)** and **Recharts** only. No other libraries or frameworks.
        - The component must:
        1. Fetch data from the dataset endpoint: **{dataset_endpoint}**
        2. Automatically re-fetch every **{refresh_ms} ms** using `setInterval` inside `useEffect`.
        3. Handle **loading**, **empty**, and **error** states gracefully without breaking the layout.
        4. Parse date/time fields with `new Date(value)` when `xType === "time"`.
        5. Safely handle missing or malformed data (ignore charts that cannot be rendered).
        6. Dynamically render **exactly 6 charts** in a **2x3 responsive grid** layout.
        7. Include **legend**, **tooltip**, **axis labels**, and **responsive container**.
        8. Use a minimal, modern design with consistent margins and font sizes.
        - For `stacked_bar`, render multiple `<Bar>` components using the same `stackId`.
        - For `histogram`, include a helper function that bins values into N buckets.
        - Implement helper functions inside the same file:
        - `groupBy`
        - `aggregate`
        - `binData`
        - Use `useMemo` only for expensive computations like data aggregation or binning — never conditionally.
        - All hooks (`useState`, `useEffect`, `useMemo`) must be **declared at the top level of the component**, never inside `if`, `for`, or `map` blocks.
        - Wrap dynamic rendering logic in plain JavaScript conditions **after** hooks are declared.
        - The component must recover safely from runtime errors (using try/catch around data parsing or chart generation).
        - Use `useEffect` cleanup for the interval timer.

        ### Technical Constraints:
        - Do not wrap code inside markdown (no ```jsx or ``` blocks).
        - Do not include any textual explanations or comments.
        - Output must be **pure JavaScript/React code**, ready to run.
        - Escape all backslashes and quotes properly to ensure valid JSON text.
        - Ensure all JSX props use **double quotes ("")**.
        - Do not use `eval`, `Function()`, or dynamic imports.
        - Use consistent indentation and line breaks.

        ### Inputs:
        - **DATASET SCHEMA (JSON):**
        {dataset_schema}

        - **DASHBOARD SPEC (JSON):**
        {dashboard_spec}

        - **Allowed Chart Types:** {charts_list}

        The generated component must dynamically adapt to the dataset schema and dashboard specification, while strictly following React's Rules of Hooks and ensuring stable hook ordering across renders.

        Export the component as the **default export** named `AutoVizDashboard`.
        """,
            ),
        ]
    )

    chain = prompt_dashboard_generation | llm

    dataset_endpoint = "http://127.0.0.1:8000/api/analysis/dataset/" + str(
        requirement_id
    )  # Placeholder

    response = await chain.ainvoke(
        {
            "dataset_schema": dataset_schema,
            "dashboard_spec": graph_suggestions,
            "refresh_ms": 100000,
            "charts_list": ", ".join(charts_list),
            "dataset_endpoint": dataset_endpoint,
        }
    )

    # LangChain responses may come back as `AIMessage`, not plain dict
    raw_text = getattr(response, "content", str(response))
    print("Generated dashboard code length:", len(raw_text))
    return raw_text


def tableau_file_generation():
    pass


async def generate_graphs_dashboard(column_info: str, user_query: str, data_preview: str, api_endpoint: str):

    dashboard_generation_prompt = ChatPromptTemplate.from_messages([
        (
            "system", """ 
            1. NO explanations, NO comments
            2. All code must be valid, executable JavaScript ready to run immediately
            3. Escape all strings properly for JSON compatibility (escape backslashes and quotes)
            4. Use double quotes ("") for ALL JSX attributes
            5. Follow React Rules of Hooks strictly - ALL hooks must be declared at component top level
            6. Never use hooks conditionally or inside loops, map functions, or if statements
            7. Include comprehensive error handling with try-catch blocks
            8. Ensure cleanup for useEffect timers and intervals

            REACT HOOKS REQUIREMENTS:
            - Declare ALL hooks (useState, useEffect, useMemo) at the TOP of the component before ANY conditional logic
            - NEVER call hooks inside conditions, loops, or nested functions
            - Use useMemo ONLY for expensive computations (data aggregation, binning) - never conditionally
            - Place conditional rendering logic AFTER all hook declarations using plain JavaScript
            - Example of CORRECT pattern:
            const [data, setData] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);
            // ... all other hooks here first
            // THEN conditional logic below

            ERROR PREVENTION REQUIREMENTS:
            - Wrap all data fetching in try-catch blocks with proper error states
            - Validate data structure before rendering charts
            - Provide fallback empty arrays/objects for undefined data
            - Handle null/undefined values in data transformations
            - Include loading states for asynchronous operations
            - Use optional chaining (?.) for nested object access
            - Implement cleanup functions in useEffect for intervals/timeouts
            - Recover gracefully from runtime errors without crashing

            TECHNICAL CONSTRAINTS:
            - No eval(), Function(), or dynamic imports
            - No markdown code blocks or triple backticks
            - No textual explanations before or after code
            - Consistent indentation (2 spaces)
            - All strings must be properly escaped for JSON transmission
            - Component must be a single default export"""
        ),
        (
            "user",
            """
            Generate a complete React dashboard component based on the following specifications:
            DATASET INFORMATION:
            Column Names and Types: {column_info}
            User Analysis Query: {user_query}
            Sample Data Preview: {data_preview}
            Data Fetch Endpoint: {api_endpoint}

            DASHBOARD REQUIREMENTS:

            1. GRAPH ANALYSIS:
            - Analyze the columns and user query to identify EXACTLY 6 best graphs for visualization
            - For each graph specify:
                * Graph type from recharts (BarChart, LineChart, AreaChart, PieChart, ScatterChart, RadarChart, ComposedChart)
                * Which columns map to X-axis, Y-axis, and any additional data keys
                * Any required data transformations or aggregations
                * Appropriate chart configuration (colors, labels, tooltips)
            
            2. KPI IDENTIFICATION:
            - Identify 2-4 Key Performance Indicators relevant to the user query
            - For each KPI provide:
                * Clear metric name and description
                * Exact calculation formula based on available columns
                * Formatting (percentage, currency, number with units)
                * Visual representation (card with icon, color-coded status)

            3. COMPONENT STRUCTURE:
            - Single functional React component with default export
            - Import statements: React hooks, recharts components, fetch for data
            - All hooks declared at top level before any conditional logic
            - State management for: data, loading, error, processedData
            - useEffect for data fetching from {api_endpoint}
            - Data processing and transformation logic
            - Responsive layout using Tailwind CSS

            4. LAYOUT REQUIREMENTS:
            - Display 2-4 KPI cards at the top in a responsive grid
            - Below KPIs, display exactly 6 graphs in a 2x3 responsive grid
            - Use Tailwind CSS classes: grid, grid-cols-1, md:grid-cols-2, lg:grid-cols-3, gap-4
            - Ensure mobile responsiveness (stack on small screens)
            - Each graph wrapped in ResponsiveContainer from recharts
            - Consistent padding, margins, and spacing

            5. RECHARTS CONFIGURATION:
            - Import ResponsiveContainer, XAxis, YAxis, CartesianGrid, Tooltip, Legend
            - Each chart must include:
                * ResponsiveContainer with width="100%" and height="300"
                * Proper axis labels with readable fontSize
                * Tooltip for data point details
                * Legend where applicable
                * CartesianGrid with strokeDasharray="3 3" for readability
                * Appropriate colors using Tailwind color palette
            - Apply data transformations/aggregations as needed for each chart

            6. DATA FETCHING PATTERN:
                
            const [data, setData] = useState([]);
            const [loading, setLoading] = useState(true);
            const [error, setError] = useState(null);

            useEffect(() => {{
            let isMounted = true;
            const fetchData = async () => {{
            try {{
            const response = await fetch('{api_endpoint}');
            if (!response.ok) throw new Error('Failed to fetch data');
            const result = await response.json();
            if (isMounted) {{
            setData(Array.isArray(result) ? result : []);
            setLoading(false);
            }}
            }} catch (err) {{
            if (isMounted) {{
            setError(err.message);
            setLoading(false);
            }}
            }}
            }};
            fetchData();
            return () => {{ isMounted = false; }};
            }}, []);
                
                
            7. DESIGN REQUIREMENTS:
            - Modern, clean, professional aesthetic
            - Consistent color scheme using Tailwind CSS utilities
            - Clear typography hierarchy (text-xl, text-lg, text-sm)
            - Card-based layout with shadows and rounded corners
            - Proper spacing between elements (p-4, p-6, gap-4, gap-6)
            - Loading skeleton or spinner during data fetch
            - Error message display with retry option
            - Smooth transitions and hover effects where appropriate

            8. SPECIFIC ANTI-PATTERNS TO AVOID:
            ❌ const someVar = useMemo(() => condition ? value : null, [deps]); // WRONG - conditional in useMemo
            ✅ const someVar = useMemo(() => {{ return expensiveComputation(data); }}, [data]); // CORRECT

            ❌ if (condition) {{ useState(value); }} // WRONG - conditional hook
            ✅ const [value, setValue] = useState(initial); if (condition) {{ setValue(newValue); }} // CORRECT

            ❌ data.map(item => {{ const [state] = useState(); }}) // WRONG - hook in loop
            ✅ const [state] = useState(); const rendered = data.map(item => ...) // CORRECT

            IMPORTANT OUTPUT FORMAT:
            - Start directly with: import React, {{ useState, useEffect }} from "react";
            - End with: export default DashboardComponent;
            - NO explanatory text, NO markdown, NO comments
            - Pure executable JavaScript/React code only
            - Properly escaped strings for JSON transmission (use \\\\ for backslashes, \\" for quotes in strings)


            OUTPUT FORMAT RULES:
            1. Output ONLY valid JavaScript/React code
            2. NO markdown blocks (no ``````jsx)
            3. NO explanations or comments in code
            4. NO text before or after the code
            5. Start with imports, end with export default

            REACT RULES OF HOOKS (CRITICAL):
            1. All hooks MUST be at component top level
            2. Never call hooks inside: if statements, loops, map/filter, nested functions
            3. Hook call order must be identical on every render
            4. Correct pattern:
            - Declare ALL hooks first (useState, useEffect, useMemo, useCallback)
            - Then write conditional logic
            - Then return JSX

            DATA SAFETY RULES:
            1. Always check if data exists before using it
            2. Use optional chaining: data?.field
            3. Provide default values: data || []
            4. Wrap transformations in try-catch
            5. Handle loading and error states
            6. Validate data types before rendering

            GRAPH REQUIREMENTS:
            1. Identify exactly 6 graphs suitable for the dataset
            2. Each graph must use proper recharts components
            3. Include ResponsiveContainer, axes, tooltip, legend
            4. Apply aggregations if needed (sum, average, count, group by)
            5. Use appropriate chart types for data relationships

            KPI REQUIREMENTS:
            1. Identify 2-4 meaningful KPIs from the data
            2. Show clear calculations (e.g., "Total: sum(sales_amount)")
            3. Format appropriately (currency, percentage, units)
            4. Display in cards with visual hierarchy

            STYLING REQUIREMENTS:
            1. Use only Tailwind CSS utility classes
            2. Responsive grid: grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3
            3. Consistent spacing: p-4, gap-4, rounded-lg, shadow-md
            4. Professional color scheme
            5. Clear typography: font-bold, text-xl, text-gray-600

            ERROR HANDLING REQUIREMENTS:
            1. Wrap fetch in try-catch
            2. Show loading spinner during fetch
            3. Display error message if fetch fails
            4. Provide retry mechanism
            5. Graceful degradation if chart data is invalid
            6. Use error boundary pattern in useEffect cleanup
    
            Ensure:
            - No conditional hooks
            - No hooks in loops
            - Proper string escaping for JSON
            - Double quotes in JSX attributes
            - useEffect cleanup for mounted check
            - Try-catch around data operations

            Generate the complete dashboard component now:""",
            ),
        ]
    )

    
    chain = dashboard_generation_prompt | llm
    
    print("Generating dashboard code via LLM...")

    try:
        response = await chain.ainvoke({
            "column_info": column_info,
            "user_query": user_query,
            "data_preview": data_preview,
            "api_endpoint": api_endpoint
        })
            
        # Extract pure code (remove any accidental markdown if present)
        code = response.content.strip()
            
        # Remove markdown code blocks if LLM added them despite instructions
        if code.startswith("```"):
            code = code.split("```")[1]
            if code.startswith("jsx") or code.startswith("javascript"):
                code = code[code.find("\n")+1:]
            
        # Validate basic structure
        if "import React" not in code or "export default" not in code:
            raise ValueError("Generated code missing required imports or exports")
                
        return code
            
    except Exception as e:
        raise Exception(f"Dashboard generation failed: {str(e)}")
    

if __name__ == "__main__":
    cols = ["Date", "Region", "Product", "Sales", "Profit", "Quantity", "Discount"]
    query = "I want to analyze how sales performance varies across regions and products, and see if discounts affect profitability."
    import asyncio

    output = asyncio.run(
        # get_graphs_suggestions_llm(col_names=cols, user_query=query, llm=llm)
        generate_graphs_dashboard(
            column_info="Date (Date), Region (String), Product (String), Sales (Integer), Profit (Integer), Quantity (Integer), Discount (Integer)",
            user_query=query,
            data_preview='[{"Date": "2024-01-01", "Region": "North", "Product": "A", "Sales": 257, "Profit": 266, "Quantity": 42, "Discount": 10}]',
            api_endpoint="http://127.0.0.1:8000/api/analysis/dataset/17"
        )
    )
    # print(json.dumps(output, indent=2))
    print(output)
