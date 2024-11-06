# app/routers/directory.py
from fastapi import APIRouter, Request, HTTPException
from fastapi.responses import JSONResponse
from app.services.directory import directory_service
from fastapi.templating import Jinja2Templates
from app.core.config import settings

router = APIRouter()
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

@router.get("/")
async def home(request: Request):
    """Render the home page"""
    return templates.TemplateResponse("index.html", {"request": request})

@router.get("/api/directory")
async def get_directory_structure(path: str = ""):
    """Get the directory structure for the specified path"""
    try:
        directory_structure = directory_service.get_directory_structure(path)
        return JSONResponse(content=directory_structure)
    except Exception as e:
        return JSONResponse(
            content={"error": str(e)},
            status_code=500
        )