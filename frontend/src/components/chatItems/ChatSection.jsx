import React, { useState, useEffect } from 'react';
import InputSection from './InputSection';
import HeaderSection from './HeaderSection';
import Prism from 'prismjs';
import 'prismjs/themes/prism-okaidia.css';

const ChatSection = () => {
    // #region MAIN STATES & EFFECTS
    const [messages, setMessages] = useState([]);
    const [currentMessage, setCurrentMessage] = useState(null);

    useEffect(() => {
        Prism.highlightAll();
    }, [messages]);

    // #region Handle Chunk
    const handleMessageChunk = (content) => {
        if (!currentMessage) {
            const newMessage = {
                content: content,
                type: 'text'
            };
            setCurrentMessage(newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        } else {
            currentMessage.content += content;
            setMessages(prevMessages => [...prevMessages.slice(0, -1), currentMessage]);
        }
    };

    // #region Hanlde Code Chunk
    const handleCodeChunk = (code, language) => {
        if (!currentMessage || currentMessage.type !== 'code') {
            const newMessage = {
                type: 'code',
                content: code,
                language: language || 'plaintext',
                formatted: false  // Indica si el código ya ha sido formateado para visualización
            };
            setCurrentMessage(newMessage);
            setMessages(prevMessages => [...prevMessages, newMessage]);
        } else {
            currentMessage.content += code;
            setMessages(prevMessages => [...prevMessages.slice(0, -1), currentMessage]);
        }
    };
    

    // #region Handle Send
    const handleSend = (message) => {
        handleMessageChunk(message);
        setCurrentMessage(null); 
    };

    const handleSendCode = (code, language) => {
        handleCodeChunk(code, language);
    };

    console.log(messages)
    return (
        <div className="h-full w-full flex flex-col bg-gray-900">
            <HeaderSection/>  
            {messages && messages.length > 0 ? (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    {messages.map((msg, index) => (
                        <div key={index} className="bg-gray-800/50 rounded-lg p-4 mb-4">
                            {msg.type === 'text' && <div>{msg.content}</div>}
                            {msg.type === 'code' && (
                                <pre className={`language-${msg.language}`}>
                                    <code>{msg.content}</code>
                                </pre>
                            )}
                        </div>
                    ))}
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto p-4 space-y-4">
                    <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
                        <h2 className="text-xl font-bold mb-2">Welcome to Termo AI</h2>
                        <p className="text-gray-300">Start by typing a command or asking a question below.</p>
                    </div>
                </div>
            )} 
            <InputSection
                onSend={handleSend}
                onSendCode={handleSendCode}
            />
        </div>
    );
};

export default ChatSection;
