import React, { useState } from "react";
import ChatSection from "../components/chatItems/ChatSection";

const Home = () => {
  const [chats, setChats] = useState([]);

  const handleAddChat = () => {
    setChats((prevChats) => [
      ...prevChats,
      { id: Date.now(), name: "New Chat" },
    ]);
  };

  const handleDeleteChat = (id) => {
    setChats((prevChats) => prevChats.filter((chat) => chat.id !== id));
  };

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      {/* Sidebar */}
      <div className="w-1/4 bg-gray-900 flex flex-col justify-between h-screen">
        {/* Top Section */}
        <div className="border-b border-stone-400">
          <div className="p-4">
            <h1 className="text-xl font-bold">Termo AI</h1>
            <div className="flex items-center mt-2 gap-2">
              <div className="w-2 h-2 bg-green-700 rounded-full"></div>
              <p className="text-sm">Reconnecting...</p>
            </div>
          </div>
        </div>

        {/* Middle Section */}
        <div className="p-4 grow">
          <div>
            <p className="text-md text-stone-300 font-bold">Conversation</p>
          </div>
          <button
            onClick={handleAddChat}
            className="mt-4 px-4 py-1 text-gray-300 rounded hover:bg-gray-300 hover:text-gray-800 transition"
          >
            Add New Chat
          </button>
          {/* Chat List */}
          <div className="mt-4 flex flex-col gap-1">
            {chats.map((chat) => (
              <div
                key={chat.id}
                className="flex items-center justify-between px-4 py-1 bg-gray-800 rounded group hover:bg-gray-300 hover:text-gray-800 transition"
              >
                <span>{chat.name}</span>
                <button
                  onClick={() => handleDeleteChat(chat.id)}
                  className="text-gray-100 opacity-0 group-hover:opacity-100 group-hover:text-gray-500 hover:!text-red-600 transition"
                >
                  trash
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-stone-400">
          <div className="p-4">
            <button className="text-sm text-gray-400">
              Directory Structure
            </button>
            <div className="flex flex-col">
              <button className="mt-4 px-4 py-1 text-gray-300 rounded hover:bg-gray-300 hover:text-gray-800 transition border border-stone-400">
                Upload File
              </button>
              <button className="mt-4 px-4 py-1 text-gray-300 rounded hover:bg-gray-300 hover:text-gray-800 transition">
                Conversation Db
              </button>
            </div>
          </div>
          <div className="border-t border-stone-400 flex flex-col p-4">
            <button className="px-4 py-1 text-gray-300 rounded hover:bg-gray-300 hover:text-gray-800 transition">
              Toggle Time
            </button>
          </div>
        </div>
      </div>

      <ChatSection/>
    </div>
  );
};

export default Home;
