from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app.services.conversation import ConversationService
from pydantic import BaseModel
from datetime import datetime

router = APIRouter(prefix="/api/conversations", tags=["conversations"])

class ConversationCreate(BaseModel):
    title: str

class MessageResponse(BaseModel):
    id: int
    sequence_id: int
    role: str
    type: str
    format: str | None
    content: str | None
    is_start: bool
    is_end: bool
    created_at: datetime

    class Config:
        from_attributes = True

class ConversationResponse(BaseModel):
    id: int
    title: str
    is_active: bool
    created_at: datetime
    last_updated: datetime
    messages: List[MessageResponse] = []

    class Config:
        from_attributes = True

@router.get("/", response_model=List[ConversationResponse])
def list_conversations(db: Session = Depends(get_db)):
    """Get all conversations"""
    conversation_service = ConversationService(db)
    return conversation_service.get_all_conversations()

@router.post("/", response_model=ConversationResponse)
def create_conversation(conversation: ConversationCreate, db: Session = Depends(get_db)):
    """Create a new conversation"""
    conversation_service = ConversationService(db)
    return conversation_service.create_conversation(conversation.title)

@router.get("/active", response_model=ConversationResponse)
def get_active_conversation(db: Session = Depends(get_db)):
    """Get the currently active conversation"""
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_active_conversation()
    if not conversation:
        raise HTTPException(status_code=404, detail="No active conversation found")
    return conversation

@router.post("/{conversation_id}/activate")
def activate_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Set a conversation as active"""
    conversation_service = ConversationService(db)
    conversation = conversation_service.set_active_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "success", "message": "Conversation activated"}

@router.get("/{conversation_id}", response_model=ConversationResponse)
def get_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Get a specific conversation"""
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conversation

@router.delete("/{conversation_id}")
def delete_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Delete a conversation"""
    conversation_service = ConversationService(db)
    if not conversation_service.delete_conversation(conversation_id):
        raise HTTPException(status_code=404, detail="Conversation not found")
    return {"status": "success", "message": "Conversation deleted"}

@router.post("/{conversation_id}/load")
def load_conversation(conversation_id: int, db: Session = Depends(get_db)):
    """Load a conversation into the interpreter"""
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation_service.load_conversation_to_interpreter(conversation_id)
    return {"status": "success", "message": "Conversation loaded into interpreter"}

@router.get("/{conversation_id}/messages", response_model=List[MessageResponse])
def get_conversation_messages(conversation_id: int, db: Session = Depends(get_db)):
    """Get messages for a conversation"""
    conversation_service = ConversationService(db)
    return conversation_service.get_messages(conversation_id)

@router.post("/{conversation_id}/consolidate")
def consolidate_conversation_messages(conversation_id: int, db: Session = Depends(get_db)):
    """Consolidate streamed messages in a conversation"""
    conversation_service = ConversationService(db)
    conversation = conversation_service.get_conversation(conversation_id)
    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation not found")
    conversation_service.consolidate_messages(conversation_id)
    return {"status": "success", "message": "Messages consolidated"}
