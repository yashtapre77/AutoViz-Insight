# app/utils/file_handler.py
import os
from fastapi import UploadFile

UPLOAD_DIR = "app/uploads/"

def save_file(file: UploadFile, user_id: str) -> str:
    os.makedirs(UPLOAD_DIR, exist_ok=True)
    file_path = os.path.join(UPLOAD_DIR, f"{user_id}_{file.filename}")
    with open(file_path, "wb") as f:
        f.write(file.file.read())
    return file_path
