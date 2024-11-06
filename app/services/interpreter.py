# app/services/interpreter.py
from interpreter import interpreter
from app.core.config import settings

def configure_interpreter():
    interpreter.auto_run = settings.INTERPRETER_AUTO_RUN
    interpreter.safe_mode = settings.INTERPRETER_SAFE_MODE
    interpreter.llm.api_key = settings.OPENROUTER_API_KEY
    interpreter.llm.model = settings.LLM_MODEL
    return interpreter

def process_interpreter_chunk(chunk):
    """Process interpreter chunks and format them for WebSocket transmission"""
    if chunk.get("role") == "assistant":
        if chunk.get("type") == "message":
            return {
                "type": "message",
                "content": chunk.get("content", "")
            }
        elif chunk.get("type") == "code":
            return {
                "type": "code",
                "content": chunk.get("content", ""),
                "language": chunk.get("format", ""),
                "start": chunk.get("start", False),
                "end": chunk.get("end", False)
            }
    
    elif chunk.get("role") == "computer":
        if chunk.get("type") == "console":
            if chunk.get("format") == "output":
                return {
                    "type": "output",
                    "content": chunk.get("content", "")
                }
            elif chunk.get("format") == "active_line":
                return {
                    "type": "active_line",
                    "content": chunk.get("content")
                }
        elif chunk.get("type") == "confirmation":
            return {
                "type": "confirmation",
                "content": chunk.get("content", {})
            }
    
    return None  # Return None for unhandled chunk types

interpreter_instance = configure_interpreter()