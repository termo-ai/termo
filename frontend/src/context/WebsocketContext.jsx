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
  const [statusWsMessage, setStatusWsMessage] = useState(false);
  const [stateCurrentCodeBlock, setStateCurrentCodeBlock] = useState(null);
  const [currentMessageDiv, setCurrentMessageDiv] = useState(false);
  const [currentMessageDivAssistant, setCreateMessageGroupAssistant] =
    useState(false);
  const [messages, setMessages] = useState([]);
  const reconnectAttempts = useRef(0);
  const isManualClose = useRef(false);
  const currentCodeBlock = useRef(null);
  console.log("messagessssss", messages);

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
      console.log("EVENT", event.data);
      const data = JSON.parse(event.data);
      console.log("DATTTTTAAAA", data);

      if (data.error) {
        setStatusWsMessage(true);
        //PENDIENTE
        setMessages((prev) => [
          ...prev,
          { type: "error", content: data.error },
        ]);
        return;
      }

      if (data.type === "confirmation") {
        setIsAwaitingConfirmation(true);

        if (currentCodeBlock) {
          setStateCurrentCodeBlock("pending");
        }
        //CREAR-BOTONES
        if (currentMessageDiv) {
          setCurrentMessageDiv(true);
        } else {
          setCurrentMessageDiv(true);
          setCreateMessageGroupAssistant(true);
        }

        try {
          const userChoice = await handleConfirmation();
          websocket.send(
            JSON.stringify({
              type: "confirmation_response",
              confirmed: userChoice,
            })
          );
          setStateCurrentCodeBlock(userChoice ? "executed" : "canceled");
        } catch {
          console.log("ERRROR");
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

  //FUNCIONES
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
            start: data.start,
            end: data.end,
            // status: data.start ? "pending" : undefined,
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
  // const updateCodeBlockStatus = useCallback((status) => {
  //   if (currentCodeBlock.current !== null) {
  //     setMessages((prev) => {
  //       const newMessages = [...prev];
  //       if (newMessages[currentCodeBlock.current]) {
  //         newMessages[currentCodeBlock.current] = {
  //           ...newMessages[currentCodeBlock.current],
  //           status,
  //         };
  //       }
  //       return newMessages;
  //     });
  //   }
  // }, []);

  // Enviar mensajes
  const sendMessage = useCallback(
    (message) => {
      console.log("papasconquesoyrajas", message);
      if (message.trim() && ws?.readyState === WebSocket.OPEN) {
        setMessages((prev) => [
          ...prev,
          {
            type: "message",
            content: message,
            sender: "user",
          },
        ]);
        console.log("messages111", messages);
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
    stateCurrentCodeBlock,
    statusWsMessage,
    currentMessageDivAssistant,
  };

  return (
    <WebsocketContext.Provider value={value}>
      {children}
    </WebsocketContext.Provider>
  );
};
