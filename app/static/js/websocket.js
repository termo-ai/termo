// app/static/js/websocket.js
let ws;
let messageContainer = document.getElementById("chat-container");
let currentMessageDiv = null;
let currentMessageContent = null;
let currentCodeBlock = null;
let currentOutputBlock = null;
let isCodeBlockActive = false;
let isAwaitingConfirmation = false;
let confirmationResolver = null;

function connect() {
  ws = new WebSocket(`ws://${window.location.host}/ws`);

  ws.onopen = function () {
    document.getElementById("connection-status").textContent = "Connected";
    document
      .getElementById("connection-status")
      .previousElementSibling.classList.remove("bg-red-500");
    document
      .getElementById("connection-status")
      .previousElementSibling.classList.add("bg-green-800");
  };

  ws.onclose = function () {
    document.getElementById("connection-status").textContent =
      "Reconnecting...";
    document
      .getElementById("connection-status")
      .previousElementSibling.classList.remove("bg-green-500");
    document
      .getElementById("connection-status")
      .previousElementSibling.classList.add("bg-red-500");
    setTimeout(connect, 1000);
  };

  // In websocket.js, update the confirmation handling
  ws.onmessage = async function (event) {
    const data = JSON.parse(event.data);

    if (data.error) {
      appendErrorMessage(data.error);
      return;
    }

    if (data.type === "confirmation") {
      isAwaitingConfirmation = true;

      // Set current code block status to pending
      if (currentCodeBlock) {
        updateCodeBlockStatus(currentCodeBlock, "pending");
      }

      // Create and append confirmation buttons
      const confirmationButtons = createConfirmationButtons();
      if (currentMessageDiv) {
        currentMessageDiv.appendChild(confirmationButtons);
      } else {
        currentMessageDiv = createMessageGroup("assistant");
        currentMessageDiv.appendChild(confirmationButtons);
      }

      // Create a promise that will be resolved when the user makes a choice
      const userChoice = await new Promise((resolve) => {
        confirmationResolver = resolve;

        document.getElementById("confirm-execution").onclick = () => {
          resolve(true);
          confirmationButtons.remove();
          if (currentCodeBlock) {
            updateCodeBlockStatus(currentCodeBlock, "executed");
          }
        };

        document.getElementById("reject-execution").onclick = () => {
          resolve(false);
          confirmationButtons.remove();
          if (currentCodeBlock) {
            updateCodeBlockStatus(currentCodeBlock, "canceled");
          }
        };
      });

      // Send the user's choice back to the server
      ws.send(
        JSON.stringify({
          type: "confirmation_response",
          confirmed: userChoice,
        })
      );

      isAwaitingConfirmation = false;
      confirmationResolver = null;
    } else if (!isAwaitingConfirmation) {
      // Handle regular message types as before
      if (data.type === "message") {
        handleMessageChunk(data.content);
        isCodeBlockActive = false;
      } else if (data.type === "code") {
        handleCodeChunk(data.content, data.language, data.start, data.end);
        isCodeBlockActive = true;
        // Set initial pending status for new code blocks
        if (data.start && currentCodeBlock) {
          updateCodeBlockStatus(currentCodeBlock, "pending");
        }
      } else if (data.type === "output") {
        handleOutputChunk(data.content);
      }
    }

    messageContainer.scrollTop = messageContainer.scrollHeight;
  };
}

function sendMessage() {
  const promptInput = document.getElementById("prompt-input");
  const message = promptInput.value.trim();

  if (message && ws.readyState === WebSocket.OPEN) {
    appendUserMessage(message);
    ws.send(JSON.stringify({ prompt: message }));
    promptInput.value = "";
    document.getElementById("char-count").textContent = "0";

    currentMessageDiv = null;
    currentMessageContent = null;
    currentCodeBlock = null;
    currentOutputBlock = null;
  }
}

// Initialize websocket connection
document.addEventListener("DOMContentLoaded", connect);
