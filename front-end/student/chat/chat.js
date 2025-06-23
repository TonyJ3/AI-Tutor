// DOM Elements
const messageContainer = document.getElementById('message-container');
const userInput = document.getElementById('user-input');
const sendButton = document.getElementById('send-button');
const typingIndicator = document.getElementById('typing-indicator');

let conversationHistory = [];
const student_id = localStorage.getItem("student_id");
const title = localStorage.getItem("tutor_title");
const assistant_id = localStorage.getItem("assistant_id");
userInput.addEventListener('input', function () {
    this.style.height = 'auto';
    this.style.height = Math.min(this.scrollHeight, 150) + 'px';
});

sendButton.addEventListener('click', sendMessage);
userInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        // Prevent reload
        e.preventDefault();
        sendMessage();
    }
});

async function sendMessage() {
    const message = userInput.value.trim();
    if (!message) return;

    addMessage(message, 'user');
    userInput.value = '';
    userInput.style.height = 'auto';


    typingIndicator.style.display = 'flex';
    scrollToBottom();

    try {

       const response = await fetch(`http://127.0.0.1:8000/chat`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "include",
            body: JSON.stringify({ message, assistant_id, student_id, title})
        });

        if (!response.ok) throw new Error('Network error');

        const data = await response.json();
        if (data?.response) {

            addMessage(data.response, 'ai');

            conversationHistory.push({
                user: message,
                ai: data.response,
                timestamp: new Date().toISOString()
            });
        } else {
            throw new Error('Invalid response');
        }
    } catch (error) {
        console.error('Error:', error);
        addMessage("Sorry, er is een fout opgetreden. Probeer het later opnieuw.", 'ai');
    } finally {
        typingIndicator.style.display = 'none';
        scrollToBottom();
    }
}

function addMessage(text, sender) {
    const messageDiv = document.createElement('div');
    messageDiv.classList.add('message', `${sender}-message`);

    const content = document.createElement('div');

    // Format the text from plain to clean.
    content.innerHTML = formatAssistantResponse(text);

    const time = document.createElement('div');
    time.classList.add('message-time');
    time.textContent = formatTime(new Date());

    messageDiv.appendChild(content);
    messageDiv.appendChild(time);

    messageContainer.insertBefore(messageDiv, typingIndicator);
    scrollToBottom();
}

function formatTime(date) {
    return date.toLocaleTimeString('nl-NL', {
        hour: '2-digit',
        minute: '2-digit'
    });
}


function scrollToBottom() {
    messageContainer.scrollTop = messageContainer.scrollHeight;
}


window.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        addMessage("Hallo! Ik ben AI tutor. Hoe kan ik je helpen vandaag?", 'ai');
        conversationHistory.push({
            user: '',
            ai: "Hallo! Ik ben Aristotle AI. Hoe kan ik je helpen vandaag?",
            timestamp: new Date().toISOString()
        });
    }, 800);
});

// Format text
function formatAssistantResponse(rawText) {
    // Format text
    const formattedText = marked.parse(rawText);
    // Sanitize fromatted text
    const clean = DOMPurify.sanitize(formattedText);
    return clean;
}