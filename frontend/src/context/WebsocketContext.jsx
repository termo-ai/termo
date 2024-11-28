// import React, {
//   createContext,
//   useState,
//   useCallback,
//   useEffect,
//   useRef,
// } from "react";

// export const WebsocketContext = createContext();

// export const WebsocketProvider = ({ children }) => {
//   const [ws, setWs] = useState(null);
//   const [connectionStatus, setConnectionStatus] = useState("Disconnected");
//   const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
//   const [messages, setMessages] = useState([]);
//   const reconnectAttempts = useRef(0);
//   const currentCodeBlock = useRef(null);

//   // Improved WebSocket Connection
//   const connect = useCallback(() => {
//     // Close existing connection if it exists
//     if (ws) {
//       ws.close();
//     }

//     const websocket = new WebSocket(`ws://${window.location.host}/ws`);

//     websocket.onopen = () => {
//       setConnectionStatus("Connected");
//       console.log("WebSocket Connected");
//       setWs(websocket);
//       // Reset reconnection attempts on successful connection
//       reconnectAttempts.current = 0;
//     };

//     websocket.onclose = () => {
//       setConnectionStatus("Reconnecting...");

//       // Exponential backoff for reconnection
//       const timeout = Math.min(
//         30000, // Maximum 30 seconds between attempts
//         1000 * Math.pow(2, reconnectAttempts.current)
//       );

//       setTimeout(() => {
//         reconnectAttempts.current += 1;
//         connect();
//       }, timeout);
//     };

//     websocket.onmessage = async (event) => {
//       const data = JSON.parse(event.data);

//       // Handle ping responses
//       if (data.type === "pong") return;

//       if (data.error) {
//         setMessages((prev) => [
//           ...prev,
//           { type: "error", content: data.error },
//         ]);
//         return;
//       }

//       if (data.type === "confirmation") {
//         setIsAwaitingConfirmation(true);

//         try {
//           const userChoice = await handleConfirmation();
//           websocket.send(
//             JSON.stringify({
//               type: "confirmation_response",
//               confirmed: userChoice,
//             })
//           );

//           updateCodeBlockStatus(userChoice ? "executed" : "canceled");
//         } finally {
//           setIsAwaitingConfirmation(false);
//         }
//       } else if (!isAwaitingConfirmation) {
//         handleMessageTypes(data);
//       }
//     };

//     return websocket;
//   }, []);

//   // Ping Mechanism for Connection Stability
//   useEffect(() => {
//     let pingInterval;
//     if (ws) {
//       // Send ping every 30 seconds
//       pingInterval = setInterval(() => {
//         if (ws.readyState === WebSocket.OPEN) {
//           ws.send(JSON.stringify({ type: "ping" }));
//         }
//       }, 30000);
//     }

//     return () => {
//       if (pingInterval) clearInterval(pingInterval);
//     };
//   }, [ws]);

//   // Initial Connection
//   useEffect(() => {
//     const websocket = connect();
//     return () => websocket.close();
//   }, [connect]);

//   // Message Type Handler
//   const handleMessageTypes = useCallback((data) => {
//     switch (data.type) {
//       case "message":
//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "message",
//             content: data.content,
//             sender: "assistant",
//           },
//         ]);
//         break;
//       case "code":
//         setMessages((prev) => {
//           const newMessages = [...prev];
//           const codeMessage = {
//             type: "code",
//             content: data.content,
//             language: data.language,
//             status: data.start ? "pending" : undefined,
//           };

//           if (data.start) {
//             currentCodeBlock.current = newMessages.length;
//           }

//           return [...newMessages, codeMessage];
//         });
//         break;
//       case "output":
//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "output",
//             content: data.content,
//           },
//         ]);
//         break;
//       default:
//         console.warn("Unhandled message type:", data.type);
//     }
//   }, []);

//   // Confirmation Handler
//   const handleConfirmation = () => {
//     return new Promise((resolve) => {
//       setMessages((prev) => [
//         ...prev,
//         {
//           type: "confirmation",
//           onConfirm: () => resolve(true),
//           onReject: () => resolve(false),
//         },
//       ]);
//     });
//   };

//   // Update Code Block Status
//   const updateCodeBlockStatus = useCallback((status) => {
//     if (currentCodeBlock.current !== null) {
//       setMessages((prev) => {
//         const newMessages = [...prev];
//         if (newMessages[currentCodeBlock.current]) {
//           newMessages[currentCodeBlock.current] = {
//             ...newMessages[currentCodeBlock.current],
//             status,
//           };
//         }
//         return newMessages;
//       });
//     }
//   }, []);

//   // Send Message
//   const sendMessage = useCallback(
//     (message) => {
//       if (message.trim() && ws?.readyState === WebSocket.OPEN) {
//         setMessages((prev) => [
//           ...prev,
//           {
//             type: "message",
//             content: message,
//             sender: "user",
//           },
//         ]);

//         ws.send(JSON.stringify({ prompt: message }));
//         return true;
//       }
//       return false;
//     },
//     [ws]
//   );

//   // Context Value
//   const value = {
//     connectionStatus,
//     messages,
//     sendMessage,
//     isAwaitingConfirmation,
//   };

