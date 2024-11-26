import React from 'react';

const HeaderSection = ({ onClear }) => {
    return (
        <div class="bg-gray-800 p-4 border-b border-gray-700">
            <div class="flex space-x-4">
                <button 
                    onClick={onClear} 
                    class="text-sm text-gray-400 hover:text-white flex items-center"
                >
                    {/* Add trash/delete icon */}
                    Clear Chat
                </button>
                <button onclick="exportChat()" class="text-sm text-gray-400 hover:text-white flex items-center">
                    {/* Add export/download icon */}
                    Export Chat
                </button>
            </div>
        </div>
    );
};

export default HeaderSection;
