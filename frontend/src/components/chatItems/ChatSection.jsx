import React, { useState, useEffect } from 'react';
import InputSection from './InputSection';
import HeaderSection from './HeaderSection';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

const ChatSection = () => {
    const [messages, setMessages] = useState(initialMessages); // `initialMessages` asumido existente
    const [messageGroups, setMessageGroups] = useState([]);

    const Message = ({ content, role }) => (
        <div className={`rounded-lg p-4 ${role === 'user' ? 'bg-gray-700' : 'bg-gray-600'}`}>
            <div className="flex items-center mb-2">
                <div className="font-bold">{role === 'user' ? 'You' : 'Assistant'}</div>
            </div>
            {content}
        </div>
    );

    const Confirmation = ({ content }) => (
        <div className="p-4 bg-gray-700 rounded-lg flex justify-between items-center">
            <div>{content}</div>
            <div className="flex space-x-2">
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg">
                    Run Code
                </button>
                <button className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg">
                    Cancel
                </button>
            </div>
        </div>
    );

    const CodeBlock = ({ content, role, language }) => (
        <div className="mt-2 bg-gray-700 rounded-lg group relative">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">{language || 'shell'}</span>
                    <span className="code-execution-status"></span>
                </div>
                <div className="flex space-x-2">
                    <button onclick="copyCode(this)" className="text-sm text-gray-300 hover:text-white">
                        C
                    </button>
                </div>
            </div>
            <pre className="p-4 m-0 overflow-x-auto bg-neutral-800">
                <code className={`language-${language || 'shell'}`}>{content}</code>
            </pre>
        </div>
    );

    const Output = ({ content }) => (
        <div className="mt-2 bg-gray-700 rounded-lg group relative">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg">
                <span className="text-sm text-white">Output</span>
                <div className="flex space-x-2">
                    <button className="text-sm text-gray-300 hover:text-white" title="Copy output">
                        C
                    </button>
                    <button className="text-sm text-gray-300 hover:text-white" title="Expand/Collapse">
                        E
                    </button>
                </div>
            </div>
            <div className="p-4 font-mono text-sm whitespace-pre-wrap bg-gray-700">
                {content}
            </div>
        </div>
    );

    useEffect(() => {
        Prism.highlightAll();
    }, [messages]);

    useEffect(() => {
        // Agrupar mensajes del asistente hasta un mensaje de tipo 'output'
        const groupedMessages = [];
        let currentGroup = [];

        messages.forEach((message) => {
            if (message.role === 'assistant') {
                currentGroup.push(message);
                if (message.type === 'output') {
                    groupedMessages.push([...currentGroup]);
                    currentGroup = [];
                }
            } else {
                if (currentGroup.length > 0) {
                    groupedMessages.push([...currentGroup]);
                    currentGroup = [];
                }
                groupedMessages.push([message]);
            }
        });

        if (currentGroup.length > 0) {
            groupedMessages.push([...currentGroup]);
        }

        setMessageGroups(groupedMessages);
    }, [messages]);

    const handleSend = (message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
    };

    return (
        <div className="h-full w-full flex flex-col bg-gray-900 border-l border-gray-700">
            <HeaderSection />
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messageGroups.map((group, groupIdx) => {
                    const isAssistantGroup =
                        group.length > 0 && group[0].role === 'assistant';

                    return (
                        <div
                            key={groupIdx}
                            className={`space-y-4 ${isAssistantGroup ? 'bg-gray-600 rounded-lg p-4' : ''}`}
                        >
                            {isAssistantGroup ? (
                                <div>
                                    {group.map((msg, msgIdx) => {
                                        switch (msg.type) {
                                            case 'message':
                                                return <Message key={msgIdx} content={msg.content} role={msg.role} />;
                                            case 'confirmation':
                                                return <Confirmation key={msgIdx} content={msg.content} />;
                                            case 'code':
                                                return (
                                                    <CodeBlock
                                                        key={msgIdx}
                                                        content={msg.content}
                                                        language={msg.language}
                                                    />
                                                );
                                            case 'output':
                                                return <Output key={msgIdx} content={msg.content} />;
                                            default:
                                                return null;
                                        }
                                    })}
                                </div>
                            ) : (
                                group.map((msg, msgIdx) => (
                                    <Message
                                        key={msgIdx}
                                        content={msg.content}
                                        role={msg.role}
                                    />
                                ))
                            )}
                        </div>
                    );
                })}
            </div>
            <InputSection onSend={handleSend} />
        </div>
    );
};

