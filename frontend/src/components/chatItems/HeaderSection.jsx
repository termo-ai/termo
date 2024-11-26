import React from 'react';
import Clear from '../icons/trash.svg';
import Export from '../icons/download.svg';

const HeaderSection = ({ onClear, onExport }) => {
    return (
        <div className="bg-gray-800 p-4 border-b border-gray-700">
            <div className="flex space-x-4">
                <button 
                    onClick={onClear} 
                    className="flex flex-row items-baseline text-sm text-gray-400 hover:text-white group"
                >
                    <div className='invert opacity-60 group-hover:opacity-100 mx-1'>
                        <img
                            src={Clear}
                            alt="Clear"
                            width="12"
                            height="12"
                        />
                    </div>
                    Clear Chat
                </button>
                <button 
                    onClick={onExport}
                    className="flex flex-row items-baseline text-sm text-gray-400 hover:text-white group"
                >
                    <div className='invert opacity-60 group-hover:opacity-100 mx-1'>
                        <img
                            src={Export}
                            alt="Clear"
                            width="12"
                            height="12"
                        />
                    </div>
                    Export Chat
                </button>
            </div>
        </div>
    );
};

export default HeaderSection;
