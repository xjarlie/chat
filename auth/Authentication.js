const { promises: fs } = require('fs');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const Database = require('../db/Database');
const crypto = require('crypto');

class Authentication extends Database {
    constructor(filePath) {
        super(filePath);
    }

    async createAccount(username, password, callback = (err) => { }) {
        const user = {};

        user.uuid = uuidv4();
        user.username = username;
        user.salt = crypto.randomBytes(32).toString('hex');
        user.password = Authentication.hash(password, user.salt);

        // Check username
        const exists = await this.getUser({ username });

        if (!exists) {
            await this.set(`users/${user.uuid}`, user);
            return user;
        } else {
            callback({ code: 400, message: 'Error: User already exists' });
            return null;
            // LOGIN
        }
    }

    async logIn(username, password, callback = (err) => { }) {
        const user = await this.getUser({ username });
        if (user) {
            const testHash = Authentication.hash(password, user.salt);
            if (testHash == user.password) {
                return this.getToken(user.uuid, true);
            } else {
                callback({ code: 403, message: 'Error: Password incorrect' });
            }
        } else {
            callback({ code: 404, message: 'Error: User does not exist' });
        }
    }

    async getUser({ username, uuid }) {
        if (uuid) {
            const data = await this.get(`users/${uuid}`);
            if (data) {
                return data;
            }
        } else if (username) {
            const list = await this.get('users');
            let user;
            for (const i in list) {
                if (list[i].username == username) {
                    user = list[i];
                    break;
                }
            }
            if (user) {
                return user;
            } else {
                return false;
            }
        }
    }

    async getToken(uuid, forcegen) {
        const timestamp = Authentication.timestamp();
        const user = await this.getUser({ uuid });

        const timeout = { time: 6, unit: 'hours'};

        if (forcegen) {
            user.token = Authentication.generateToken(timeout.time, timeout.unit);
            this.updateUser(user);
        }

        if (user.token) {
            if (user.token.timeout <= timestamp) {
                user.token = Authentication.generateToken(timeout.time, timeout.unit);
                this.updateUser(user);
            }
        } else {
            user.token = Authentication.generateToken(timeout.time, timeout.unit);
            this.updateUser(user);
        }

        return user.token.hash;
    }

    async updateUser(user) {
        this.set(`users/${user.uuid}`, user);
    }

    static hash(text, salt, iterations = 1024, length = 64) {
        const hash = crypto.pbkdf2Sync(text, salt, iterations, length, 'sha512').toString('hex');
        return hash;
    }

    static addTime(timestamp, time, unit) {
        switch (unit) {
            case 'hours':
                timestamp += time * 3600000;
                break;
            case 'minutes':
                timestamp += time * 60000;
                break;
            case 'days':
                timestamp += time * 86400000;
                break;
            case 'seconds':
                timestamp += time * 1000;
                break;
            default:
                console.log('broke');
                break;
        }
        return timestamp;
    }

    static generateToken(timeout, unit) {
        const timestamp = Authentication.timestamp();
        const tokenHash = crypto.randomBytes(64).toString('hex');
        const timeoutStamp = Authentication.addTime(timestamp, timeout, unit);
        const token = { hash: tokenHash, timestamp: timestamp, timeout: timeoutStamp};
        return token;
    }
}

module.exports = Authentication;