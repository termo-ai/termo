import React from 'react';

const HeaderSection = ({ onClear, onExport }) => {
    return (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
            <div className="flex space-x-4">
                <button 
                    onClick={onClear} 
                    className="text-sm text-gray-400 hover:text-white flex items-center"
                >
                    {/* Add trash/delete icon */}
                    Clear Chat
                </button>
                <button 
                    onClick={onExport}
                    className="text-sm text-gray-400 hover:text-white flex items-center"
                >
                    {/* Add export/download icon */}
                    Export Chat
                </button>
            </div>
        </div>
    );
};

export default HeaderSection;
