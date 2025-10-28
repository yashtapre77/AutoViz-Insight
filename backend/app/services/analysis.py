from app.db.session import get_db
from sqlalchemy.ext.asyncio import AsyncSession
from app.utils.data_cleaning import clean_pipeline
from app.services.transaction import TransactionService
from app.utils.llms import llm, get_graphs_suggestions_llm, generate_dashboard, generate_graphs_dashboard
import pandas as pd


class AnalysisService:
    def __init__(self, db: AsyncSession):
        self.db = db
        self.transaction_service = TransactionService(db)
    
    async def perform_analysis(self, *, requirement_id: str = None):
        # fetch transaction details
        transaction = await self.transaction_service.get_transaction(requirement_id)
        file_path = transaction.file_path

        # perform data cleaning
        cleaned_df = clean_pipeline(file_path)
        cols = cleaned_df.columns.tolist()
        user_query = transaction.user_query

        # get graph suggestions from LLM
        graphs_to_plot = await get_graphs_suggestions_llm(col_names=cols, user_query=user_query, llm=llm)

        # get dataset schema
        columns = []
        df = pd.read_csv(file_path, nrows=5)

        for col in df.columns:
            columns.append({
                "name": col,
                "type": str(df[col].dtype)})
            
        output = {
            "dataset":{
                "endpoint": "https://api.example.com/data/sales",
                "method": "GET",
                "columns": columns
            }
        }

        
        code = await generate_dashboard(dataset_schema=output, graph_suggestions=graphs_to_plot, llm=llm, requirement_id=requirement_id)

        # Store analysis result in DB
        analysis_result = await self.transaction_service.create_analysis_result(
            transaction_id=requirement_id,
            graph_suggestions=graphs_to_plot,
            dashboard_code=code
        )

        return analysis_result
        


    async def generate_dashboard_code(self, *, requirement_id: str = None):
        transaction = await self.transaction_service.get_transaction(requirement_id)
        file_path = transaction.file_path

        # perform data cleaning
        cleaned_df = clean_pipeline(file_path)
        cols = cleaned_df.columns.tolist()
        user_query = transaction.user_query

        columns = ""
        df = pd.read_csv(file_path, nrows=5)

        for col in df.columns:
            columns += f"{col} ({str(df[col].dtype)}), "


        code = await generate_graphs_dashboard(
            column_info=columns,
            user_query=user_query,
            data_preview=df.head(1).to_dict(orient="records"),
            requirement_id=requirement_id,
            llm=llm
        )

        analysis_result = await self.transaction_service.create_analysis_dashboard(
            transaction_id=requirement_id,
            dashboard_code=code
        )

        return analysis_result
        

    def get_tableau_file(self, *, file_path:str):
        pass