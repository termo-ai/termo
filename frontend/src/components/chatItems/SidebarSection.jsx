import React, { useContext, useState, useEffect } from "react";
import ChatIcon from "../icons/comment.svg";
import Delete from "../icons/trash.svg";
import Tree from "../icons/structure.svg";
import Upload from "../icons/upload.svg";
import File from "../icons/file.svg";
import Moon from "../icons/moon.svg";
import { WebsocketContext } from "../../context/WebsocketContext";

const SidebarSection = ({chats, setChats, activeChat, setActiveChat, messages, setMessages, onCreateChat}) => {
    const { connectionStatus } = useContext(WebsocketContext);

    const handleDeleteChat = (id) => {
        if (window.confirm("Are you sure you want to delete this chat? This action cannot be undone.")) {
            const deleteChat = async () => {
                try {
                    const deleteResponse = await fetch(`api/conversations/${id}`, {
                        headers: {
                            'Accept': 'application/json',
                        },
                        method: 'DELETE',
                    });
                    if (!deleteResponse.ok) {
                        throw new Error(`HTTP error! status: ${deleteResponse.status}`);
                    }

                    const responsesText = await deleteResponse.text();
                    const deleteResult = JSON.parse(responsesText);
                    console.log("Chat deleted successfully:", deleteResult);
                } catch (error) {
                    console.log("Error deleting chat: ", error);
                }
            };

            deleteChat();
            setChats((prevChats) => prevChats.filter((chat) => chat.id !== id));
            setActiveChat(null);
            setMessages([]);
        } else {
            console.log("Delete chat canceled.");
        }
    };  

    const handleChangeChat = (id) => {
        const getNewActive = async () => {
            try{
                const newActiveResponse = await fetch (`api/conversations/${id}/activate`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    method: 'POST',
                });
                if(!newActiveResponse.ok){
                    throw new Error(`HTTP error! status: ${newActiveResponse.status}`)
                }

                const loadResponse = await fetch (`api/conversations/${id}/load`, {
                    headers: {
                        'Accept': 'application/json',
                    },
                    method: 'POST',
                });
                if(!loadResponse.ok){
                    throw new Error(`HTTP error! status: ${loadResponse.status}`)
                }

                const responseText = await newActiveResponse.text();
                const loadResponseText = await loadResponse.text();
                const activeConversation = JSON.parse(responseText); // What I do with this?
                const loadResult = JSON.parse(loadResponseText);

                setActiveChat(id);
            }catch(error){
                console.log("Error getting new active chat: ", error)
            }
        }

        getNewActive();
    }

    return (
        <div className="w-1/6 bg-gray-800 flex flex-col justify-between h-screen border-r border-gray-700">
            {/* Top Section */}
            <div className="border-b border-gray-700">
                <div className="p-4">
                    <h1 className="text-xl font-bold">Termo AI</h1>
                    <div className="flex items-center mt-2 gap-2">
                        <div
                            className={`w-2 h-2 ${
                                connectionStatus === "Connected"
                                    ? "bg-green-700"
                                    : "bg-yellow-500"
                            } rounded-full`}
                        ></div>
                        <p className="text-sm">{connectionStatus}</p>
                    </div>
                </div>
            </div>

            {/* Middle Section */}
            <div className="p-4 grow">
                <div>
                    <div className="text-md text-stone-300 font-bold flex flex-row items-center">
                        <div className="invert opacity-60 pr-2">
                            <img src={ChatIcon} alt="Chat" width="14" height="14" />
                        </div>
                        Conversation
                    </div>
                </div>
                <button
                    onClick={onCreateChat}
                    className="mt-4 pl-2 pr-4 py-2 text-gray-300 rounded-lg hover:bg-gray-500/50 transition flex items-center"
                >
                    <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={2.5}
                        stroke="currentColor"
                        className="w-5 h-5 mr-2"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 4.5v15m7.5-7.5h-15"
                        />
                    </svg>
                    New Chat
                </button>
                {/* Chat List */}
                <div className="mt-4 flex flex-col gap-1">
                    {chats.map((chat) => (
                    <div
                        key={chat.id}
                        className={`flex items-center justify-between px-4 py-2 text-gray-300 ${activeChat === chat.id ? 'bg-gray-500/50' : 'bg-gray-800'} rounded-lg group hover:bg-gray-500/50 transition`}
                        onClick={() => handleChangeChat(chat.id)}
                    >
                        <div className="flex flex-row space-x-3 items-center">
                            <div className="invert opacity-60">
                                <img src={ChatIcon} alt="Chat" width="14" height="14" />
                            </div>
                            <span>{chat?.name ? chat.name : 'New Chat'}</span>
                        </div>
                        <button
                            onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteChat(chat.id);
                            }}
                            className="invert opacity-0 group-hover:opacity-60"
                        >
                            <img src={Delete} alt="Delete" width="14" height="14" />
                        </button>
                    </div>
                    ))}
                </div>
            </div>

            {/* Bottom Section */}
            <div className="border-t border-gray-700">
                <div className="p-4">
                    <button className="text-sm text-gray-400 flex items-center font-bold bg-transparent hover:bg-gray-500/50 px-4 py-2 rounded-lg">
                        <div className="invert opacity-60 pr-2">
                            <img src={Tree} alt="Tree" width="18" height="18" />
                        </div>
                        Directory Structure
                    </button>
                    <div className="flex flex-col">
                        <button className="mt-4 px-4 py-2 text-sm text-gray-300 rounded hover:bg-gray-300 hover:text-gray-800 transition border border-gray-700 group flex items-center justify-center">
                            <div className="invert opacity-60 group-hover:opacity-75 group-hover:invert-0 pr-2">
                                <img src={Upload} alt="Upload" width="14" height="14" />
                            </div>
                            Upload File
                        </button>
                        <button className="mt-4 px-4 py-1 text-sm text-gray-300 hover:text-white transition group flex items-center justify-center">
                            <div className="invert opacity-60 group-hover:opacity-100 pr-2">
                                <img src={File} alt="File" width="14" height="14" />
                            </div>
                            Conversations.db
                        </button>
                    </div>
                </div>
                <div className="border-t border-gray-700 flex flex-col p-4">
                    <button className="px-4 py-1 text-sm text-gray-300 hover:text-white transition group flex items-center justify-start">
                        <div className="invert opacity-60 group-hover:opacity-100 pr-2">
                            <img src={Moon} alt="File" width="12" height="12" />
                        </div>
                        Toggle Time
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SidebarSection;
