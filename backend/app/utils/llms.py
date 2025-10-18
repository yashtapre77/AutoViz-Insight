from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
import pandas as pd
import json
import re
from app.core.config import settings

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",   
    temperature=0,
    google_api_key=settings.GOOGLE_API_KEY_FLASH
)

charts_list = [
    "bar chart(rows)", "bar chart(columns)", "bar chart(side by side)", "stacked bar chart", 
    "bubble chart", "scatter chart", "line chart", "dual line chart", "bar and line chart", 
    "pie chart", "donut chart", "full stacked bar chart",
    "box plot", "area chart", "Radar chart"
]


def infer_column_type_llm(col_name, series: pd.Series, llm):
    prompt_data_cleaning = ChatPromptTemplate.from_messages([
        ("system", 
        "You are a data analyst. Based on column samples, classify the column type."),
        ("human", 
        "Column name: {col_name}\n"
        "Sample values: {samples}\n\n"
        "Possible types: numeric, categorical, datetime, boolean, text, ID/code.\n"
        "Which type best fits? Reply with only the type.")
    ])
    samples = series.dropna().astype(str).unique()[:10].tolist()
    if not samples:
        return "unknown"

    chain = prompt_data_cleaning | llm
    response = chain.invoke({
        "col_name": col_name,
        "samples": samples
    })

    print("Inferred column type response:")
    return response.content.strip().lower()




async def get_graphs_suggestions_llm(col_names, user_query, llm, charts_list=charts_list):
    prompt_graph_suggestions = ChatPromptTemplate.from_messages([
        ("system", 
         "You are a data visualization expert. Based on the dataset columns and user query, "
         "suggest the most relevant types of graphs to visualize the data."),
        ("human", 
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
            """
        )
    ])

    chain = prompt_graph_suggestions | llm
    response = await chain.ainvoke({
        "col_names": ", ".join(col_names),
        "user_query": user_query,
        "charts_list": ", ".join(charts_list)
    })

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




async def generate_dashboard(dataset_schema: dict, graph_suggestions: dict, llm, requirement_id):
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

    prompt_dashboard_generation = ChatPromptTemplate.from_messages([
    (
        "system",
        "You are a senior front-end engineer and expert in React and Recharts. "
        "Your job is to generate clean, production-ready React code that runs directly in the browser. "
        "Do not include markdown formatting, explanations, or comments — only pure React code. "
        "All hooks (useState, useEffect, useMemo) must follow React's Rules of Hooks and never be called conditionally."
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
        """
        )
    ])



    chain = prompt_dashboard_generation | llm

    dataset_endpoint = "http://127.0.0.1:8000/api/analysis/dataset/"+str(requirement_id) # Placeholder

    response = await chain.ainvoke({
        "dataset_schema": dataset_schema,
        "dashboard_spec": graph_suggestions,
        "refresh_ms": 100000,
        "charts_list": ", ".join(charts_list),
        "dataset_endpoint": dataset_endpoint
    })

    # LangChain responses may come back as `AIMessage`, not plain dict
    raw_text = getattr(response, "content", str(response))
    print("Generated dashboard code length:", len(raw_text))
    return raw_text
    

def tableau_file_generation():
    pass


if __name__ == "__main__":
    cols = ["Date", "Region", "Product", "Sales", "Profit", "Quantity", "Discount"]
    query = "I want to analyze how sales performance varies across regions and products, and see if discounts affect profitability."
    import asyncio
    output = asyncio.run(get_graphs_suggestions_llm(col_names=cols, user_query=query, llm=llm))
    # print(json.dumps(output, indent=2))
    print(output)
