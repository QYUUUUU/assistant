const form = document.getElementById("prompt-form");
const error = document.getElementById("error");

const promptField = document.getElementById("prompt-field");

promptField.addEventListener("keydown", function(event) {
  if (event.key === "Enter" && !event.shiftKey) {
    if (promptField.value.trim() !== "") { // check if prompt field is not empty
      event.preventDefault(); // prevent the newline character from being added
      lancementAPI()
    }
  }
});


form.addEventListener("submit", async (event) => {
    event.preventDefault();
    lancementAPI()
});


async function lancementAPI(){
    const promptField = document.getElementById("prompt-field");
    const prompt = promptField.value;
    promptField.value = "";
    addMessage(prompt, "user");
    
    let typingMessage; // define the variable outside the setTimeout() function
    setTimeout(function() {
      typingMessage = addTypingMessage(); // assign the value to the variable
    }, 1000);

    const response = await fetch(discussion, {
        method: "POST",
        headers: {
        "Content-Type": "application/json",
        },
        body: prompt,
    });

    removeTypingMessage(typingMessage);

    const data = await response.json();

    if (data.success) {
        addMessage(data.data, "assistant");
    } else {
        responseContainer.innerHTML = data.error;
    }
}

function addTypingMessage() {
    const chatContainer = document.querySelector('.card-body.chat-body');
    const typingMessage = document.createElement('div');
    typingMessage.classList.add('loading');
  
    chatContainer.appendChild(typingMessage);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  
    return typingMessage;
  }

function removeTypingMessage(typingMessage) {
    typingMessage.remove();
}

function addMessage(content, sender) {
    var chatContainer = document.querySelector('.card-body.chat-body');
  
    var message = document.createElement('div');
    message.classList.add('chat-message');
    if (sender === 'user') {
      message.classList.add('chat-message-right');
      var messageContent = document.createElement('pre');
      messageContent.classList.add('chat-message-content');
      messageContent.innerText = content;
      message.appendChild(messageContent);
    } else {
      var messageContent = document.createElement('pre');
      messageContent.classList.add('chat-message-content');
      message.appendChild(messageContent);
  
      var cursor = document.createElement('span');
      cursor.classList.add('chat-cursor');
      cursor.innerHTML = '|';
      messageContent.appendChild(cursor);
  
      var i = 0;
      var typingInterval = setInterval(function() {
        if (i < content.length) {
            messageContent.innerHTML = content.substr(0, i) + content.substr(i, 5) + '<span class="chat-cursor">|</span>';
            i += 5;
  
          if (i === content.length) {
            clearInterval(typingInterval);
            messageContent.innerHTML = content;
            cursor.remove();
          }
        } else {
          clearInterval(typingInterval);
          messageContent.innerHTML = content;
          cursor.remove();
        }
      }, getRandomInt(50, 80)); // ajustez la vitesse de frappe ici
    }
  
    var messageInfo = document.createElement('div');
    messageInfo.classList.add('chat-message-info');
    messageInfo.innerHTML = '<span class="chat-message-time">' + getCurrentTime() + '</span>';
  
    message.appendChild(messageInfo);
  
    chatContainer.appendChild(message);
    chatContainer.scrollTop = chatContainer.scrollHeight;
  }

  function getCurrentTime() {
    const currentDate = new Date();
    const hours = currentDate.getHours().toString().padStart(2, '0');
    const minutes = currentDate.getMinutes().toString().padStart(2, '0');
    const timeString = `${hours}:${minutes}`; 
    return timeString;
}

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1) + min);
  }