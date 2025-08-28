from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
import pandas as pd
import json
from app.core.config import settings

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",   
    temperature=0,
    google_api_key=settings.GOOGLE_API_KEY_FLASH
)

charts_list = [
    "bar chart(rows)", "bar chart(columns)", "bar chart(side by side)", "stacked bar chart", 
    "lollipop chart", "bubble chart", "scatter plot", "line chart", "sparkline chart", 
    "circle (bubble) timeline", "quadrant chart", "dual line chart", "bar and line chart", 
    "butterfly (tornado) chart", "histogram", "funnel chart", "bump chart", "dot plot", 
    "barbell chart", "pie chart", "donut chart", "full stacked bar chart", "treemap", 
    "waterfall chart", "box plot", "heatmap", "area chart"
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



def get_graphs_suggestions_llm(col_names, user_query, llm):

    prompt_graph_suggestions = ChatPromptTemplate.from_messages([
        ("system", 
        "You are a data visualization expert. Based on the dataset columns and user query, suggest the most relevant types of graphs to visualize the data."),
        ("human", 
        "Column names: {col_names}\n"
        "User query: {user_query}\n\n"
        "Suggest at least 6 graph types (choose only from: {charts_list}).\n"
        "All the Graphs should be able to be plot in a single tableau dashboard.\n"
        "Return ONLY valid JSON with graph suggestions, where keys are graph names and values are objects containing x/y axis mapping.\n\n"
        "Example:\n"
        "{{\n"
        '  "bar chart": {{"x": "Region", "y": "Sales"}},\n'
        '  "scatter plot": {{"x": "Discount", "y": "Profit"}}\n'
        "}}"
        )
    ])
    
    chain = prompt_graph_suggestions | llm
    response = chain.invoke({
        "col_names": ", ".join(col_names),
        "user_query": user_query,
        "charts_list": ", ".join(charts_list)
    })
    # Extract text depending on LLM wrapper
    if hasattr(response, "content"):  
        raw_text = response.content
    else:
        raw_text = str(response)
    
    # Try parsing JSON safely
    try:
        parsed = json.loads(raw_text)
    except json.JSONDecodeError:
        # fallback: extract JSON substring manually
        import re
        json_str = re.search(r"\{.*\}", raw_text, re.DOTALL)
        if json_str:
            parsed = json.loads(json_str.group())
        else:
            raise ValueError("LLM did not return valid JSON:\n" + raw_text)

    return parsed

def generate_dashboard(dataset_schema: dict, graph_suggestions: dict):
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

    prompt_dashboard_generation = ChatPromptTemplate.from_messages("""
        You are a senior front-end engineer. Generate a single React component that directly runs in the browser (no server code). 

        Constraints:
        - Use React + Recharts only (no other chart libs).
        - The component must fetch data from the dataset endpoint and re-fetch every {refresh_ms} ms.
        - Parse date fields using new Date(value) when xType === "time".
        - Aggregate as specified in each graph config (sum, count, avg supported).
        - Render all graphs responsively in a neat grid.
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
        - Use Recharts components: {charts_list}

    """)

    chain = prompt_dashboard_generation | llm
    response = chain.invoke({
        "dataset_schema": dataset_schema, 
        "dashboard_spec": graph_suggestions,
        "refresh_ms": 30000,
        "charts_list": ", ".join(charts_list)
    })


    if hasattr(response, "content"):  
        raw_text = response.content 
    
    return raw_text
    

def tableau_file_generation():
    pass


if __name__ == "__main__":
    cols = ["Date", "Region", "Product", "Sales", "Profit", "Quantity", "Discount"]
    query = "I want to analyze how sales performance varies across regions and products, and see if discounts affect profitability."
    
    output = get_graphs_suggestions_llm(col_names=cols, user_query=query, llm=llm)
    # print(json.dumps(output, indent=2))
    print(output)
