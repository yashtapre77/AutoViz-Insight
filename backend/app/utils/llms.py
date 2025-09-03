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
    google_api_key="AIzaSyAjR1juQNpAwtyBen79_rbu4zk2LZu4xfE"
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
            "description": "<string> What this graph shows>",
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

    return parsed




async def generate_dashboard(dataset_schema: dict, graph_suggestions: dict, llm):
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
            "You are a senior front-end engineer. Generate a single React component "
            "that directly runs in the browser (no server code)."
        ),
        (
            "human",
            """Constraints:
            - Use React + Recharts only (no other chart libs).
            - The component must fetch data from the dataset endpoint and re-fetch every {refresh_ms} ms.
            - Parse date fields using new Date(value) when xType === "time".
            - Aggregate as specified in each graph config (sum, count, avg supported).
            - Render all graphs responsively in a neat grid i.e. 2x3. (there are 6 graphs so 2 rows x 3 cols).
            - Include legend, tooltip, axes labels, and graceful empty/error states.
            - Do not include any extra commentary. Output ONLY valid React code.

            Inputs:
            DATASET SCHEMA (JSON):
            {dataset_schema}

            DASHBOARD SPEC (JSON):
            {dashboard_spec}

            Requirements:
            - Export default a React component named AutoVizDashboard.
            - Props: none. Endpoint is read from the JSON above.
            - Use fetch in useEffect with cleanup. Use setInterval for polling.
            - Validate graph types against the allowed list and skip unsupported safely.
            - For stacked_bar: use <Bar> with <Legend> and <Tooltip>, and multiple stacks via “stackId”.
            - For histogram: bucket the field into N bins and render as a BarChart.
            - Keep styles clean and modern. Use CSS-in-JS utilities inline (simple flex/grid is fine).
            - Provide helper utilities inside the same file (groupBy, aggregate, binning).
            - Use Recharts components: {charts_list}"""
        )
    ])

    chain = prompt_dashboard_generation | llm

    response = await chain.ainvoke({
        "dataset_schema": dataset_schema,
        "dashboard_spec": graph_suggestions,
        "refresh_ms": 100000,
        "charts_list": ", ".join(charts_list)
    })

    # LangChain responses may come back as `AIMessage`, not plain dict
    raw_text = getattr(response, "content", str(response))

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