const initialMessages = [
    {
      "id": 23,
      "sequence_id": 1,
      "role": "user",
      "type": "message",
      "content": "write the code for a hellow world in javascript",
      "created_at": "2024-11-21T23:32:02",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 24,
      "sequence_id": 2,
      "role": "assistant",
      "type": "message",
      "content": "I'll help you write a simple \"Hello World\" program in JavaScript. Let me execute that for you.",
      "created_at": "2024-11-21T23:32:06",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 25,
      "sequence_id": 3,
      "role": "assistant",
      "type": "confirmation",
      "format": "javascript",
      "content": "\"console.log(\\\"Hello, World!\\\");\"",
      "created_at": "2024-11-21T23:32:07",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 26,
      "sequence_id": 4,
      "role": "assistant",
      "type": "code",
      "format": "javascript",
      "content": "console.log(\"Hello, World!\");",
      "created_at": "2024-11-21T23:32:13",
      "is_end": true,
      "is_start": true
    },
    {
      "id": 27,
      "sequence_id": 5,
      "role": "assistant",
      "type": "output",
      "content": "Traceback (most recent call last): ... FileNotFoundError: [Errno 2] No such file or directory: 'node'",
      "created_at": "2024-11-21T23:32:13",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 28,
      "sequence_id": 6,
      "role": "assistant",
      "type": "active_line",
      "content": "None",
      "created_at": "2024-11-21T23:32:16",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 29,
      "sequence_id": 7,
      "role": "assistant",
      "type": "message",
      "content": "I see that Node.js is not installed on your system. Let me help you install Node.js first using the shell, and then we'll run our JavaScript code.",
      "created_at": "2024-11-21T23:32:18",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 30,
      "sequence_id": 8,
      "role": "assistant",
      "type": "confirmation",
      "format": "shell",
      "content": "\"curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\\nsudo apt-get install -y nodejs\"",
      "created_at": "2024-11-21T23:32:18",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 31,
      "sequence_id": 9,
      "role": "assistant",
      "type": "code",
      "format": "shell",
      "content": "curl -fsSL https://deb.nodesource.com/setup_lts.x | sudo -E bash - &&\\nsudo apt-get install -y nodejs",
      "created_at": "2024-11-21T23:33:13",
      "is_end": true,
      "is_start": true
    },
    {
      "id": 32,
      "sequence_id": 10,
      "role": "assistant",
      "type": "output",
      "content": "bash: line 1: sudo: command not found\ncurl: (23) Failed writing body",
      "created_at": "2024-11-21T23:33:14",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 33,
      "sequence_id": 11,
      "role": "assistant",
      "type": "active_line",
      "content": "None",
      "created_at": "2024-11-21T23:33:16",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 34,
      "sequence_id": 12,
      "role": "assistant",
      "type": "message",
      "content": "I apologize for the confusion. It seems we don't have sudo access. Let's try an alternative approach using NVM (Node Version Manager) which doesn't require root privileges.",
      "created_at": "2024-11-21T23:33:18",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 35,
      "sequence_id": 13,
      "role": "assistant",
      "type": "confirmation",
      "format": "shell",
      "content": "\"curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash\"",
      "created_at": "2024-11-21T23:33:20",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 36,
      "sequence_id": 14,
      "role": "assistant",
      "type": "code",
      "format": "shell",
      "content": "curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash",
      "created_at": "2024-11-21T23:33:28",
      "is_end": true,
      "is_start": true
    },
    {
      "id": 37,
      "sequence_id": 15,
      "role": "assistant",
      "type": "active_line",
      "content": "1",
      "created_at": "2024-11-21T23:33:28",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 38,
      "sequence_id": 16,
      "role": "assistant",
      "type": "output",
      "content": "=> Downloading nvm as script to '/root/.nvm'\n=> Appending nvm source string to /root/.bashrc\n=> Appending bash_completion source string to /root/.bashrc\n=> Close and reopen your terminal to start using nvm or run the following to use it now:\n\nexport NVM_DIR=\"$HOME/.nvm\"\n[ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\"  # This loads nvm\n[ -s \"$NVM_DIR/bash_completion\" ] && \\. \"$NVM_DIR/bash_completion\"  # This loads nvm bash_completion",
      "created_at": "2024-11-21T23:33:30",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 39,
      "sequence_id": 17,
      "role": "assistant",
      "type": "active_line",
      "content": "None",
      "created_at": "2024-11-21T23:33:32",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 40,
      "sequence_id": 18,
      "role": "assistant",
      "type": "message",
      "content": "Now let's source NVM and install Node.js:",
      "created_at": "2024-11-21T23:33:34",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 41,
      "sequence_id": 19,
      "role": "assistant",
      "type": "confirmation",
      "format": "shell",
      "content": "\"export NVM_DIR=\\\"$HOME/.nvm\\\"\\n[ -s \\\"$NVM_DIR/nvm.sh\\\" ] && \\\\. \\\"$NVM_DIR/nvm.sh\\\"\\nnvm install node\"",
      "created_at": "2024-11-21T23:33:34",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 42,
      "sequence_id": 20,
      "role": "assistant",
      "type": "code",
      "format": "shell",
      "content": "export NVM_DIR=\"$HOME/.nvm\"\n[ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\"\nnvm install node",
      "created_at": "2024-11-21T23:33:40",
      "is_end": true,
      "is_start": true
    },
    {
      "id": 43,
      "sequence_id": 21,
      "role": "assistant",
      "type": "active_line",
      "content": "1",
      "created_at": "2024-11-21T23:33:40",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 44,
      "sequence_id": 22,
      "role": "assistant",
      "type": "output",
      "content": "\n",
      "created_at": "2024-11-21T23:33:40",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 45,
      "sequence_id": 23,
      "role": "assistant",
      "type": "active_line",
      "content": "2",
      "created_at": "2024-11-21T23:33:40",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 46,
      "sequence_id": 24,
      "role": "assistant",
      "type": "output",
      "content": "\n",
      "created_at": "2024-11-21T23:33:40",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 47,
      "sequence_id": 25,
      "role": "assistant",
      "type": "active_line",
      "content": "3",
      "created_at": "2024-11-21T23:33:40",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 48,
      "sequence_id": 26,
      "role": "assistant",
      "type": "output",
      "content": "\nDownloading and installing node v23.3.0...\nDownloading https://nodejs.org/dist/v23.3.0/node-v23.3.0-linux-x64.tar.xz...\n#=#=# ...\n                                                                           0.1%\n#                                                                          1.6%\n###                                                                        5.3%\n#######                                                                   10.8%\n###########                                                               15.9%\n##############                                                            20.1%\n######################                                                    31.0%\n#########################                                                 35.7%\n#############################                                             41.2%\n#######################################                                   54.8%\n##############################################                            63.9%\n#######################################################                   76.7%\n###############################################################           88.1%\n######################################################################## 100.0%\nComputing checksum with sha256sum\nChecksums matched!\nNow using node v23.3.0 (npm v10.9.0)\nCreating default alias: default -> node (-> v23.3.0 *)",
      "created_at": "2024-11-21T23:33:49",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 49,
      "sequence_id": 27,
      "role": "assistant",
      "type": "active_line",
      "content": "None",
      "created_at": "2024-11-21T23:33:50",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 50,
      "sequence_id": 28,
      "role": "assistant",
      "type": "message",
      "content": "Great! Now that we have Node.js installed, let's run our Hello World program:",
      "created_at": "2024-11-21T23:33:52",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 51,
      "sequence_id": 29,
      "role": "assistant",
      "type": "confirmation",
      "format": "javascript",
      "content": "\"console.log(\\\"Hello, World!\\\");\"",
      "created_at": "2024-11-21T23:33:52",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 52,
      "sequence_id": 30,
      "role": "assistant",
      "type": "code",
      "format": "javascript",
      "content": "console.log(\"Hello, World!\");",
      "created_at": "2024-11-21T23:33:53",
      "is_end": true,
      "is_start": true
    },
    {
      "id": 53,
      "sequence_id": 31,
      "role": "assistant",
      "type": "output",
      "content": "Traceback (most recent call last): ... FileNotFoundError: [Errno 2] No such file or directory: 'node'",
      "created_at": "2024-11-21T23:33:53",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 54,
      "sequence_id": 32,
      "role": "assistant",
      "type": "active_line",
      "content": "None",
      "created_at": "2024-11-21T23:33:57",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 55,
      "sequence_id": 33,
      "role": "assistant",
      "type": "message",
      "content": "I apologize for the continued issues. Let's try running the Node.js command directly through the shell:",
      "created_at": "2024-11-21T23:33:59",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 56,
      "sequence_id": 34,
      "role": "assistant",
      "type": "confirmation",
      "format": "shell",
      "content": "\"node -e 'console.log(\\\"Hello, World!\\\")'\"",
      "created_at": "2024-11-21T23:33:59",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 57,
      "sequence_id": 35,
      "role": "assistant",
      "type": "code",
      "format": "shell",
      "content": "node -e 'console.log(\"Hello, World!\")'",
      "created_at": "2024-11-21T23:34:05",
      "is_end": true,
      "is_start": true
    },
    {
      "id": 58,
      "sequence_id": 36,
      "role": "assistant",
      "type": "active_line",
      "content": "1",
      "created_at": "2024-11-21T23:34:05",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 59,
      "sequence_id": 37,
      "role": "assistant",
      "type": "output",
      "content": "\nHello, World!\n",
      "created_at": "2024-11-21T23:34:06",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 60,
      "sequence_id": 38,
      "role": "assistant",
      "type": "active_line",
      "content": "None",
      "created_at": "2024-11-21T23:34:07",
      "is_end": false,
      "is_start": false
    },
    {
      "id": 61,
      "sequence_id": 39,
      "role": "assistant",
      "type": "message",
      "content": "Perfect! We've successfully run our JavaScript \"Hello World\" program! \n\nHere's an explanation of the code:\n```javascript\nconsole.log(\"Hello, World!\");\n```\n\nThis simple JavaScript code does the following:\n1. `console.log()` is a function that prints text to the console\n2. `\"Hello, World!\"` is a string that we're printing\n\nThe code successfully output \"Hello, World!\" to the console. This is the most basic JavaScript program you can write, and it's often used as a first example when learning a new programming language.\n\nWould you like to try any other JavaScript examples or learn about more complex JavaScript concepts?",
      "created_at": "2024-11-21T23:34:10",
      "is_end": false,
      "is_start": false
    }
  ]  

export default ChatSection;
