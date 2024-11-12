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
                "format": chunk.get("format", ""),
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
            content_dict = chunk.get("content", {})
            pass
            if isinstance(content_dict, dict):
                return {
                    "type": "confirmation",
                    "content": content_dict.get("content", ""),
                    "format": content_dict.get("format"),
                }
            else:
                return {
                    "type": "confirmation",
                    "content": str(content_dict)
                }
    
    return None  # Return None for unhandled chunk types
pass
interpreter_instance = configure_interpreter()
