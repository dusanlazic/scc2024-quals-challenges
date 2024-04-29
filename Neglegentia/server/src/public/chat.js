document.addEventListener('DOMContentLoaded', function () {
    fetchMessages();
});

function fetchMessages() {
    fetch('/messages')
        .then(response => response.json())
        .then(data => {
            const users = Object.keys(data.messages);
            displayUsers(users, data.messages);
        })
        .catch(error => console.error('Error fetching messages:', error));
}

function displayUsers(users, allMessages) {
    const userList = document.getElementById('userList');
    userList.innerHTML = '';
    users.forEach(user => {
        const userElement = document.createElement('div');
        userElement.innerText = user;
        userElement.classList.add('user');
        userElement.onclick = () => displayMessages(user, allMessages);
        userList.appendChild(userElement);
    });
}

function displayMessages(user, allMessages) {
    const messageList = document.getElementById('messageList');
    messageList.innerHTML = '';
    allMessages[user].forEach(msg => {
        const msgElement = document.createElement('div');
        msgElement.classList.add('message');
        msgElement.classList.add(msg.type);
        const content = document.createElement('p');
        content.textContent = msg.content;
        msgElement.appendChild(content);
        messageList.appendChild(msgElement);
    });
}
