# app/routers/websocket.py
from fastapi import APIRouter, WebSocket
import json
from app.services.interpreter import interpreter_instance, process_interpreter_chunk

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
                # Handle the confirmation response
                confirmed = data.get("confirmed", False)
                # Your logic to continue or abort based on confirmation
                continue
                
            prompt = data.get("prompt")
            if not prompt:
                await websocket.send_json({"error": "No prompt provided"})
                continue

            # Process with interpreter
            try:
                for chunk in interpreter_instance.chat(prompt, stream=True, display=False):
                    processed_chunk = process_interpreter_chunk(chunk)
                    if processed_chunk:
                        await websocket.send_json(processed_chunk)
                        
                        # If this is a confirmation chunk, wait for user response
                        if processed_chunk["type"] == "confirmation":
                            confirmation_response = await websocket.receive_json()
                            if not confirmation_response.get("confirmed"):
                                # Handle rejection (you might want to break the loop or send a message)
                                break
                    
            except Exception as e:
                await websocket.send_json({"error": str(e)})
                
    except Exception as e:
        print(f"WebSocket error: {str(e)}")