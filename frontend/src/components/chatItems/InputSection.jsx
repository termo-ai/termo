import React from 'react';

const InputSection = () => {
    return (
        <div class="p-4 bg-gray-800 border-t border-gray-700">
            <div class="flex space-x-4">
                <div class="flex-1 relative">
                    <textarea
                        class="w-full bg-gray-700 text-white rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                        placeholder="Type your message here... (Shift + Enter for new line)"
                        rows="3">
                    </textarea>
                    <div class="absolute right-3 bottom-3 text-gray-400 text-sm">0</div>
                </div>
                <button class="bg-blue-600 hover:bg-blue-700 text-white px-6 rounded-lg flex items-center">
                    <span>Send</span>
                    {/* add paper plane icon */}
                </button>
            </div>
        </div>
    );
};

export default InputSection;
