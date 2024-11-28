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

    const handleAddChat = () => {
        const createChat = async () => {
            try{
                const createResponse = await fetch('api/conversations/', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        title: 'New Chat'
                    })
                });

                if(!createResponse.ok){
                    throw new Error(`HTTP error! status: ${createResponse.status}`);
                };

                const conversation = await createResponse.json();
                setActiveChat(conversation.id);
                setChats((prevChats) => [
                    { id: conversation.id, name: "New Chat" },
                    ...prevChats,
                ]);
            }catch (error){
                console.log("Error creating new chat: ", error)
            }
        }
        createChat();
    };

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
                onCreateChat={handleAddChat}
            />
            <ChatSection 
                messages={messages}
                setMessages={setMessages}
                onCreateChat={handleAddChat}
                activeChat={activeChat}
            />
        </div>
    );
};

export default Home;
