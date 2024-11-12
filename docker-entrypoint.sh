#!/bin/bash
set -e

# Wait for a few seconds to ensure any dependent services are up
sleep 2

# Create/Update the database schema
python << END
import sqlite3
import os

# Database path in the volume
DB_PATH = '/app/data/conversations.db'
os.makedirs(os.path.dirname(DB_PATH), exist_ok=True)

# Create the tables
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

# Create conversations table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS conversations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    is_active BOOLEAN DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
)
""")

# Create messages table if not exists
cursor.execute("""
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    conversation_id INTEGER NOT NULL,
    sequence_id INTEGER NOT NULL,
    role TEXT NOT NULL,
    type TEXT NOT NULL,
    format TEXT,
    content TEXT,
    is_start BOOLEAN DEFAULT 0,
    is_end BOOLEAN DEFAULT 0,
    extra_data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (conversation_id) REFERENCES conversations(id)
)
""")

# Create indexes if not exists
cursor.execute("CREATE INDEX IF NOT EXISTS ix_conversations_id ON conversations(id)")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_messages_id ON messages(id)")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_messages_conversation_id ON messages(conversation_id)")
cursor.execute("CREATE INDEX IF NOT EXISTS ix_messages_sequence_id ON messages(sequence_id)")

conn.commit()
conn.close()

print("Database setup completed successfully!")
END

# Start the application
exec "$@"
