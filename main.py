# main.py
from fastapi import FastAPI
from fastapi.staticfiles import StaticFiles
from fastapi.templating import Jinja2Templates
from app.core.config import settings
from app.routers import directory, websocket, conversation
from app.database import engine
from app.models.conversation import Base

app = FastAPI()

# Create database tables
Base.metadata.create_all(bind=engine)

# Configure static files and templates
app.mount("/static", StaticFiles(directory=settings.STATIC_DIR), name="static")
templates = Jinja2Templates(directory=settings.TEMPLATES_DIR)

# Include routers
app.include_router(directory.router)
app.include_router(websocket.router)
app.include_router(conversation.router)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
