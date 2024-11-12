// Conversations state
const conversations = {
    active: null,
    
    async initialize() {
        try {
            const conversationList = document.getElementById('conversation-list');
            conversationList.innerHTML = '<div class="text-gray-500 p-2 text-sm">Loading...</div>';
            
            const response = await fetch('/api/conversations');
            const convos = await response.json();
            
            // If no conversations exist, create one
            if (convos.length === 0) {
                await this.create();
                return;
            }
            
            let content = this.createNewChatButton();
            content += convos.map(conv => this.createConversationItem(conv)).join('');
            
            conversationList.innerHTML = content;
            this.setupListeners();
            
            // If no active conversation, switch to the first one
            if (!this.active && convos.length > 0) {
                await this.switchTo(convos[0].id);
            }
        } catch (error) {
            console.error('Error initializing conversations:', error);
            conversationList.innerHTML = '<div class="text-red-500 p-2 text-sm">Error loading conversations</div>';
        }
    },
    
    createNewChatButton() {
        return `
            <button onclick="conversations.create()" 
                    class="w-full text-left px-4 py-2 text-sm text-gray-300 hover:bg-gray-700 rounded-lg flex items-center space-x-2 mb-2">
                <i class="fas fa-plus"></i>
                <span>New Chat</span>
            </button>
        `;
    },
    
    createConversationItem(conv) {
        const isActive = this.active === conv.id;
        return `
            <div class="conversation-item group ${isActive ? 'bg-gray-700' : ''} hover:bg-gray-700 rounded-lg mb-1 relative"
                 data-conversation-id="${conv.id}">
                <div class="px-4 py-2 flex items-center justify-between cursor-pointer">
                    <div class="flex items-center space-x-2 flex-1 min-w-0">
                        <i class="fas fa-message text-gray-400"></i>
                        <span class="text-sm text-gray-300 truncate">${conv.title}</span>
                    </div>
                    <button onclick="conversations.delete(${conv.id}, event)" 
                            class="text-gray-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    },
    
    setupListeners() {
        document.querySelectorAll('.conversation-item').forEach(item => {
            item.addEventListener('click', async (e) => {
                if (e.target.closest('button')) return;
                const conversationId = parseInt(item.dataset.conversationId);
                await this.switchTo(conversationId);
            });
        });
    },
    
    async create() {
        try {
            const response = await fetch('/api/conversations', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    title: 'New Chat'
                })
            });
            
            if (!response.ok) throw new Error('Failed to create conversation');
            
            const conversation = await response.json();
            await this.switchTo(conversation.id);
            await this.initialize();
        } catch (error) {
            console.error('Error creating conversation:', error);
        }
    },
    
    async switchTo(conversationId) {
        try {
            const response = await fetch(`/api/conversations/${conversationId}/activate`, {
                method: 'POST'
            });
            
            if (!response.ok) throw new Error('Failed to activate conversation');
            
            const loadResponse = await fetch(`/api/conversations/${conversationId}/load`, {
                method: 'POST'
            });
            
            if (!loadResponse.ok) throw new Error('Failed to load conversation');
            
            this.active = conversationId;
            
            // Update UI
            document.querySelectorAll('.conversation-item').forEach(item => {
                const isActive = parseInt(item.dataset.conversationId) === conversationId;
                item.classList.toggle('bg-gray-700', isActive);
            });
            
            // Clear and load messages
            const chatContainer = document.getElementById('chat-container');
            chatContainer.innerHTML = '';
            
            const messagesResponse = await fetch(`/api/conversations/${conversationId}/messages`);
            const messages = await messagesResponse.json();
            
            messages.forEach(message => {
                if (message.role === 'user') {
                    appendUserMessage(message.content);
                } else if (message.role === 'assistant') {
                    handleMessageChunk(message.content);
                    if (message.type === 'code') {
                        handleCodeChunk(message.content, message.format, true, true);
                    }
                }
            });
        } catch (error) {
            console.error('Error switching conversation:', error);
        }
    },
    
    async delete(conversationId, event) {
        event.stopPropagation();
        
        if (!confirm('Are you sure you want to delete this conversation?')) return;
        
        try {
            const response = await fetch(`/api/conversations/${conversationId}`, {
                method: 'DELETE'
            });
            
            if (!response.ok) throw new Error('Failed to delete conversation');
            
            if (this.active === conversationId) {
                document.getElementById('chat-container').innerHTML = '';
                this.active = null;
            }
            
            await this.initialize();
        } catch (error) {
            console.error('Error deleting conversation:', error);
        }
    }
};

// Initialize conversations when the page loads
document.addEventListener('DOMContentLoaded', () => conversations.initialize());

// Override the original sendMessage to include conversation_id
const originalSendMessage = window.sendMessage;
window.sendMessage = function() {
    const promptInput = document.getElementById('prompt-input');
    const message = promptInput.value.trim();

    if (message && ws.readyState === WebSocket.OPEN) {
        // If no active conversation, create one first
        if (!conversations.active) {
            conversations.create().then(() => {
                // Now send the message with the new conversation
                ws.send(JSON.stringify({ 
                    prompt: message,
                    conversation_id: conversations.active 
                }));
            });
        } else {
            // Send message with existing conversation
            ws.send(JSON.stringify({ 
                prompt: message,
                conversation_id: conversations.active 
            }));
        }
        
        appendUserMessage(message);
        promptInput.value = '';
        document.getElementById('char-count').textContent = '0';

        currentMessageDiv = null;
        currentMessageContent = null;
        currentCodeBlock = null;
        currentOutputBlock = null;
    }
};
