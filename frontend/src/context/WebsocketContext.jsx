import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";

// Crear el contexto
const WebsocketContext = createContext();

// Hook personalizado para usar el contexto
export const useWebsocket = () => {
  const context = useContext(WebsocketContext);
  if (!context) {
    throw new Error(
      "useWebsocket debe ser usado dentro de un WebsocketProvider"
    );
  }
  return context;
};

export const WebsocketProvider = ({ children }) => {
  const [ws, setWs] = useState(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [isAwaitingConfirmation, setIsAwaitingConfirmation] = useState(false);
  const [currentMessageDiv, setCurrentMessageDiv] = useState(null);
  const [currentCodeBlock, setCurrentCodeBlock] = useState(null);
  const [messages, setMessages] = useState([]);

  // Función para crear la conexión WebSocket
  const connect = useCallback(() => {
    const websocket = new WebSocket(`ws://${window.location.host}/ws`);
    console.log("websocket", websocket);

    websocket.onopen = function () {
      setConnectionStatus("Connected");
      console.log("OPEN");
      setWs(websocket);
    };

    websocket.onclose = function () {
      setConnectionStatus("Reconnecting...");
      console.log("CLOSE");
      setTimeout(connect, 1000);
    };

    websocket.onmessage = async (event) => {
      const data = JSON.parse(event.data);

      if (data.error) {
        setMessages((prev) => [
          ...prev,
          { type: "error", content: data.error },
        ]);
        return;
      }

      if (data.type === "confirmation") {
        setIsAwaitingConfirmation(true);
        if (currentCodeBlock) {
          updateCodeBlockStatus("pending");
        }

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

    return () => {
      if (websocket) {
        websocket.close();
      }
    };
  }, []);

  // Manejador de tipos de mensajes
  const handleMessageTypes = useCallback(
    (data) => {
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
          setMessages((prev) => [
            ...prev,
            {
              type: "code",
              content: data.content,
              language: data.language,
              status: data.start ? "pending" : undefined,
            },
          ]);
          setCurrentCodeBlock(data.start ? messages.length : null);
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
          console.warn("Tipo de mensaje no manejado:", data.type);
      }
    },
    [messages]
  );

  // Función para manejar la confirmación
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

  // Función para actualizar el estado del bloque de código
  const updateCodeBlockStatus = useCallback(
    (status) => {
      if (currentCodeBlock !== null) {
        setMessages((prev) => {
          const newMessages = [...prev];
          if (newMessages[currentCodeBlock]) {
            newMessages[currentCodeBlock] = {
              ...newMessages[currentCodeBlock],
              status,
            };
          }
          return newMessages;
        });
      }
    },
    [currentCodeBlock]
  );

  // Función para enviar mensajes
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

  // Efecto para establecer la conexión inicial
  useEffect(() => {
    const cleanup = connect();
    return cleanup;
  }, [connect]);

  // Valor del contexto
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
