# app/core/websocket.py
from fastapi import WebSocket
from typing import List, Dict, Any

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []

    async def connect(self, websocket: WebSocket):
        await websocket.accept()
        self.active_connections.append(websocket)

    def disconnect(self, websocket: WebSocket):
        self.active_connections.remove(websocket)

    async def send_json(self, websocket: WebSocket, message: Dict[str, Any]):
        await websocket.send_json(message)

    async def broadcast_json(self, message: Dict[str, Any]):
        for connection in self.active_connections:
            await connection.send_json(message)

# Create a single instance to be used across the application
manager = ConnectionManager()