import React from 'react';
import InputSection from './InputSection';
import HeaderSection from './HeaderSection';

const ChatSection = () => {
    return (
        <div className="h-full w-full flex flex-col bg-gray-900">
            <HeaderSection/>   
            <div class="flex-1 overflow-y-auto p-4 space-y-4">
                <div class="bg-gray-800/50 rounded-lg p-4 mb-4">
                    <h2 class="text-xl font-bold mb-2">Welcome to Termo AI</h2>
                    <p class="text-gray-300">Start by typing a command or asking a question below.</p>
                </div>
            </div>
            <InputSection/>
        </div>
    );
};

export default ChatSection;
