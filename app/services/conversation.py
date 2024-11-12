from sqlalchemy.orm import Session
from sqlalchemy import desc, and_
from typing import List, Optional, Dict
from app.models.conversation import Conversation, Message
from app.services.interpreter import interpreter_instance
from datetime import datetime

class ConversationService:
    def __init__(self, db: Session):
        self.db = db

    def create_conversation(self, title: str) -> Conversation:
        # Set all conversations to inactive
        self.db.query(Conversation).update({"is_active": False})
        
        # Create new active conversation
        conversation = Conversation(title=title, is_active=True)
        self.db.add(conversation)
        self.db.commit()
        self.db.refresh(conversation)
        return conversation

    def get_all_conversations(self) -> List[Conversation]:
        return self.db.query(Conversation).order_by(desc(Conversation.created_at)).all()

    def get_conversation(self, conversation_id: int) -> Optional[Conversation]:
        return self.db.query(Conversation).filter(Conversation.id == conversation_id).first()

    def get_active_conversation(self) -> Optional[Conversation]:
        return self.db.query(Conversation).filter(Conversation.is_active == True).first()

    def set_active_conversation(self, conversation_id: int) -> Conversation:
        # Set all conversations to inactive
        self.db.query(Conversation).update({"is_active": False})
        
        # Set the specified conversation to active
        conversation = self.get_conversation(conversation_id)
        if conversation:
            conversation.is_active = True
            conversation.last_updated = datetime.utcnow()
            self.db.commit()
            self.db.refresh(conversation)
        return conversation

    def get_messages(self, conversation_id: int) -> List[Message]:
        return self.db.query(Message)\
            .filter(Message.conversation_id == conversation_id)\
            .order_by(Message.sequence_id).all()

    def add_message(self, conversation_id: int, 
                   role: str, 
                   type: str,
                   content: Optional[str] = None,
                   format: Optional[str] = None,
                   is_start: bool = False,
                   is_end: bool = False,
                   extra_data: Optional[Dict] = None) -> Message:
        # Get the next sequence_id
        last_message = self.db.query(Message)\
            .filter(Message.conversation_id == conversation_id)\
            .order_by(desc(Message.sequence_id))\
            .first()
        
        sequence_id = (last_message.sequence_id + 1) if last_message else 1

        message = Message(
            conversation_id=conversation_id,
            sequence_id=sequence_id,
            role=role,
            type=type,
            content=content,
            format=format,
            is_start=is_start,
            is_end=is_end,
            extra_data=extra_data
        )
        
        self.db.add(message)
        self.db.commit()
        self.db.refresh(message)
        
        # Update conversation last_updated
        conversation = self.get_conversation(conversation_id)
        conversation.last_updated = datetime.utcnow()
        self.db.commit()
        
        return message

    def consolidate_messages(self, conversation_id: int) -> None:
        """Consolidate streamed messages into single messages where appropriate"""
        messages = self.get_messages(conversation_id)
        
        consolidated_content = ""
        last_type = None
        start_sequence = None
        
        for i, msg in enumerate(messages):
            if msg.is_start:
                start_sequence = msg.sequence_id
                consolidated_content = msg.content or ""
                last_type = msg.type
            elif msg.is_end and start_sequence is not None:
                # Consolidate messages between start and end
                consolidated_content += msg.content or ""
                
                # Create consolidated message
                self.add_message(
                    conversation_id=conversation_id,
                    role=msg.role,
                    type=last_type,
                    content=consolidated_content,
                    format=msg.format,
                    is_start=False,
                    is_end=False
                )
                
                # Delete the streamed messages
                self.db.query(Message).filter(
                    and_(
                        Message.conversation_id == conversation_id,
                        Message.sequence_id >= start_sequence,
                        Message.sequence_id <= msg.sequence_id
                    )
                ).delete()
                
                self.db.commit()
                start_sequence = None
                consolidated_content = ""
            elif start_sequence is not None:
                consolidated_content += msg.content or ""

    def load_conversation_to_interpreter(self, conversation_id: int) -> None:
        """Loads a conversation's messages into the interpreter's context"""
        # Set as active conversation
        self.set_active_conversation(conversation_id)
        
        messages = self.get_messages(conversation_id)
        
        # Clear existing messages
        interpreter_instance.messages.clear()
        
        # Convert DB messages to interpreter format
        for msg in messages:
            if msg.role in ['user', 'assistant']:
                interpreter_message = {
                    'role': msg.role,
                    'content': msg.content or ""
                }
                if msg.type in ['code', 'execution']:
                    interpreter_message.update({
                        'type': msg.type,
                        'format': msg.format
                    })
                interpreter_instance.messages.append(interpreter_message)

    def delete_conversation(self, conversation_id: int) -> bool:
        """Delete a conversation and all its messages"""
        conversation = self.get_conversation(conversation_id)
        if conversation:
            self.db.delete(conversation)
            self.db.commit()
            return True
        return False
