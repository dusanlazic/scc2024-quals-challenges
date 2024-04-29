const sqlite = require('sqlite-async');
const { generateUUID } = require('./util');

class Database {
    constructor(db_file) {
        this.db_file = db_file;
        this.db = undefined;
    }

    async connect() {
        this.db = await sqlite.open(this.db_file);
    }

    async getUserByUsername(username) {
        return this.db.get(`SELECT * FROM users WHERE username = '${username}'`);
    }

    async getUserById(id) {
        return this.db.get(`SELECT * FROM users WHERE id = '${id}'`);
    }

    async registerUser(username, password) {
        const userId = generateUUID();
        this.db.exec(`INSERT INTO USERS (id, username, password) VALUES ('${userId}', '${username}', '${password}');`);
        return userId;
    }

    async getUserInbox(username) {
        const messages = await this.db.all(`
            SELECT m.*, u1.username AS senderUsername, u2.username AS receiverUsername
            FROM messages m
            JOIN users u1 ON m.sender_id = u1.id
            JOIN users u2 ON m.receiver_id = u2.id
            WHERE senderUsername = '${username}' OR receiverUsername = '${username}'
            ORDER BY m.timestamp ASC`);

        return messages.reduce((acc, message) => {
            const otherUserUsername = message.senderUsername === username ? message.receiverUsername : message.senderUsername;
            const messageType = message.senderUsername === username ? 'sent' : 'received';

            if (!acc[otherUserUsername] && otherUserUsername !== username) {
                acc[otherUserUsername] = [];
            }

            acc[otherUserUsername].push({
                type: messageType,
                content: message.message
            });

            return acc;
        }, {});
    }

    async persistMessage(senderId, receiverId, message) {
        this.db.exec(`INSERT INTO messages (sender_id, receiver_id, message) VALUES ('${senderId}', '${receiverId}', '${message}');`);
    }

    async migrate() {
        const sql = `
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                username TEXT NOT NULL UNIQUE,
                password TEXT NOT NULL
            );

            CREATE TABLE IF NOT EXISTS messages (
                id INT PRIMARY KEY,
                sender_id TEXT NOT NULL,
                receiver_id TEXT NOT NULL,
                message TEXT NOT NULL,
                timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (sender_id) REFERENCES users(id),
                FOREIGN KEY (receiver_id) REFERENCES users(id)
            );`;

        return this.db.exec(sql);
    }
}

module.exports = Database;
