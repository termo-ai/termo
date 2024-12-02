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

//FUNCION DE CONECCION
function connect() {
  //TENEMOS LA URL
  ws = new WebSocket(`ws://${window.location.host}/ws`);

  //METODO OPEN
  //solo cambiamos el color y el texto a conectado
  ws.onopen = function () {
    document.getElementById("connection-status").textContent = "Connected";
    document
      .getElementById("connection-status")
      .previousElementSibling.classList.remove("bg-red-500");
    document
      .getElementById("connection-status")
      .previousElementSibling.classList.add("bg-green-800");
  };

  //METODO CLOSE
  //solo cambiamos el color y el texto a desconectado
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

  //METODO ONMESSAGE
  //cachamos el evento
  ws.onmessage = async function (event) {
    const data = JSON.parse(event.data);
    console.log("EVENT", event.data);
    console.log("DATAAAAaaa", data);

    if (data.error) {
      appendErrorMessage(data.error);
      return;
    }

    //SI DATA ES === confirmation
    if (data.type === "confirmation") {
      isAwaitingConfirmation = true;

      //Si currentCodeBlock es true llama a la funcion updateCodeBlockStatus
      //PENDIENTE
      if (currentCodeBlock) {
        updateCodeBlockStatus(currentCodeBlock, "pending");
      }

      //Manda a llamar a createConfirmationButtons que crea botones
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
          //Si currentCodeBlock es true llama a la funcion updateCodeBlockStatus
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
      console.log("userChoice", userChoice);

      // Send the user's choice back to the server
      ws.send(
        JSON.stringify({
          type: "confirmation_response",
          confirmed: userChoice,
          conversation_id: 40,
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
