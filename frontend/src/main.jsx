import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { WebsocketProvider } from "./context/WebsocketContext.jsx";
import "./index.css";
import App from "./App.jsx";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <WebsocketProvider>
            <App />
        </WebsocketProvider>
    </StrictMode>
);
