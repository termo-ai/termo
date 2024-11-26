import React from "react";
import ChatSection from "../components/chatItems/ChatSection";
import SidebarSection from "../components/chatItems/SidebarSection";

const Home = () => {
  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      <SidebarSection />
      <ChatSection />
    </div>
  );
};

export default Home;
