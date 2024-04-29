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
            );

            INSERT INTO users (id, username, password) VALUES
            ('505c6813-bf6a-40b9-a005-532f77c68309', 'gh0st','$2b$10$3VIjmdl1aLuemlxqcaJETOy3s1dcUfI0wZT3QGDioc/fDNoEfFohq'),
            ('93762b93-2c57-43f9-9896-c96663ccf189', 'byt3b3nd3r', '$2b$10$0zhjTVjy09U1iHmnL57T1Odu8TYefYMt0byMP2FedVF5nbSsQcBUG'),
            ('0089b601-5886-4fcb-910f-a77a7f7e22ed', 'cr4ck3rb0y', '$2b$10$tQJvQ6Qq9JVN2qoggR4JDecyLIeyLGHATuL3tPy3LEUt3QczLspHO'),
            ('2f8e30a2-db63-4ab2-8e8e-220a73305efb', 'danger0us', '$2b$10$YGVH3c4wK089bbRCQrQeMOXNBqdkHwNN8Zjc6nUIUtOk5SNCjEXDy'),
            ('24d2f840-02ab-4711-8837-27e5e4b31f83', 'johndoe', '$2b$10$YUqmcbq/Y5cf1vDR30Z4e.EjCFRlYKmrotifGEEhY5MbrbzATj98.'),
            ('be5ec586-5525-4656-927a-2050186e8898', 's4ndu', '$2b$10$YUqmcbq/Y5cf1vDR30Z4e.EjCFRlYKmrotifGEEhY5MbrbzATj98.'),
            ('286502de-a3ae-4a84-a773-9cd504b7fe82', 'johmdoe', '$2b$10$nqjhRcusV8c6dBldk/gaZeOpb6deq29xcsIALoF2k.uu0tJUuVK3q');

            INSERT INTO messages (sender_id, receiver_id, message) VALUES
            ('505c6813-bf6a-40b9-a005-532f77c68309', '93762b93-2c57-43f9-9896-c96663ccf189', 'Heard that you dumped their database. Found any cool secrets? 😎'),
            ('93762b93-2c57-43f9-9896-c96663ccf189', '505c6813-bf6a-40b9-a005-532f77c68309', 'I found some unsalted md5 password hashes. 😈 I will hand them to cr4ck3rb0y to crack them.'),
            ('505c6813-bf6a-40b9-a005-532f77c68309', '93762b93-2c57-43f9-9896-c96663ccf189', 'Great, let me know if we got any admin creds. 🤑 There may be some password reuse going on in other services... 😈'),
            ('93762b93-2c57-43f9-9896-c96663ccf189', '0089b601-5886-4fcb-910f-a77a7f7e22ed', 'Hey Peter, crack these passwords. 🤩 Thanks!! admin:fdc8cd4cff2c19e0d1022e78481ddf36 alice:cad43cd103b9cc0c6cbec5a56015986e azurediamond:2ab96390c7dbe3439de74d0c9b0b1767'),
            ('0089b601-5886-4fcb-910f-a77a7f7e22ed', '93762b93-2c57-43f9-9896-c96663ccf189', 'If those are unsalted md5s it should be quick, at least for the weak ones. I will let you know when its done.'),
            ('0089b601-5886-4fcb-910f-a77a7f7e22ed', '93762b93-2c57-43f9-9896-c96663ccf189', 'crackstation.net was enough actually 💀, there you go: admin:nevergonnagiveyouup alice:cyberhero azurediamond:hunter2'),
            ('93762b93-2c57-43f9-9896-c96663ccf189', '0089b601-5886-4fcb-910f-a77a7f7e22ed', 'Thanks bro that totally worked!! I stole their most secret asset: SCC{r3m3mb3r_t0_v3r1fy_uR_JWT}'),
            ('0089b601-5886-4fcb-910f-a77a7f7e22ed', '93762b93-2c57-43f9-9896-c96663ccf189', 'ide gas'),
            ('505c6813-bf6a-40b9-a005-532f77c68309', '2f8e30a2-db63-4ab2-8e8e-220a73305efb', 'It seems like someone got into our private network 🚨🚨 I dont see any sus accounts but we should disable user registration and messaging for now... Let''s meet in person tonight at 8, same super secret place as usual.'),
            ('2f8e30a2-db63-4ab2-8e8e-220a73305efb', '505c6813-bf6a-40b9-a005-532f77c68309', 'Okay, I am working on it. 👨‍💻 Is the flag safe?'),
            ('505c6813-bf6a-40b9-a005-532f77c68309', '2f8e30a2-db63-4ab2-8e8e-220a73305efb', 'I dont know anything yet...'),
            ('286502de-a3ae-4a84-a773-9cd504b7fe82', '2f8e30a2-db63-4ab2-8e8e-220a73305efb', 'Hey its me ur friend johndoe. Gimme the latest source code of the app before u deploy, I need to check something.'),
            ('2f8e30a2-db63-4ab2-8e8e-220a73305efb', '286502de-a3ae-4a84-a773-9cd504b7fe82', 'Hi john, I just got a message saying that there may be some intruders on our network 👀, so I temporarily commented out user registration and messaging. Here is the source on this super secret expiring link: https://tinyurl.com/supersecretplatformsource'),
            ('2f8e30a2-db63-4ab2-8e8e-220a73305efb', '286502de-a3ae-4a84-a773-9cd504b7fe82', 'Hurry up with downloading, I will deploy the changes in a minute...'),
            ('be5ec586-5525-4656-927a-2050186e8898', '24d2f840-02ab-4711-8837-27e5e4b31f83', 'Hi johndoe, did you get the source code from that link? You didn''t respond...'),
            ('24d2f840-02ab-4711-8837-27e5e4b31f83', 'be5ec586-5525-4656-927a-2050186e8898', 'What source code? I didn''t get any link...');`

        return this.db.exec(sql);
    }
}

module.exports = Database;
