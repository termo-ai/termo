import React, { useState, useEffect, useRef } from 'react';
import InputSection from './InputSection';
import HeaderSection from './HeaderSection';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';
import Expand from '../icons/expand.svg';
import User from '../icons/user-alt.svg';
import Bot from '../icons/robot.svg';
import Delete from '../icons/trash.svg';
import Copy from '../icons/copy.svg';
import Compress from '../icons/compress.svg'
import Check from '../icons/check.svg';
import Pendig from '../icons/clock.svg';
import Cancel from '../icons/uncheck.svg';

const ChatSection = () => {
    // #region States Refs & Effects
    const [messages, setMessages] = useState([]);
    const [messageGroups, setMessageGroups] = useState([]);
    const [expanded, setExpanded] = useState({});
    const outputRef = useRef(null);

    useEffect(() => {
        Prism.highlightAll();
    }, [messages]);

    useEffect(() => {
        const groupedMessages = [];
        let currentGroup = [];

        messages.forEach((message) => {
            if (message.role === 'assistant') {
                currentGroup.push(message);
                // Check if the message is 'output' with meaningful content
                if (message.type === 'output' && message.content.trim() && message.content !== '\n' && message.content !== '\n\n') {
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

    useEffect(() => {
        const fetchMessages = async () => {
            try {
                console.log("Fetching messages...");
                const messagesResponse = await fetch(`/api/conversations/6/messages`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                });
    
                if (!messagesResponse.ok) {
                    throw new Error(`HTTP error! status: ${messagesResponse.status}`);
                }
    
                const responseText = await messagesResponse.text();
                const fetchedMessages = JSON.parse(responseText); // Convert manually
                console.log("Fetched messages:", fetchedMessages);
    
                setMessages(fetchedMessages);
            } catch (error) {
                console.error("Error fetching messages:", error);
            }
        };
    
        fetchMessages();
    }, []);       

    // #region Functios
    const clearMessages = () => {
        if (window.confirm("Are you sure you want to clear the chat? This action cannot be undone.")) {
            console.log("Clearing chat...");
            setMessages([]);
        } else {
            console.log("Clear chat canceled.");
        }
    };

    const expand = (messageId) => {
        setExpanded(prevState => ({
            ...prevState,
            [messageId]: !prevState[messageId],  // Change the status of corresponding message
        }));
    };

    const exportChat = () => {
        if (!messages.length) {
            console.log("No messages to export.");
            return;
        }
    
        // Create JSON content from messages
        const fileContent = JSON.stringify(messages, null, 2); // Formatted for easy reading
        const blob = new Blob([fileContent], { type: "application/json" });
    
        // Create a temporary link to download the file
        const link = document.createElement("a");
        link.href = URL.createObjectURL(blob);
        link.download = `chat_export_${new Date().toISOString()}.json`; // Dynamic name based on current date
        document.body.appendChild(link);
        link.click();
    
        // Clean the link after use
        document.body.removeChild(link);
        console.log("Chat exported successfully.");
    };
    

    const copyToClipboard = (content) => {
        navigator.clipboard.writeText(content)
            .then(() => {
                console.log('Content copied to clipboard:', content);
            })
            .catch((error) => {
                console.error('Failed to copy content:', error);
            });
    };

    const handleSend = (message) => {
        setMessages((prevMessages) => {
            // Get ids
            const lastMessage = prevMessages[prevMessages.length - 1];
            const nextId = lastMessage?.id
                ? parseInt(lastMessage.id, 10) + 1 
                : 1 // If there are no previous messages, start from 1
            const nextSequenceId = lastMessage?.sequence_id
                ? parseInt(lastMessage.sequence_id, 10) + 1
                : 1; // If there are no previous messages, start from 1

            // Create new message
            const newMessage = {
                id: nextId, 
                sequence_id: nextSequenceId,
                role: "user",
                type: "message",
                content: message,
                created_at: new Date().toISOString(),
                is_end: false,
                is_start: false,
                status: null,
            };
    
            // Return new messages
            return [...prevMessages, newMessage];
        });
    };

    const handleDelete = (groupIdx) => {
        setMessageGroups((prevGroups) => {
            // Elimina el grupo con el índice especificado
            const updatedGroups = [...prevGroups];
            updatedGroups.splice(groupIdx, 1);
            return updatedGroups;
        });
    
        setMessages((prevMessages) => {
            // Filtra los mensajes eliminados para reflejar la nueva estructura
            const messagesToRemove = messageGroups[groupIdx].map((msg) => msg.id);
            return prevMessages.filter((msg) => !messagesToRemove.includes(msg.id));
        });
    
        console.log(`Group ${groupIdx} deleted successfully.`);
    };

    const updateMessageStatus = (messageId, newStatus) => {
        setMessages((prevMessages) => {
            const updatedMessages = prevMessages.map((message, index) => {
                // id matches, update status
                if (message.id === messageId) {
                    return { ...message, status: newStatus };
                }  
                // update next message (if it exists) at the same time
                if (prevMessages[index - 1]?.id === messageId) {
                    return { ...message, status: newStatus };
                }    
                return message;
            });
            return updatedMessages;
        });
    };

    // #region JSX Assistants
    const Message = ({ content, role }) => (
        <div className={`rounded-lg ${role === 'user' ? 'bg-gray-700 p-4' : 'bg-gray-600'}`}>
            <div className="flex items-center mb-2">
                <div className='invert mr-2'>
                    <img
                        src={role === 'user' ? User : Bot}
                        alt={role === 'user' ? 'You' : 'Assistant'}
                        height={role === 'user' ? "14" : "18"}
                        width={role === 'user' ? "14" : "18"}
                    />
                </div>
                <div className="font-bold">
                    {role === 'user' ? 'You' : 'Assistant'}
                </div>
            </div>
            {content}
        </div>
    );

    const Confirmation = ({ content, language, status, messageId }) => (
        <>
            <CodeBlock content={content} language={language} status={status}/>
            <div className="flex space-x-2 my-2">
                <button 
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
                    onClick={() => updateMessageStatus(messageId, 'Executed')} // Cambiar a 'Executed'
                >
                    Run Code
                </button>
                <button 
                    className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
                    onClick={() => updateMessageStatus(messageId, 'Canceled')} // Cambiar a 'Canceled'
                >
                    Cancel
                </button>
            </div>
        </>
    );

    const CodeBlock = ({ content, language, status }) => (
        <div className="mt-2 bg-gray-700 rounded-lg group relative">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-700 rounded-t-lg">
                <div className="flex items-center space-x-2">
                    <span className="text-sm font-mono">
                        {language || 'shell'}
                    </span>
                    <div className={`flex items-center code-execution-status text-sm px-2 rounded-md ${
                        status === 'Executed' ? 'bg-green-600/50 text-green-200' :
                        status === 'Canceled' ? 'bg-red-600/50 text-red-200' :
                        'bg-yellow-600/50 text-yellow-200'
                    }`}>
                        <div 
                            className='invert opacity-75 pr-1'
                            style={{
                            filter: status === 'Executed' ? 'brightness(0) saturate(100%) invert(85%) sepia(25%) saturate(455%) hue-rotate(90deg) brightness(100%) contrast(100%)' :
                                    status === 'Canceled' ? 'brightness(0) saturate(100%) invert(85%) sepia(25%) saturate(667%) hue-rotate(300deg) brightness(100%) contrast(100%)' :
                                    'brightness(0) saturate(100%) invert(85%) sepia(25%) saturate(545%) hue-rotate(10deg) brightness(100%) contrast(100%)',
                            }}
                        >
                            <img
                                src={status === 'Executed' ? Check : status === 'Canceled' ? Cancel : Pendig}
                                alt={status}
                                width="12"
                                height="12"
                            />
                        </div>
                        {status}
                    </div>
                </div>
                <div className="flex space-x-2">
                    <button 
                        onClick={() => copyToClipboard(content)} 
                        className="invert opacity-70 hover:opacity-100" 
                        title="Copy output"
                    >
                        <img
                            src={Copy}
                            alt="Copy"
                            width="14"
                            height="14"
                        />
                    </button>
                </div>
            </div>
            <pre className="p-4 m-0 overflow-x-auto bg-neutral-800">
                <code className={`language-${language || 'shell'}`}>
                    {content}
                </code>
            </pre>
        </div>
    );

    const Output = ({ content, messageId }) => (
        <div className="mt-2 bg-gray-700 rounded-lg group relative">
            <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg">
                <span className="text-sm text-white">
                    Output
                </span>
                <div className="flex flex-row space-x-4">
                    <button 
                        onClick={() => copyToClipboard(content)} 
                        className="invert opacity-70 hover:opacity-100" 
                        title="Copy output"
                    >
                        <img
                            src={Copy}
                            alt="Copy"
                            width="14"
                            height="14"
                        />
                    </button>
                    <button 
                        className="invert opacity-70 hover:opacity-100" 
                        title="Expand/Collapse"
                        onClick={() => expand(messageId)}  // Usar el messageId al hacer clic
                    >
                        <img
                            src={expanded[messageId] ? Compress : Expand}
                            alt={expanded[messageId] ? "Compress" : "Expand"}
                            width="14"
                            height="14"
                        />
                    </button>
                </div>
            </div>
            <div 
                ref={outputRef}
                className={`p-4 font-mono text-sm whitespace-pre-wrap bg-gray-700 overflow-auto
                    ${expanded[messageId] ? 'max-h-none' : 'max-h-60'}
                `}
            >
                {content}
            </div>
        </div>
    );

    // #region MAIN JSX
    return (
        <div className="h-full w-full flex flex-col bg-gray-900">
            <HeaderSection onClear={clearMessages} onExport={exportChat}/>
            {/* Main Content */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {messageGroups.length === 0 ? (
                    <div className="flex-1 overflow-y-auto p-4 space-y-4">
                        <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                            <h2 className="text-xl font-bold mb-2">Welcome to Termo AI</h2>
                            <p className="text-gray-300">Start by typing a command or asking a question below.</p>
                        </div>
                    </div>
                ) : (
                    messageGroups.map((group, groupIdx) => {
                        const isAssistantGroup = group.length > 0 && group[0].role === 'assistant';
                        const isLastGroup = groupIdx === messageGroups.length - 1;;
                            return (
                                <div
                                    key={groupIdx}
                                    className={`space-y-4 ${isAssistantGroup ? 'bg-gray-600 rounded-lg p-4' : ''}`}
                                >
                                    {isAssistantGroup ? (
                                        <div className='relative'>
                                            {isLastGroup && (
                                                <button 
                                                    onClick={() => handleDelete(groupIdx)}
                                                    className='absolute top-0 right-3'
                                                >
                                                    <div className='invert opacity-60 hover:opacity-100'>
                                                        <img
                                                            src={Delete}
                                                            alt='Delete'
                                                            width='16'
                                                            height='16'
                                                        />
                                                    </div>
                                                </button>
                                            )}
                                            {group.filter(msg => msg.content.trim() && msg.content !== '\n' && msg.content !== '\n\n').map((msg, msgIdx) => {
                                                switch (msg.type) {
                                                    case 'message':
                                                        return <Message key={msgIdx} content={msg.content} role={msg.role} />;
                                                    case 'confirmation':
                                                        if (msg.status === 'Pending') {
                                                            return <Confirmation key={msgIdx} content={msg.content} language={msg.format} status={msg.status} messageId={msg.id} />;
                                                        }
                                                    break;
                                                    case 'code':
                                                        if (msg.status !== 'Pending') {
                                                            return <CodeBlock key={msgIdx} content={msg.content} language={msg.format} status={msg.status} />;
                                                        }
                                                    break;
                                                    case 'output':
                                                        return <Output key={msgIdx} content={msg.content} messageId={msg.id} />;
                                                    default:
                                                    return null;
                                                }
                                            })}
                                        </div>
                                    ) : (
                                        group.map((msg, msgIdx) => (
                                            <div className='relative'>
                                                {isLastGroup && (
                                                    <button 
                                                        onClick={() => handleDelete(msgIdx)}
                                                        className='absolute top-4 right-7'
                                                    >
                                                        <div className='invert opacity-60 hover:opacity-100'>
                                                            <img
                                                                src={Delete}
                                                                alt='Delete'
                                                                width='16'
                                                                height='16'
                                                            />
                                                        </div>
                                                    </button>
                                                )}
                                                <Message
                                                    key={msgIdx}
                                                    content={msg.content}
                                                    role={msg.role}
                                                />
                                            </div>
                                        ))
                                    )}
                                </div>
                            );
                    })
                )}
            </div>
            <InputSection onSend={handleSend} />
        </div>
    );
};

// #region Initial Messages
/* const initialMessages = [
    {
        "id": 23,
        "sequence_id": 1,
        "role": "user",
        "type": "message",
        "content": "write the code for a hellow world in javascript",
        "created_at": "2024-11-21T23:32:02",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 24,
        "sequence_id": 2,
        "role": "assistant",
        "type": "message",
        "content": "I'll help you write a simple \"Hello World\" program in JavaScript. Let me execute that for you.",
        "created_at": "2024-11-21T23:32:06",
        "is_end": false,
        "is_start": false,
        "status": null
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
        "is_start": false,
        "status": "Executed"
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
        "is_start": true,
        "status": "Executed"
    },
    {
        "id": 27,
        "sequence_id": 5,
        "role": "assistant",
        "type": "output",
        "content": "Traceback (most recent call last): ... FileNotFoundError: [Errno 2] No such file or directory: 'node'",
        "created_at": "2024-11-21T23:32:13",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 28,
        "sequence_id": 6,
        "role": "assistant",
        "type": "active_line",
        "content": "None",
        "created_at": "2024-11-21T23:32:16",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 29,
        "sequence_id": 7,
        "role": "assistant",
        "type": "message",
        "content": "I see that Node.js is not installed on your system. Let me help you install Node.js first using the shell, and then we'll run our JavaScript code.",
        "created_at": "2024-11-21T23:32:18",
        "is_end": false,
        "is_start": false,
        "status": null
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
        "is_start": false,
        "status": "Executed"
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
        "is_start": true,
        "status": "Executed"
    },
    {
        "id": 32,
        "sequence_id": 10,
        "role": "assistant",
        "type": "output",
        "content": "bash: line 1: sudo: command not found\ncurl: (23) Failed writing body",
        "created_at": "2024-11-21T23:33:14",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 33,
        "sequence_id": 11,
        "role": "assistant",
        "type": "active_line",
        "content": "None",
        "created_at": "2024-11-21T23:33:16",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 34,
        "sequence_id": 12,
        "role": "assistant",
        "type": "message",
        "content": "I apologize for the confusion. It seems we don't have sudo access. Let's try an alternative approach using NVM (Node Version Manager) which doesn't require root privileges.",
        "created_at": "2024-11-21T23:33:18",
        "is_end": false,
        "is_start": false,
        "status": null
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
        "is_start": false,
        "status": "Executed"
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
        "is_start": true,
        "status": "Executed"
    },
    {
        "id": 37,
        "sequence_id": 15,
        "role": "assistant",
        "type": "active_line",
        "content": "1",
        "created_at": "2024-11-21T23:33:28",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 38,
        "sequence_id": 16,
        "role": "assistant",
        "type": "output",
        "content": "=> Downloading nvm as script to '/root/.nvm'\n=> Appending nvm source string to /root/.bashrc\n=> Appending bash_completion source string to /root/.bashrc\n=> Close and reopen your terminal to start using nvm or run the following to use it now:\n\nexport NVM_DIR=\"$HOME/.nvm\"\n[ -s \"$NVM_DIR/nvm.sh\" ] && \\. \"$NVM_DIR/nvm.sh\"  # This loads nvm\n[ -s \"$NVM_DIR/bash_completion\" ] && \\. \"$NVM_DIR/bash_completion\"  # This loads nvm bash_completion",
        "created_at": "2024-11-21T23:33:30",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 39,
        "sequence_id": 17,
        "role": "assistant",
        "type": "active_line",
        "content": "None",
        "created_at": "2024-11-21T23:33:32",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 40,
        "sequence_id": 18,
        "role": "assistant",
        "type": "message",
        "content": "Now let's source NVM and install Node.js:",
        "created_at": "2024-11-21T23:33:34",
        "is_end": false,
        "is_start": false,
        "status": null
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
        "is_start": false,
        "status": "Executed"
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
        "is_start": true,
        "status": "Executed"
    },
    {
        "id": 43,
        "sequence_id": 21,
        "role": "assistant",
        "type": "active_line",
        "content": "1",
        "created_at": "2024-11-21T23:33:40",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 44,
        "sequence_id": 22,
        "role": "assistant",
        "type": "output",
        "content": "\n",
        "created_at": "2024-11-21T23:33:40",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 45,
        "sequence_id": 23,
        "role": "assistant",
        "type": "active_line",
        "content": "2",
        "created_at": "2024-11-21T23:33:40",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 46,
        "sequence_id": 24,
        "role": "assistant",
        "type": "output",
        "content": "\n",
        "created_at": "2024-11-21T23:33:40",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 47,
        "sequence_id": 25,
        "role": "assistant",
        "type": "active_line",
        "content": "3",
        "created_at": "2024-11-21T23:33:40",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 48,
        "sequence_id": 26,
        "role": "assistant",
        "type": "output",
        "content": "\nDownloading and installing node v23.3.0...\nDownloading https://nodejs.org/dist/v23.3.0/node-v23.3.0-linux-x64.tar.xz...\n#=#=# ...\n                                                                           0.1%\n#                                                                          1.6%\n###                                                                        5.3%\n#######                                                                   10.8%\n###########                                                               15.9%\n##############                                                            20.1%\n######################                                                    31.0%\n#########################                                                 35.7%\n#############################                                             41.2%\n#######################################                                   54.8%\n##############################################                            63.9%\n#######################################################                   76.7%\n###############################################################           88.1%\n######################################################################## 100.0%\nComputing checksum with sha256sum\nChecksums matched!\nNow using node v23.3.0 (npm v10.9.0)\nCreating default alias: default -> node (-> v23.3.0 *)",
        "created_at": "2024-11-21T23:33:49",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 49,
        "sequence_id": 27,
        "role": "assistant",
        "type": "active_line",
        "content": "None",
        "created_at": "2024-11-21T23:33:50",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 50,
        "sequence_id": 28,
        "role": "assistant",
        "type": "message",
        "content": "Great! Now that we have Node.js installed, let's run our Hello World program:",
        "created_at": "2024-11-21T23:33:52",
        "is_end": false,
        "is_start": false,
        "status": null
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
        "is_start": false,
        "status": "Executed"
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
        "is_start": true,
        "status": "Executed"
    },
    {
        "id": 53,
        "sequence_id": 31,
        "role": "assistant",
        "type": "output",
        "content": "Traceback (most recent call last): ... FileNotFoundError: [Errno 2] No such file or directory: 'node'",
        "created_at": "2024-11-21T23:33:53",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 54,
        "sequence_id": 32,
        "role": "assistant",
        "type": "active_line",
        "content": "None",
        "created_at": "2024-11-21T23:33:57",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 55,
        "sequence_id": 33,
        "role": "assistant",
        "type": "message",
        "content": "I apologize for the continued issues. Let's try running the Node.js command directly through the shell:",
        "created_at": "2024-11-21T23:33:59",
        "is_end": false,
        "is_start": false,
        "status": null
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
        "is_start": false,
        "status": "Pending"
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
        "is_start": true,
        "status": "Pending"
    },
    {
        "id": 58,
        "sequence_id": 36,
        "role": "assistant",
        "type": "active_line",
        "content": "1",
        "created_at": "2024-11-21T23:34:05",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 59,
        "sequence_id": 37,
        "role": "assistant",
        "type": "output",
        "content": "\nHello, World!\n",
        "created_at": "2024-11-21T23:34:06",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 60,
        "sequence_id": 38,
        "role": "assistant",
        "type": "active_line",
        "content": "None",
        "created_at": "2024-11-21T23:34:07",
        "is_end": false,
        "is_start": false,
        "status": null
    },
    {
        "id": 61,
        "sequence_id": 39,
        "role": "assistant",
        "type": "message",
        "content": "Perfect! We've successfully run our JavaScript \"Hello World\" program! \n\nHere's an explanation of the code:\n```javascript\nconsole.log(\"Hello, World!\");\n```\n\nThis simple JavaScript code does the following:\n1. `console.log()` is a function that prints text to the console\n2. `\"Hello, World!\"` is a string that we're printing\n\nThe code successfully output \"Hello, World!\" to the console. This is the most basic JavaScript program you can write, and it's often used as a first example when learning a new programming language.\n\nWould you like to try any other JavaScript examples or learn about more complex JavaScript concepts?",
        "created_at": "2024-11-21T23:34:10",
        "is_end": false,
        "is_start": false,
        "status": null
    }
] */

export default ChatSection;
