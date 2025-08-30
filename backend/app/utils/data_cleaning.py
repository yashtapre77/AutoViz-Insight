import pandas as pd
import numpy as np
from datetime import datetime
from sklearn.impute import KNNImputer
from app.utils.llms import infer_column_type_llm, llm

# -------------------------
# 1. File Handling
# -------------------------
def load_file(file_path: str) -> pd.DataFrame:
    try:
        if file_path.endswith(".csv"):
            df = pd.read_csv(file_path, encoding="utf-8", low_memory=False)
        elif file_path.endswith((".xls", ".xlsx")):
            df = pd.read_excel(file_path)
        else:
            raise ValueError("Unsupported file format")
    except UnicodeDecodeError:
        df = pd.read_csv(file_path, encoding="latin-1", low_memory=False)
    return df

# -------------------------
# 2. Data Types & Formats
# -------------------------
# def fix_data_types(df: pd.DataFrame) -> pd.DataFrame:
def fix_data_types(df: pd.DataFrame, llm) -> pd.DataFrame:
    for col in df.columns:
        
        # If dtype still object, ask Gemini
        if df[col].dtype == "object":
            col_type = infer_column_type_llm(col, df[col], llm)

            if col_type == "numeric":
                df[col] = pd.to_numeric(df[col].str.replace(r"[^\d\.\-]", "", regex=True), errors="coerce")
            elif col_type == "datetime":
                df[col] = pd.to_datetime(df[col], errors="coerce", infer_datetime_format=True)
            elif col_type == "boolean":
                df[col] = df[col].map(
                    {"yes": True, "no": False, "true": True, "false": False, "1": True, "0": False}
                )
            elif col_type in ["categorical", "id", "code"]:
                df[col] = df[col].astype("category")
            else:
                df[col] = df[col].astype(str)

    return df



# -------------------------
# 3. Missing Data
# -------------------------
def handle_missing_data(df: pd.DataFrame, threshold: float = 0.5) -> pd.DataFrame:
    """
    Handle missing values in the dataset using different strategies:
    - Drop columns if more than threshold missing.
    - Drop rows if only few rows missing (<5% overall).
    - Impute numeric with mean/median based on skewness.
    - Impute categorical with mode/constant.
    - Use forward/backward fill for datetime or time-series data.
    - KNN imputation for moderate missing values in numeric.
    """

    df = df.copy()

    # 1. Drop columns with too many nulls
    null_ratio = df.isnull().mean()
    cols_to_drop = null_ratio[null_ratio > threshold].index
    df.drop(columns=cols_to_drop, inplace=True)

    # 2. Iterate column-wise
    for col in df.columns:
        missing_ratio = df[col].isnull().mean()

        if missing_ratio == 0:  # no missing values
            continue

        # Drop rows if very few nulls (<5% of dataset)
        if missing_ratio < 0.05:
            df = df.dropna(subset=[col])
            continue

        # Numeric Columns
        if pd.api.types.is_numeric_dtype(df[col]):
            if missing_ratio < 0.2:  # small missingness
                if abs(df[col].skew()) < 1:  # normally distributed
                    df[col].fillna(df[col].mean(), inplace=True)
                else:  # skewed data
                    df[col].fillna(df[col].median(), inplace=True)
            elif missing_ratio < 0.4:  # moderate missingness
                # KNN Imputer (only on numeric subset)
                imputer = KNNImputer(n_neighbors=3)
                numeric_cols = df.select_dtypes(include=[np.number]).columns
                df[numeric_cols] = imputer.fit_transform(df[numeric_cols])
            else:
                # If still lots of missing, drop column (safety)
                df.drop(columns=[col], inplace=True)

        # Categorical Columns
        elif pd.api.types.is_categorical_dtype(df[col]) or df[col].dtype == "object":
            if missing_ratio < 0.4:
                mode_val = df[col].mode()[0] if not df[col].mode().empty else "Unknown"
                df[col].fillna(mode_val, inplace=True)
            else:
                df[col].fillna("Unknown", inplace=True)

        # Datetime Columns
        elif pd.api.types.is_datetime64_any_dtype(df[col]):
            try:
                df[col].fillna(method="ffill", inplace=True)
                df[col].fillna(method="bfill", inplace=True)
            except:
                df[col].fillna(df[col].mode()[0], inplace=True)

        # Fallback (constant value)
        else:
            df[col].fillna("Unknown", inplace=True)

    return df



# -------------------------
# 4. Duplicates
# -------------------------
def remove_duplicates(df: pd.DataFrame) -> pd.DataFrame:
    if df.duplicated().sum() > 0:
        df = df.drop_duplicates()
    return df


# -------------------------
# 5. Outliers (using IQR)
# -------------------------
def handle_outliers(df: pd.DataFrame) -> pd.DataFrame:
    numeric_cols = df.select_dtypes(include=["int64", "float64"]).columns
    for col in numeric_cols:
        Q1 = df[col].quantile(0.25)
        Q3 = df[col].quantile(0.75)
        IQR = Q3 - Q1
        lower, upper = Q1 - 1.5 * IQR, Q3 + 1.5 * IQR
        df[col] = np.where(df[col] < lower, lower,
                           np.where(df[col] > upper, upper, df[col]))
    return df


# -------------------------
# 6. Inconsistent Values
# -------------------------
def fix_inconsistent_values(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].astype(str).str.strip().str.title()
    return df


# -------------------------
# 7. Numerical Cleaning
# -------------------------
def clean_numerical(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include=["int64", "float64"]).columns:
        df[col] = df[col].replace([np.inf, -np.inf], np.nan).fillna(df[col].median())
    return df


# -------------------------
# 8. Text Cleaning
# -------------------------
def clean_text(df: pd.DataFrame) -> pd.DataFrame:
    for col in df.select_dtypes(include="object").columns:
        df[col] = df[col].str.replace(r"[^a-zA-Z0-9\s]", "", regex=True)
        df[col] = df[col].str.replace(r"\s+", " ", regex=True).str.strip()
    return df


# -------------------------
# 9. Column/Feature Issues
# -------------------------
def fix_columns(df: pd.DataFrame) -> pd.DataFrame:
    df.columns = [col.strip().lower().replace(" ", "_") for col in df.columns]
    return df


# -------------------------
# 10. Final Touch
# -------------------------
def final_touch(df: pd.DataFrame) -> pd.DataFrame:
    df = df.reset_index(drop=True)
    return df


# -------------------------
# Cleaning Pipeline
# -------------------------
def clean_pipeline(file_path: str) -> pd.DataFrame:
    df = load_file(file_path)
    df = fix_data_types(df, llm)
    df = handle_missing_data(df)
    df = remove_duplicates(df)
    df = handle_outliers(df)
    df = fix_inconsistent_values(df)
    df = clean_numerical(df)
    df = clean_text(df)
    df = fix_columns(df)
    df = final_touch(df)
    return df


# Example usage
if __name__ == "__main__":
    import os
    os.chdir("A:/Projects/AutoViz-Insight/backend/app/utils")
    cleaned_df = clean_pipeline("./output/dataset1.csv")
    cleaned_df.to_csv("output/cleaned_dataset1.csv", index=False)
    print(cleaned_df.head())
