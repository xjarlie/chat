const messageInput = document.getElementById('messageInput');
const authorInput = document.getElementById('authorInput');
const sendBtn = document.getElementById('sendBtn');
const messageLog = document.getElementById('log');

const { hostname, protocol, port, pathname } = window.location;

const roomID = pathname.split('/')[3];
sendBtn.classList.add('disabled');

document.getElementById('navName').textContent = roomID;
localStoreRooms();
authorInput.value = JSON.parse(localStorage.recentRooms)[roomID].username || '';


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

async function localStoreRooms() {
    const rawRooms = localStorage.recentRooms || '{}';
    const recentRooms = JSON.parse(rawRooms);
    if (!recentRooms[roomID]) recentRooms[roomID] = { name: '1' };
    recentRooms[roomID].timestamp = Date.now();
    recentRooms[roomID].name = roomID;
    localStorage.recentRooms = JSON.stringify(recentRooms);
    let dataToSend = {
        order: 'desc',
        property: 'timestamp',
        dataset: recentRooms
    };
    const response = await fetch('/util/sort', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(dataToSend)
    });
    const data = await response.json();

    for (const i in data) {
        const name = data[i].name;
        if (name != roomID) {
            const container = document.getElementById('nav-mobile');
            const li = document.createElement('li');
            li.innerHTML = `<a href="/app/rooms/${name}" class="waves-effect waves-light">${name}</a>`
            container.append(li);
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
    sendBtn.classList.add('disabled');

    const recentRooms = JSON.parse(localStorage.recentRooms);
    recentRooms[roomID].username = authorInput.value.trim();
    localStorage.recentRooms = JSON.stringify(recentRooms);

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
            return '1';
        }
    } else {
        return '1';
    }
}

class Message {
    constructor(id, author, text, timestamp, chatDiv = document.getElementById('viewChat')) {
        this.messageID = id;
        this.author = author;
        this.text = text;
        this.timestamp = timestamp;
        this.date = new Date(this.timestamp);
        this.chatDiv = chatDiv;

        let timeString;
        const today = new Date();
        if (this.date.getDate() == today.getDate()) {
            timeString = this.date.toLocaleTimeString('en-GB', { timeZone: 'Asia/Seoul' });
        } else if (this.timestamp == 1) {
            timeString = '';
        } else {
            timeString = this.date.toLocaleDateString('en-GB', { timeZone: 'Asia/Seoul', year: '2-digit', month: '2-digit', day: '2-digit' });
        }

        const messageDiv = document.createElement('div');
        messageDiv.classList.add('chatMessage');
        messageDiv.classList.add('card-panel');
        messageDiv.dataset.messageid = this.messageID;

        const timeSpan = document.createElement('span');
        timeSpan.classList.add('time');
        timeSpan.textContent = timeString;
        // timeSpan.classList.add('tooltipped');
        // timeSpan.dataset.position = 'top';
        // timeSpan.dataset.tooltip = this.date.toLocaleString('en-GB', { timeZone: 'Asia/Seoul' });
        timeSpan.title = this.date.toLocaleString('en-GB', { timeZone: 'Asia/Seoul' });

        const authorSpan = document.createElement('span');
        authorSpan.classList.add('author');
        authorSpan.textContent = ` ${this.author}: `;

        const textSpan = document.createElement('span');
        textSpan.classList.add('text');
        textSpan.innerHTML = linkify(this.text);

        messageDiv.append(timeSpan);
        messageDiv.append(authorSpan);
        messageDiv.append(textSpan);

        this.messageDiv = messageDiv;
    }

    init() {
        this.chatDiv.prepend(this.messageDiv);
    }
}

let chatDiv = document.getElementById('viewChat');
for (let i = 1; i < 3; i++) {
    const placeholderMessage = document.createElement('div');
    placeholderMessage.classList.add('chatMessage');
    placeholderMessage.classList.add('card-panel');
    placeholderMessage.style.pointerEvents = 'none';
    chatDiv.prepend(placeholderMessage);
}


let scrolled = false;
function updateScroll() {
    if (!scrolled) {
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

    var elems2 = document.querySelectorAll('.tooltipped');
    var instances2 = M.Tooltip.init(elems2, {});
});

function linkify(inputText) {
    var replacedText, replacePattern1, replacePattern2, replacePattern3, replacePattern4;

    //URLs starting with http://, https://, or ftp://
    replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
    replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

    //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
    replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
    replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

    //Change email addresses to mailto:: links.
    replacePattern3 = /(([a-zA-Z0-9\-\_\.])+@[a-zA-Z\_]+?(\.[a-zA-Z]{2,6})+)/gim;
    replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

    return replacedText;
}
