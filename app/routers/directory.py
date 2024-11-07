# app/routers/directory.py
from fastapi import APIRouter, Request, HTTPException, UploadFile, File
from fastapi.responses import JSONResponse
from fastapi.templating import Jinja2Templates
from app.core.config import settings
import os

router = APIRouter()
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

@router.get("/")
async def home(request: Request):
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/api/directory")
async def get_directory_structure(path: str = ""):
    try:
        # Base path is always relative to the data directory
        base_path = os.path.join(os.getcwd(), "data")
        if path:
            base_path = os.path.join(base_path, path)
        
        if not os.path.exists(base_path):
            os.makedirs(base_path, exist_ok=True)
            
        items = []
        for item in os.listdir(base_path):
            full_path = os.path.join(base_path, item)
            relative_path = os.path.join(path, item) if path else item
            is_dir = os.path.isdir(full_path)
            
            items.append({
                "name": item,
                "isFolder": is_dir,
                "path": relative_path
            })
        
        return items
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/api/upload")
async def upload_file(file: UploadFile = File(...)):
    try:
        data_dir = os.path.join(os.getcwd(), "data")
        os.makedirs(data_dir, exist_ok=True)
        
        file_path = os.path.join(data_dir, file.filename)
        with open(file_path, "wb") as buffer:
            content = await file.read()
            buffer.write(content)
        
        return {"message": "File uploaded successfully"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))