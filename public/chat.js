const messageInput = document.getElementById('messageInput');
const authorInput = document.getElementById('authorInput');
const sendBtn = document.getElementById('sendBtn');
const messageLog = document.getElementById('log');

const { hostname, protocol, port, pathname } = window.location;

const roomID = pathname.split('/')[3];
console.log(roomID);

sendBtn.onclick = async () => {
    if (messageInput.value) {
        const data = { text: messageInput.value.trim(), author: authorInput.value.trim() };
        await sendMessage(data);
        messageInput.focus();
    }
}

messageInput.onkeyup = async (e) => {
    if (e.keyCode == 13) {
        if (messageInput.value) {
            const data = { text: messageInput.value.trim(), author: authorInput.value.trim() };
            await sendMessage(data);
        }
    }
}  

async function sendMessage(data) {
    const response = await fetch(`/rooms/${roomID}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    });

    messageInput.value = '';

    getMessages();
    return response.json();
}

async function getMessages() {

    const response = await fetch(`/rooms/${roomID}/messages`);

    if (response.status == 200) {

        const data = await response.json();
        const chatDiv = document.getElementById('viewChat');
        chatDiv.innerHTML = '';

        // Placeholder for navbar
        for (let i=0; i<1; i++) {
            const placeholderMessage = new Message('', '', '', 1, chatDiv);
            placeholderMessage.init();
        }

        for (const message in data) {
            const id = message;
            const { author, text, timestamp } = data[message];

            const messageDOM = new Message(id, author, text, timestamp, chatDiv);
            messageDOM.init();
        }

    } else if (response.status == 404) {
        console.log('404 Received');
    }
}

class Message {
    constructor(id, author, text, timestamp, chatDiv = document.getElementById('viewChat')) {
        this.messageID = id;
        this.author = author;
        this.text = text;
        this.timestamp = timestamp;
        this.chatDiv = chatDiv;


        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatMessage');
        messageDiv.classList.add('card-panel');
        messageDiv.dataset.messageID = this.messageID;

        const authorSpan = document.createElement('span');
        authorSpan.classList.add('author');
        authorSpan.textContent = `${this.author}: `;

        const textSpan = document.createElement('span');
        textSpan.classList.add('text');
        textSpan.textContent = this.text;

        messageDiv.appendChild(authorSpan);
        messageDiv.appendChild(textSpan);

        this.messageDiv = messageDiv;
    }

    init() {
        this.chatDiv.prepend(this.messageDiv);
    }
}

getMessages();
setInterval(() => {
    if (document.hasFocus()) {
        getMessages();
    }
}, 700);


document.addEventListener('DOMContentLoaded', function () {
    var elems = document.querySelectorAll('.sidenav');
    var instances = M.Sidenav.init(elems, {});
});