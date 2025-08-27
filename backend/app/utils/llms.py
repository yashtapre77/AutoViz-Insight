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
        "Suggest at least 6 graph types (choose only from: bar chart(rows), bar chart(columns), bar chart(side by side), stacked bar chart, lollipop chart, bubble chart, scatter plot, line chart, sparkline chart, circle (bubble) timeline, quadrant chart, dual line chart, bar and line chart, butterfly (tornado) chart, histogram, funnel chart, bump chart, dot plot, barbell chart, pie chart, donut chart, full stacked bar chart, treemap, waterfall chart, box plot, heatmap, area chart).\n"
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
        "user_query": user_query
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

def generate_dashboard(df: pd.DataFrame, graph_suggestions: dict):
    prompt_dashboard = ChatPromptTemplate.from_messages([
        ("system", 
        "You are a tableau expert. Based on the dataset columns and graph suggestions, generate a tableau dashboard file."),
        ("human", 
        "Column names: {col_names}\n"
        "Graph suggestions: {graph_suggestions}\n\n"
        "Generate a tableau dashboard file that includes all the suggested graphs.\n"
        "Return ONLY the tableau file content as a base64 encoded string.")
    ])
    

def tableau_file_generation():
    pass


if __name__ == "__main__":
    cols = ["Date", "Region", "Product", "Sales", "Profit", "Quantity", "Discount"]
    query = "I want to analyze how sales performance varies across regions and products, and see if discounts affect profitability."
    
    output = get_graphs_suggestions_llm(col_names=cols, user_query=query, llm=llm)
    # print(json.dumps(output, indent=2))
    print(output)