//   return (
//     <WebsocketContext.Provider value={value}>
//       {children}
//     </WebsocketContext.Provider>
//   );
// };

import React, {
  createContext,
  useState,
  useCallback,
  useEffect,
  useRef,
} from "react";

// Exportación del contexto
export const WebsocketContext = createContext();

// Proveedor del WebSocket
export const WebsocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [messages, setMessages] = useState([]);
  const reconnectAttempts = useRef(0);
  const isManualClose = useRef(false); // Controla si el cierre es manual
  const currentCodeBlock = useRef(null);

  // Función para conectar al WebSocket
  const connect = useCallback(() => {
    // Verificar si la conexión ya existe
    if (ws && ws.readyState !== WebSocket.CLOSED) {
      console.log("WebSocket connection already active.");
      return;
    }

    isManualClose.current = false; // Restablecer bandera de cierre manual
    const websocket = new WebSocket(`ws://${window.location.host}/ws`);

    websocket.onopen = () => {
      setConnectionStatus("Connected");
      console.log("WebSocket Connected");
      setWs(websocket);
      reconnectAttempts.current = 0; // Reiniciar intentos de reconexión
    };

    websocket.onclose = () => {
      if (isManualClose.current) {
        console.log("WebSocket manually closed, no reconnection.");
        return;
      }

      setConnectionStatus("Reconnecting...");
      const timeout = Math.min(
        30000,
        1000 * Math.pow(2, reconnectAttempts.current)
      );
      setTimeout(() => {
        reconnectAttempts.current += 1;
        connect();
      }, timeout);
    };

    websocket.onerror = (error) => {
      console.error("WebSocket Error:", error);
      websocket.close();
    };

    websocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.type === "pong") return;

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { type: "error", content: data.error },
        ]);
        return;
      }

      if (data.type === "confirmation") {
        setIsAwaitingConfirmation(true);
        try {
          const userChoice = await handleConfirmation();
          websocket.send(
            JSON.stringify({
              type: "confirmation_response",
              confirmed: userChoice,
            })
          );
          updateCodeBlockStatus(userChoice ? "executed" : "canceled");
        } finally {
          setIsAwaitingConfirmation(false);
        }
      } else if (!isAwaitingConfirmation) {
        handleMessageTypes(data);
      }
    };

    return websocket;
  }, [ws]);

  // Mecanismo de ping para mantener conexión estable
  useEffect(() => {
    let pingInterval;
    if (ws) {
      pingInterval = setInterval(() => {
        if (ws.readyState === WebSocket.OPEN) {
          ws.send(JSON.stringify({ type: "ping" }));
        }
      }, 30000); // Cada 30 segundos
    }
    return () => clearInterval(pingInterval);
  }, [ws]);

  // Conexión inicial
  useEffect(() => {
    const websocket = connect();
    return () => {
      isManualClose.current = true; // Marcar como desconexión manual
      websocket.close();
    };
  }, [connect]);

  // Manejo de tipos de mensajes
  const handleMessageTypes = useCallback((data) => {
    switch (data.type) {
      case "message":
        setMessages((prev) => [
          ...prev,
          {
            type: "message",
            content: data.content,
            sender: "assistant",
          },
        ]);
        break;
      case "code":
        setMessages((prev) => {
          const newMessages = [...prev];
          const codeMessage = {
            type: "code",
            content: data.content,
            language: data.language,
            status: data.start ? "pending" : undefined,
          };

          if (data.start) {
            currentCodeBlock.current = newMessages.length;
          }

          return [...newMessages, codeMessage];
        });
        break;
      case "output":
        setMessages((prev) => [
          ...prev,
          {
            type: "output",
            content: data.content,
          },
        ]);
        break;
      default:
        console.warn("Unhandled message type:", data.type);
    }
  }, []);

  // Manejo de confirmación
  const handleConfirmation = () => {
    return new Promise((resolve) => {
      setMessages((prev) => [
        ...prev,
        {
          type: "confirmation",
          onConfirm: () => resolve(true),
          onReject: () => resolve(false),
        },
      ]);
    });
  };

  // Actualizar estado de bloque de código
  const updateCodeBlockStatus = useCallback((status) => {
    if (currentCodeBlock.current !== null) {
      setMessages((prev) => {
        const newMessages = [...prev];
        if (newMessages[currentCodeBlock.current]) {
          newMessages[currentCodeBlock.current] = {
            ...newMessages[currentCodeBlock.current],
            status,
          };
        }
        return newMessages;
      });
    }
  }, []);

  // Enviar mensajes
  const sendMessage = useCallback(
    (message) => {
      if (message.trim() && ws?.readyState === WebSocket.OPEN) {
        setMessages((prev) => [
          ...prev,
          {
            type: "message",
            content: message,
            sender: "user",
          },
        ]);
        ws.send(JSON.stringify({ prompt: message }));
        return true;
      }
      return false;
    },
    [ws]
  );

  // Valores del contexto
  const value = {
    connectionStatus,
    messages,
    sendMessage,
    isAwaitingConfirmation,
  };

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
};
