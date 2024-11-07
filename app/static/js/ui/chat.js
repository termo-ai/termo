// app/static/js/ui/chat.js

function handleMessageChunk(content) {
    if (!currentMessageDiv || (isCodeBlockActive && !content.trim().startsWith('```'))) {
        currentMessageDiv = createMessageGroup('assistant');
        currentMessageContent = currentMessageDiv.querySelector('.message-content');
        currentCodeBlock = null;
        currentOutputBlock = null;
    }

    currentMessageContent.textContent += content;
}

// Modify handleCodeChunk function in chat.js
function handleCodeChunk(code, language, start, end) {
    if (!currentCodeBlock || !isCodeBlockActive) {
        currentCodeBlock = document.createElement('div');
        currentCodeBlock.className = 'mt-2 bg-gray-900 rounded-lg group relative';
        currentCodeBlock.innerHTML = `
            <div class="flex justify-between items-center px-4 py-2 bg-gray-700 rounded-t-lg">
                <div class="flex items-center space-x-2">
                    <span class="text-sm font-mono">${language || 'shell'}</span>
                    <span class="code-execution-status"></span>
                </div>
                <div class="flex space-x-2">
                    <button onclick="copyCode(this)" class="text-sm text-gray-300 hover:text-white">
                        <i class="fas fa-copy"></i>
                    </button>
                </div>
            </div>
            <pre class="p-4 m-0 overflow-x-auto"><code class="language-${language || 'shell'}"></code></pre>
        `;

        if (!currentMessageDiv) {
            currentMessageDiv = createMessageGroup('assistant');
        }
        currentMessageDiv.appendChild(currentCodeBlock);
    }

    const codeElement = currentCodeBlock.querySelector('code');
    if (codeElement) {
        const existingCode = codeElement.textContent;
        const newCode = existingCode + code;
        if (existingCode !== newCode) {
            codeElement.textContent = newCode;
            Prism.highlightElement(codeElement);
        }
    }
}

// Add function to update code block status
function updateCodeBlockStatus(codeBlock, status) {
    const statusElement = codeBlock.querySelector('.code-execution-status');
    if (statusElement) {
        statusElement.className = 'code-execution-status text-sm px-2 py-0.5 rounded-md';
        
        if (status === 'executed') {
            statusElement.className += ' bg-green-600/50 text-green-200';
            statusElement.innerHTML = '<i class="fas fa-check-circle mr-1"></i>Executed';
        } else if (status === 'canceled') {
            statusElement.className += ' bg-red-600/50 text-red-200';
            statusElement.innerHTML = '<i class="fas fa-ban mr-1"></i>Canceled';
        } else if (status === 'pending') {
            statusElement.className += ' bg-yellow-600/50 text-yellow-200';
            statusElement.innerHTML = '<i class="fas fa-clock mr-1"></i>Pending';
        }
    }
}

function handleOutputChunk(output) {
    if (!currentOutputBlock) {
        currentOutputBlock = document.createElement('div');
        currentOutputBlock.className = 'mt-2 bg-gray-700 rounded-lg group relative';

        // Create header with controls
        const header = document.createElement('div');
        header.className = 'flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg';
        header.innerHTML = `
            <span class="text-sm">Output</span>
            <div class="flex space-x-2">
                <button class="text-sm text-gray-300 hover:text-white copy-btn" title="Copy output">
                    <i class="fas fa-copy"></i>
                </button>
                <button class="text-sm text-gray-300 hover:text-white expand-btn" title="Expand/Collapse">
                    <i class="fas fa-expand"></i>
                </button>
            </div>
        `;

        // Create content container
        const contentContainer = document.createElement('div');
        contentContainer.className = 'output-content max-h-60 overflow-y-auto transition-all duration-200';
        contentContainer.style.maxHeight = '15rem';

        // Create the actual output content div
        const outputContent = document.createElement('div');
        outputContent.className = 'p-4 font-mono text-sm whitespace-pre-wrap';

        contentContainer.appendChild(outputContent);
        currentOutputBlock.appendChild(header);
        currentOutputBlock.appendChild(contentContainer);

        // Add event listeners
        header.querySelector('.copy-btn').addEventListener('click', function () {
            navigator.clipboard.writeText(outputContent.textContent);
            this.innerHTML = '<i class="fas fa-check"></i>';
            setTimeout(() => {
                this.innerHTML = '<i class="fas fa-copy"></i>';
            }, 2000);
        });

        header.querySelector('.expand-btn').addEventListener('click', function () {
            const content = this.closest('.group').querySelector('.output-content');
            const isExpanded = content.style.maxHeight !== '15rem';

            if (isExpanded) {
                content.style.maxHeight = '15rem';
                this.innerHTML = '<i class="fas fa-expand"></i>';
            } else {
                content.style.maxHeight = 'none';
                this.innerHTML = '<i class="fas fa-compress"></i>';
            }
        });

        if (currentMessageDiv) {
            currentMessageDiv.appendChild(currentOutputBlock);
        } else {
            currentMessageDiv = createMessageGroup('assistant');
            currentMessageDiv.appendChild(currentOutputBlock);
        }

        currentOutputBlock.outputContent = outputContent;
    }

    currentOutputBlock.outputContent.textContent += output;
}

