from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, JSON
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from .base import Base

class Conversation(Base):
    __tablename__ = "conversations"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=False)
    is_active = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    last_updated = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())

    # Relationship to messages
    messages = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Conversation(id={self.id}, title='{self.title}')>"


class Message(Base):
    __tablename__ = "messages"

    id = Column(Integer, primary_key=True, index=True)
    conversation_id = Column(Integer, ForeignKey("conversations.id"), nullable=False)
    sequence_id = Column(Integer, nullable=False)
    role = Column(String, nullable=False)  # assistant, user, computer
    type = Column(String, nullable=False)  # message, code, console, confirmation
    format = Column(String)  # python, output, active_line, execution, etc.
    content = Column(String)
    is_start = Column(Boolean, default=False)
    is_end = Column(Boolean, default=False)
    extra_data = Column(JSON)  # Changed from metadata to extra_data
    created_at = Column(DateTime(timezone=True), server_default=func.now())

    # Relationship to conversation
    conversation = relationship("Conversation", back_populates="messages")

    def __repr__(self):
        return f"<Message(id={self.id}, role='{self.role}', type='{self.type}')>"
