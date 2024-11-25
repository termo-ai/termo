import React from "react";
import ChatSection from "../components/chatItems/ChatSection";

const Home = () => {
    return (
        <div className="flex h-screen w-screen bg-gray-800 text-white">
            {/* Sidebar */}
            <div className="w-1/6 bg-gray-800 flex flex-col justify-between">
                {/* Top Section */}
                <div className="p-4">
                    <h1 className="text-xl font-bold">Termo AI</h1>
                    <p className="text-sm mt-2">Reconnecting...</p>
                </div>

                {/* Middle Section */}
                <div className="p-4">
                    <h2 className="text-lg font-semibold">Conversations</h2>
                    <button className="mt-4 bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
                        New Chat
                    </button>
                </div>

                {/* Bottom Section */}
                <div className="p-4">
                    <p className="text-sm text-gray-400">Footer or any other info here</p>
                </div>
            </div>
            <ChatSection/>
        </div>
    );
};

export default Home;
