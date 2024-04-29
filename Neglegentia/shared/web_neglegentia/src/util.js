const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');
const { randomBytes } = require('crypto');

const generatePassword = (length = 16) => {
    return randomBytes(length).toString('hex').slice(0, length);
};

const hashPassword = async (password) => {
    const saltRounds = 10;
    try {
        const hash = await bcrypt.hash(password, saltRounds);
        return hash;
    } catch (error) {
        console.error('Hashing error:', error);
        throw error;
    }
};

const checkPassword = async (password, hash) => {
    return await bcrypt.compare(password, hash);
}

const generateUUID = () => {
    return uuidv4();
};

module.exports = {
    generatePassword,
    hashPassword,
    checkPassword,
    generateUUID
};
