import pandas as pd
from app.db.session import get_db
from app.models.analysis import Analysis_Requirement

def dataset_schema(requirement_id) -> dict:
    """
    create dataset schema object in json format
    """

    columns = []

    requirement = get_db().query(Analysis_Requirement).filter(Analysis_Requirement.id == requirement_id).first()
    file_path = requirement.file_path

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

    return output