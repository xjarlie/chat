const messageInput = document.getElementById('messageInput');
const authorInput = document.getElementById('authorInput');
const sendBtn = document.getElementById('sendBtn');
const messageLog = document.getElementById('log');

const { hostname, protocol, port, pathname } = window.location;

const roomID = pathname.split('/')[3];
console.log(roomID);
sendBtn.classList.add('disabled');

sendBtn.onclick = async () => {
    if (messageInput.value && authorInput.value) {
        const data = { text: messageInput.value.trim(), author: authorInput.value.trim() };
        await sendMessage(data);
        messageInput.focus();
    }
}

messageInput.onkeyup = async (e) => {
    if (e.keyCode == 13) {
        if (messageInput.value && authorInput.value) {
            const data = { text: messageInput.value.trim(), author: authorInput.value.trim() };
            await sendMessage(data);
        }
    }

    sendBtnAble();
}

authorInput.onkeyup = (e) => {
    sendBtnAble();
}

function sendBtnAble() {
    if (messageInput.value && authorInput.value) {
        sendBtn.classList.remove('disabled');
    } else {
        sendBtn.classList.add('disabled');
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
    sendBtn.classList.add('disabled');

    getMessages();
    return response.json();
}

async function getMessages() {

    const response = await fetch(`/rooms/${roomID}/messages/${lastID()}`);

    if (response.status == 200) {

        const data = await response.json();
        const chatDiv = document.getElementById('viewChat');

        for (const message in data) {
            const { author, text, timestamp, id } = data[message];

            const messageDOM = new Message(id, author, text, timestamp, chatDiv);
            messageDOM.init();
        }

        updateScroll();

    } else if (response.status == 404) {
        console.log('404 Received');
    }
}

function lastID() {
    const chatDiv = document.getElementById('viewChat');
    if (chatDiv.children[0]) {
        if (chatDiv.children[0].dataset.messageid) {
            return chatDiv.children[0].dataset.messageid;
        } else {
            return false;
        }
    } else {
        return false;
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
        messageDiv.dataset.messageid = this.messageID;

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

let chatDiv = document.getElementById('viewChat');
const placeholderMessage = new Message('', '', '', 1, chatDiv);
placeholderMessage.init();

let scrolled = false;
function updateScroll(){
    if(!scrolled){
        chatDiv.scrollTop = chatDiv.scrollHeight;
    }
}
chatDiv.onscroll = () => {
    if (chatDiv.scrollTop < -2) {
        scrolled = true;
    } else {
        scrolled = false;
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