function createMessageGroup(role) {
    const div = document.createElement('div');
    div.className = `rounded-lg p-4 ${role === 'user' ? 'bg-gray-700' : 'bg-gray-600'}`;
    div.innerHTML = `
        <div class="flex items-center mb-2">
            <i class="fas ${role === 'user' ? 'fa-user' : 'fa-robot'} mr-2"></i>
            <div class="font-bold">${role === 'user' ? 'You' : 'Assistant'}</div>
        </div>
        <div class="message-content"></div>
    `;
    messageContainer.appendChild(div);
    return div;
}

function appendErrorMessage(error) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'p-4 rounded-lg bg-red-500/50 text-white';
    errorDiv.innerHTML = `
        <div class="flex items-center">
            <i class="fas fa-exclamation-circle mr-2"></i>
            <span>Error: ${error}</span>
        </div>
    `;
    messageContainer.appendChild(errorDiv);
}

function appendUserMessage(message) {
    const div = createMessageGroup('user');
    div.querySelector('.message-content').textContent = message;
    currentMessageDiv = null;
    currentMessageContent = null;
    currentCodeBlock = null;
    currentOutputBlock = null;
}

function copyCode(button) {
    const codeBlock = button.closest('.group').querySelector('code');
    navigator.clipboard.writeText(codeBlock.textContent);

    // Visual feedback
    button.innerHTML = '<i class="fas fa-check"></i>';
    setTimeout(() => {
        button.innerHTML = '<i class="fas fa-copy"></i>';
    }, 2000);
}

function clearChat() {
    if (confirm('Are you sure you want to clear the chat?')) {
        messageContainer.innerHTML = '';
        // Re-add welcome message
        messageContainer.innerHTML = `
            <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
                <h2 class="text-xl font-bold mb-2">Welcome to Open Interpreter</h2>
                <p class="text-gray-300">Start by typing a command or asking a question below.</p>
            </div>
        `;
    }
}

// In chat.js, add this function to create confirmation buttons
function createConfirmationButtons() {
    const confirmationDiv = document.createElement('div');
    confirmationDiv.className = 'flex space-x-2 mt-2';
    confirmationDiv.innerHTML = `
        <button id="confirm-execution" class="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
            <i class="fas fa-check mr-2"></i>Run Code
        </button>
        <button id="reject-execution" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
            <i class="fas fa-times mr-2"></i>Cancel
        </button>
    `;
    return confirmationDiv;
}

function exportChat() {
    const messages = Array.from(messageContainer.children).map(msg => {
        const role = msg.querySelector('.font-bold').textContent;
        const content = msg.querySelector('.message-content')?.textContent || '';
        const code = msg.querySelector('code')?.textContent || '';
        const output = Array.from(msg.querySelectorAll('.whitespace-pre-wrap')).map(o => o.textContent).join('\n');
        return { role, content, code, output };
    });

    const blob = new Blob([JSON.stringify(messages, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'chat-export.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}

// Event Listeners
document.addEventListener('DOMContentLoaded', () => {
    const promptInput = document.getElementById('prompt-input');
    const charCount = document.getElementById('char-count');

    // Initialize character counter
    promptInput.addEventListener('input', () => {
        charCount.textContent = promptInput.value.length;
    });

    // Handle Enter key
    promptInput.addEventListener('keypress', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            sendMessage();
        }
    });
});