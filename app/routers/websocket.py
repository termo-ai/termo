from fastapi import APIRouter, WebSocket
from app.database import SessionLocal
import json
from app.services.interpreter import interpreter_instance, process_interpreter_chunk
from app.services.conversation import ConversationService

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    await websocket.accept()
    
    try:
        while True:
            # Receive message from the client
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

            # Create new DB session
            db = SessionLocal()
            try:
                conversation_service = ConversationService(db)
                
                # Save user message
                conversation_service.add_message(
                    conversation_id=conversation_id,
                    role="user",
                    type="message",
                    content=prompt
                )

                # Process with interpreter
                for chunk in interpreter_instance.chat(prompt, stream=True, display=False):
                    processed_chunk = process_interpreter_chunk(chunk)
                    if processed_chunk:
                        # Save assistant message
                        conversation_service.add_message(
                            conversation_id=conversation_id,
                            role="assistant",
                            type=processed_chunk.get("type", "message"),
                            content=processed_chunk.get("content"),
                            format=processed_chunk.get("format"),
                            is_start=processed_chunk.get("start", False),
                            is_end=processed_chunk.get("end", False)
                        )
                        
                        await websocket.send_json(processed_chunk)
                        
                        if processed_chunk.get("type") == "confirmation":
                            confirmation_response = await websocket.receive_json()
                            if not confirmation_response.get("confirmed"):
                                break
                    
            except Exception as e:
                await websocket.send_json({"error": str(e)})
            finally:
                db.close()
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")
