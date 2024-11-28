import React, {useState, useEffect} from "react";
import ChatSection from "../components/chatItems/ChatSection";
import SidebarSection from "../components/chatItems/SidebarSection";

const Home = () => {
  const [chats, setChats] = useState([]);
  const [activeChat, setActiveChat] = useState(null);
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const conversationsResponse = await fetch('api/conversations/', {
          headers: {
            'Accept': 'application/json',
          },
        });
  
        if (!conversationsResponse.ok) {
          throw new Error(`HTTP error! status: ${conversationsResponse.status}`);
        };
  
        const responseText = await conversationsResponse.text();
        const fetchedConversations = JSON.parse(responseText); // Convert manually
        setChats(fetchedConversations);
      } catch (error) {
        console.error("Error fetching conversations: ", error);
      }
    };

    const getActiveConversation = async () => {
       try {
        const activeResponse = await fetch('api/conversations/active', {
          headers: {
            'Accept': 'application/json',
          },
        });
        if (!activeResponse.ok) {
          throw new Error(`HTTP error! status: ${activeResponse.status}`);
        }
    
        const responseText = await activeResponse.text();
        const activeConversation = JSON.parse(responseText);
        setActiveChat(activeConversation.id);
      } catch (error) {
        console.error("Error getting active chat:", error);
      }
    };
    
    fetchConversations();
    getActiveConversation();
  }, []);

  useEffect(() => {
  const fetchMessages = async () => {
    if(activeChat){
      try {
        const messagesResponse = await fetch(`/api/conversations/${activeChat}/messages`, {
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!messagesResponse.ok) {
          throw new Error(`HTTP error! status: ${messagesResponse.status}`);
        }

        const responseText = await messagesResponse.text();
        const fetchedMessages = JSON.parse(responseText); // Convert manually

        setMessages(fetchedMessages);
      } catch (error) {
        console.error("Error fetching messages:", error);
      };
    };
  }
        
  fetchMessages();
  }, [activeChat]);  

  useEffect(() => {
    console.log('activeChat', activeChat)
  }, [activeChat])

  return (
    <div className="flex h-screen w-screen bg-gray-800 text-white">
      <SidebarSection
        chats={chats}
        setChats={setChats}
        activeChat={activeChat}
        setActiveChat={setActiveChat}
        messages={messages}
        setMessages={setMessages}
      />
      <ChatSection 
        messages={messages}
        setMessages={setMessages}
      />
    </div>
  );
};

export default Home;
