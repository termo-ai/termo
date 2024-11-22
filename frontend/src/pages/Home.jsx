import React from "react";

const Home = () => {
  return (
  <div className="flex h-screen w-screen bg-gray-800 text-white">
    {/* Sidebar */}
    <div className="w-1/4 bg-gray-900 flex flex-col justify-between">
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

    {/* Main Content */}
    <div className="w-3/4 flex flex-col">
      {/* Top Section */}
      <div className="flex justify-between items-center bg-gray-700 p-4">
        <button className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">
          Clear Chat
        </button>
        <button className="bg-gray-600 px-4 py-2 rounded hover:bg-gray-500">
          Export Chat
        </button>
      </div>

      {/* Chat Section */}
      <div className="flex-1 p-4 overflow-y-auto bg-gray-800">
        <div className="text-gray-300">
          {/* Example chat messages */}
          <p>User: Hello!</p>
          <p>AI: Hi there! How can I help you?</p>
        </div>
      </div>

      {/* Input Section */}
      <div className="p-4 bg-gray-700">
        <input
          type="text"
          placeholder="Type your message..."
          className="w-full bg-gray-600 text-white px-4 py-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  </div>
  );
};

export default Home;
