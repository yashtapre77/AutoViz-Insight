from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
import pandas as pd
# from app.core.config import settings

# Initialize Gemini model
llm = ChatGoogleGenerativeAI(
    model="gemini-2.5-flash",   
    temperature=0,
    google_api_key="AIzaSyAjR1juQNpAwtyBen79_rbu4zk2LZu4xfE"
)


prompt = ChatPromptTemplate.from_messages([
    ("system", 
     "You are a data analyst. Based on column samples, classify the column type."),
    ("human", 
     "Column name: {col_name}\n"
     "Sample values: {samples}\n\n"
     "Possible types: numeric, categorical, datetime, boolean, text, ID/code.\n"
     "Which type best fits? Reply with only the type.")
])


def infer_column_type_llm(col_name, series: pd.Series, llm):
    samples = series.dropna().astype(str).unique()[:10].tolist()
    if not samples:
        return "unknown"

    chain = prompt | llm
    response = chain.invoke({
        "col_name": col_name,
        "samples": samples
    })
    return response.content.strip().lower()
