// app/static/js/websocket.js
let ws;
let messageContainer = document.getElementById('chat-container');
let currentMessageDiv = null;
let currentMessageContent = null;
let currentCodeBlock = null;
let currentOutputBlock = null;
let isCodeBlockActive = false;

function connect() {
    ws = new WebSocket(`ws://${window.location.host}/ws`);

    ws.onopen = function () {
        document.getElementById('connection-status').textContent = 'Connected';
        document.getElementById('connection-status').previousElementSibling.classList.remove('bg-red-500');
        document.getElementById('connection-status').previousElementSibling.classList.add('bg-green-500');
    };

    ws.onclose = function () {
        document.getElementById('connection-status').textContent = 'Reconnecting...';
        document.getElementById('connection-status').previousElementSibling.classList.remove('bg-green-500');
        document.getElementById('connection-status').previousElementSibling.classList.add('bg-red-500');
        setTimeout(connect, 1000);
    };

    ws.onmessage = function (event) {
        const data = JSON.parse(event.data);

        if (data.error) {
            appendErrorMessage(data.error);
            return;
        }

        if (data.type === 'message') {
            handleMessageChunk(data.content);
            isCodeBlockActive = false;
        } else if (data.type === 'code') {
            handleCodeChunk(data.content, data.language, data.start, data.end);
            isCodeBlockActive = true;
        } else if (data.type === 'output') {
            handleOutputChunk(data.content);
        }

        messageContainer.scrollTop = messageContainer.scrollHeight;
    };
}

function sendMessage() {
    const promptInput = document.getElementById('prompt-input');
    const message = promptInput.value.trim();

    if (message && ws.readyState === WebSocket.OPEN) {
        appendUserMessage(message);
        ws.send(JSON.stringify({ prompt: message }));
        promptInput.value = '';
        document.getElementById('char-count').textContent = '0';

        currentMessageDiv = null;
        currentMessageContent = null;
        currentCodeBlock = null;
        currentOutputBlock = null;
    }
}

// Initialize websocket connection
document.addEventListener('DOMContentLoaded', connect);