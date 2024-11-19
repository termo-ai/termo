from fastapi import APIRouter, WebSocket
from app.database import SessionLocal
import json
from app.services.interpreter import interpreter_instance, process_interpreter_chunk
from app.services.conversation import ConversationService
from dataclasses import dataclass
from typing import Optional, Union, Dict, Any

@dataclass
class MessageAccumulator:
    role: str
    type: str
    format: Optional[str]
    content: Union[str, Dict[str, Any]] = ""
    is_start: bool = False
    is_end: bool = False

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            data = await websocket.receive_text()
            data = json.loads(data)
            
            if data.get("type") == "confirmation_response":
                confirmed = data.get("confirmed", False)
                continue
            
            conversation_id = data.get("conversation_id")
            if not conversation_id:
                await websocket.send_json({"error": "No conversation_id provided"})
                continue
                
            prompt = data.get("prompt")
            if not prompt:
                await websocket.send_json({"error": "No prompt provided"})
                continue

            db = SessionLocal()
            try:
                conversation_service = ConversationService(db)
                conversation_service.add_message(
                    conversation_id=conversation_id,
                    role="user",
                    type="message",
                    content=prompt
                )

                current_message: Optional[MessageAccumulator] = None
                
                for chunk in interpreter_instance.chat(prompt, stream=True, display=False):
                    processed_chunk = process_interpreter_chunk(chunk)
                    if not processed_chunk:
                        continue

                    await websocket.send_json(processed_chunk)

                    if processed_chunk.get("type") == "confirmation":
                        # For confirmation messages, store the entire content dictionary
                        conversation_service.add_message(
                            conversation_id=conversation_id,
                            role=processed_chunk.get("role", "assistant"),
                            type="confirmation",
                            content=json.dumps(processed_chunk.get("content")),  # Serialize the content dictionary
                            format=processed_chunk.get("format"),
                            is_start=False,
                            is_end=False
                        )
                        
                        confirmation_response = await websocket.receive_json()
                        if not confirmation_response.get("confirmed"):
                            break
                        continue

                    chunk_role = processed_chunk.get("role", "assistant")
                    chunk_type = processed_chunk.get("type", "message")
                    chunk_format = processed_chunk.get("format")
                    
                    if current_message and (
                        current_message.is_end or
                        current_message.role != chunk_role or
                        current_message.type != chunk_type or
                        current_message.format != chunk_format or
                        processed_chunk.get("start", False)
                    ):
                        conversation_service.add_message(
                            conversation_id=conversation_id,
                            role=current_message.role,
                            type=current_message.type,
                            content=current_message.content,
                            format=current_message.format,
                            is_start=current_message.is_start,
                            is_end=current_message.is_end
                        )
                        current_message = None

                    if not current_message:
                        current_message = MessageAccumulator(
                            role=chunk_role,
                            type=chunk_type,
                            format=chunk_format,
                            is_start=processed_chunk.get("start", False),
                            content=""  # Initialize with empty string for regular messages
                        )
                    
                    if "content" in processed_chunk:
                        # Handle content based on type
                        if isinstance(current_message.content, str):
                            current_message.content += str(processed_chunk["content"])
                        else:
                            # For dictionary content (like in confirmations)
                            current_message.content.update(processed_chunk["content"])
                    
                    if processed_chunk.get("end", False):
                        current_message.is_end = True

                if current_message:
                    conversation_service.add_message(
                        conversation_id=conversation_id,
                        role=current_message.role,
                        type=current_message.type,
                        content=current_message.content,
                        format=current_message.format,
                        is_start=current_message.is_start,
                        is_end=current_message.is_end
                    )
                    
            except Exception as e:
                await websocket.send_json({"error": str(e)})
                raise e  # Re-raise to see the full error
            finally:
                db.close()
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")