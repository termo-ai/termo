import React, { useState, useEffect, useRef, useContext } from "react";
import InputSection from "./InputSection";
import HeaderSection from "./HeaderSection";
import Prism from "prismjs";
import "prismjs/themes/prism-okaidia.css";
import Expand from "../icons/expand.svg";
import User from "../icons/user-alt.svg";
import Bot from "../icons/robot.svg";
import Delete from "../icons/trash.svg";
import Copy from "../icons/copy.svg";
import Compress from "../icons/compress.svg";
import Check from "../icons/check.svg";
import Pendig from "../icons/clock.svg";
import Cancel from "../icons/uncheck.svg";
import { WebsocketContext } from "../../context/WebsocketContext";

const ChatSection = ({ messages, setMessages, onCreateChat, activeChat }) => {
  // #region States Refs & Effects
  const [messageGroups, setMessageGroups] = useState([]);
  const [expanded, setExpanded] = useState({});
  const outputRef = useRef(null);
  const { sendMessage } = useContext(WebsocketContext);

  useEffect(() => {
    Prism.highlightAll();
  }, [messages]);

  useEffect(() => {
    const groupedMessages = [];
    let currentGroup = [];

    messages.forEach((message) => {
      if (message.role === "assistant") {
        currentGroup.push(message);
        // Check if the message is 'output' with meaningful content
        if (
          message.type === "output" &&
          message.content.trim() &&
          message.content !== "\n" &&
          message.content !== "\n\n"
        ) {
          groupedMessages.push([...currentGroup]);
          currentGroup = [];
        }
      } else {
        if (currentGroup.length > 0) {
          groupedMessages.push([...currentGroup]);
          currentGroup = [];
        }
        groupedMessages.push([message]);
      }
    });

    if (currentGroup.length > 0) {
      groupedMessages.push([...currentGroup]);
    }

    setMessageGroups(groupedMessages);
  }, [messages]);

  // #region Functios
  const clearMessages = () => {
    if (
      window.confirm(
        "Are you sure you want to clear the chat? This action cannot be undone."
      )
    ) {
      console.log("Clearing chat...");
      setMessages([]);
    } else {
      console.log("Clear chat canceled.");
    }
  };

  const expand = (messageId) => {
    setExpanded((prevState) => ({
      ...prevState,
      [messageId]: !prevState[messageId], // Change the status of corresponding message
    }));
  };

  const exportChat = () => {
    if (!messages.length) {
      console.log("No messages to export.");
      return;
    }

    // Create JSON content from messages
    const fileContent = JSON.stringify(messages, null, 2); // Formatted for easy reading
    const blob = new Blob([fileContent], { type: "application/json" });

    // Create a temporary link to download the file
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `chat_export_${new Date().toISOString()}.json`; // Dynamic name based on current date
    document.body.appendChild(link);
    link.click();

    // Clean the link after use
    document.body.removeChild(link);
    console.log("Chat exported successfully.");
  };

  const copyToClipboard = (content) => {
    navigator.clipboard
      .writeText(content)
      .then(() => {
        console.log("Content copied to clipboard:", content);
      })
      .catch((error) => {
        console.error("Failed to copy content:", error);
      });
  };

  const handleSend = (message) => {
    if (!activeChat) {
      onCreateChat();
    }
    sendMessage(message, activeChat);
    setMessages((prevMessages) => {
      // Get ids
      const lastMessage = prevMessages[prevMessages.length - 1];
      const nextId = lastMessage?.id ? parseInt(lastMessage.id, 10) + 1 : 1; // If there are no previous messages, start from 1
      const nextSequenceId = lastMessage?.sequence_id
        ? parseInt(lastMessage.sequence_id, 10) + 1
        : 1; // If there are no previous messages, start from 1

      // Create new message
      const newMessage = {
        id: nextId,
        sequence_id: nextSequenceId,
        role: "user",
        type: "message",
        content: message,
        created_at: new Date().toISOString(),
        is_end: false,
        is_start: false,
        status: null,
      };

      // Return new messages
      return [...prevMessages, newMessage];
    });
  };

  const handleDelete = (groupIdx) => {
    setMessageGroups((prevGroups) => {
      // Elimina el grupo con el índice especificado
      const updatedGroups = [...prevGroups];
      updatedGroups.splice(groupIdx, 1);
      return updatedGroups;
    });

    setMessages((prevMessages) => {
      // Filtra los mensajes eliminados para reflejar la nueva estructura
      const messagesToRemove = messageGroups[groupIdx].map((msg) => msg.id);
      return prevMessages.filter((msg) => !messagesToRemove.includes(msg.id));
    });

    console.log(`Group ${groupIdx} deleted successfully.`);
  };

  const updateMessageStatus = (messageId, newStatus) => {
    setMessages((prevMessages) => {
      const updatedMessages = prevMessages.map((message, index) => {
        // id matches, update status
        if (message.id === messageId) {
          return { ...message, status: newStatus };
        }
        // update next message (if it exists) at the same time
        if (prevMessages[index - 1]?.id === messageId) {
          return { ...message, status: newStatus };
        }
        return message;
      });
      return updatedMessages;
    });
  };

  // #region JSX Assistants
  const Message = ({ content, role }) => (
    <div
      className={`rounded-lg ${
        role === "user" ? "bg-gray-700 p-4" : "bg-gray-600"
      }`}
    >
      <div className="flex items-center mb-2">
        <div className="invert mr-2">
          <img
            src={role === "user" ? User : Bot}
            alt={role === "user" ? "You" : "Assistant"}
            height={role === "user" ? "14" : "18"}
            width={role === "user" ? "14" : "18"}
          />
        </div>
        <div className="font-bold">{role === "user" ? "You" : "Assistant"}</div>
      </div>
      {content}
    </div>
  );

  const Confirmation = ({ content, language, status, messageId }) => (
    <>
      <CodeBlock content={content} language={language} status={status} />
      <div className="flex space-x-2 my-2">
        <button
          className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg"
          onClick={() => updateMessageStatus(messageId, "Executed")} // Cambiar a 'Executed'
        >
          Run Code
        </button>
        <button
          className="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg"
          onClick={() => updateMessageStatus(messageId, "Canceled")} // Cambiar a 'Canceled'
        >
          Cancel
        </button>
      </div>
    </>
  );

  const CodeBlock = ({ content, language, status }) => (
    <div className="mt-2 bg-gray-700 rounded-lg group relative">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-700 rounded-t-lg">
        <div className="flex items-center space-x-2">
          <span className="text-sm font-mono">{language || "shell"}</span>
          <div
            className={`flex items-center code-execution-status text-sm px-2 rounded-md ${
              status === "Executed"
                ? "bg-green-600/50 text-green-200"
                : status === "Canceled"
                ? "bg-red-600/50 text-red-200"
                : "bg-yellow-600/50 text-yellow-200"
            }`}
          >
            <div
              className="invert opacity-75 pr-1"
              style={{
                filter:
                  status === "Executed"
                    ? "brightness(0) saturate(100%) invert(85%) sepia(25%) saturate(455%) hue-rotate(90deg) brightness(100%) contrast(100%)"
                    : status === "Canceled"
                    ? "brightness(0) saturate(100%) invert(85%) sepia(25%) saturate(667%) hue-rotate(300deg) brightness(100%) contrast(100%)"
                    : "brightness(0) saturate(100%) invert(85%) sepia(25%) saturate(545%) hue-rotate(10deg) brightness(100%) contrast(100%)",
              }}
            >
              <img
                src={
                  status === "Executed"
                    ? Check
                    : status === "Canceled"
                    ? Cancel
                    : Pendig
                }
                alt={status}
                width="12"
                height="12"
              />
            </div>
            {status}
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            onClick={() => copyToClipboard(content)}
            className="invert opacity-70 hover:opacity-100"
            title="Copy output"
          >
            <img src={Copy} alt="Copy" width="14" height="14" />
          </button>
        </div>
      </div>
      <pre className="p-4 m-0 overflow-x-auto bg-neutral-800">
        <code className={`language-${language || "shell"}`}>{content}</code>
      </pre>
    </div>
  );

  const Output = ({ content, messageId }) => (
    <div className="mt-2 bg-gray-700 rounded-lg group relative">
      <div className="flex justify-between items-center px-4 py-2 bg-gray-800 rounded-t-lg">
        <span className="text-sm text-white">Output</span>
        <div className="flex flex-row space-x-4">
          <button
            onClick={() => copyToClipboard(content)}
            className="invert opacity-70 hover:opacity-100"
            title="Copy output"
          >
            <img src={Copy} alt="Copy" width="14" height="14" />
          </button>
          <button
            className="invert opacity-70 hover:opacity-100"
            title="Expand/Collapse"
            onClick={() => expand(messageId)} // Usar el messageId al hacer clic
          >
            <img
              src={expanded[messageId] ? Compress : Expand}
              alt={expanded[messageId] ? "Compress" : "Expand"}
              width="14"
              height="14"
            />
          </button>
        </div>
      </div>
      <div
        ref={outputRef}
        className={`p-4 font-mono text-sm whitespace-pre-wrap bg-gray-700 overflow-auto
                    ${expanded[messageId] ? "max-h-none" : "max-h-60"}
                `}
      >
        {content}
      </div>
    </div>
  );

  // #region MAIN JSX
  return (
    <div className="h-full w-full flex flex-col bg-gray-900">
      <HeaderSection onClear={clearMessages} onExport={exportChat} />
      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messageGroups.length === 0 ? (
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <div className="bg-gray-800/50 rounded-lg p-4 mb-4">
              <h2 className="text-xl font-bold mb-2">Welcome to Termo AI</h2>
              <p className="text-gray-300">
                Start by typing a command or asking a question below.
              </p>
            </div>
          </div>
        ) : (
          messageGroups.map((group, groupIdx) => {
            const isAssistantGroup =
              group.length > 0 && group[0].role === "assistant";
            const isLastGroup = groupIdx === messageGroups.length - 1;
            return (
              <div
                key={groupIdx}
                className={`space-y-4 ${
                  isAssistantGroup ? "bg-gray-600 rounded-lg p-4" : ""
                }`}
              >
                {isAssistantGroup ? (
                  <div className="relative">
                    {isLastGroup && (
                      <button
                        onClick={() => handleDelete(groupIdx)}
                        className="absolute top-0 right-3"
                      >
                        <div className="invert opacity-60 hover:opacity-100">
                          <img
                            src={Delete}
                            alt="Delete"
                            width="16"
                            height="16"
                          />
                        </div>
                      </button>
                    )}
                    {group
                      .filter(
                        (msg) =>
                          msg.content.trim() &&
                          msg.content !== "\n" &&
                          msg.content !== "\n\n"
                      )
                      .map((msg, msgIdx) => {
                        switch (msg.type) {
                          case "message":
                            return (
                              <Message
                                key={msgIdx}
                                content={msg.content}
                                role={msg.role}
                              />
                            );
                          case "confirmation":
                            if (msg.status === "Pending") {
                              return (
                                <Confirmation
                                  key={msgIdx}
                                  content={msg.content}
                                  language={msg.format}
                                  status={msg.status}
                                  messageId={msg.id}
                                />
                              );
                            }
                            break;
                          case "code":
                            if (msg.status !== "Pending") {
                              return (
                                <CodeBlock
                                  key={msgIdx}
                                  content={msg.content}
                                  language={msg.format}
                                  status={msg.status}
                                />
                              );
                            }
                            break;
                          case "output":
                            return (
                              <Output
                                key={msgIdx}
                                content={msg.content}
                                messageId={msg.id}
                              />
                            );
                          default:
                            return null;
                        }
                      })}
                  </div>
                ) : (
                  group.map((msg, msgIdx) => (
                    <div className="relative">
                      {isLastGroup && (
                        <button
                          onClick={() => handleDelete(msgIdx)}
                          className="absolute top-4 right-7"
                        >
                          <div className="invert opacity-60 hover:opacity-100">
                            <img
                              src={Delete}
                              alt="Delete"
                              width="16"
                              height="16"
                            />
                          </div>
                        </button>
                      )}
                      <Message
                        key={msgIdx}
                        content={msg.content}
                        role={msg.role}
                      />
                    </div>
                  ))
                )}
              </div>
            );
          })
        )}
      </div>
      <InputSection onSend={handleSend} />
    </div>
  );
};

export default ChatSection;
