const { promises: fs } = require('fs');
const _ = require('lodash');
const { v4: uuidv4 } = require('uuid');
const Database = require('../db/Database');
const crypto = require('crypto');

class Authentication extends Database {
    constructor(filePath) {
        super(filePath);
    }

    async createAccount(username, password, callback) {
        const user = new User(this);

        user.uuid = uuidv4();
        user.username = username;
        user.salt = crypto.randomBytes(32).toString('hex');
        user.password = Authentication.hash(password, user.salt);

        // Check username
        const list = await this.get('users');
        let exists = false;
        for (const u in list) {
            if (list[u].username == user.username) {
                exists = true;
                break;
            }
        }

        if (!exists) {
            await this.set(`users/${user.uuid}`, user);
            return user;
        } else {
            callback({ code: 400, message: 'Error: User already exists' });
            return null;
            // LOGIN
        }
    }

    async logIn(username, password) {
        const list = await this.get('users');
        let user;
        for (const u in list) {
            if (list[u].username == username) {
                user = await this.getUser(list[u].uuid);
                break;
            }
        }
        if (user) {
            const testHash = Authentication.hash(password, user.salt);
            if (testHash == user.password) {
                return user;
            }
        }

    }

    async getUser(uuid) {
        const data = await this.get(`users/${uuid}`);
        if (data) {
            return this.toUser(data);
        }
    }

    toUser(obj) {
        const user = new User(this);
        for (const i in obj) {
            user[i] = obj[i];
        }
        return user;
    }

    static hash(text, salt, iterations = 1024, length = 64) {
        const hash = crypto.pbkdf2Sync(text, salt, iterations, length, 'sha512').toString('hex');
        return hash;
    }
}

class User {
    constructor(auth) {
        this.auth = auth;

        this.uuid;
        this.username;
        this.password;
        this.salt;
        this.token;
        this.test();
    }

    async test() {
        console.log('here', await this.auth.set('hello', 'world'));
    }

    async getToken() {
        const timestamp = Authentication.timestamp();
        if (!this.token || this.token.timestamp <= timestamp) {
            const tokenSalt = crypto.randomBytes(32).toString('hex');
            const tokenHash = Authentication.hash(this.uuid, tokenSalt);
            this.token = { hash: tokenHash, salt: tokenSalt, timestamp: timestamp};
            console.log(this.auth);
            //await this.auth.set(`users/${this.uuid}`, this);
        }
        return this.token.hash;
    }

    toString() {
        return {
            uuid: this.uuid,
            username: this.username,
            salt: this.salt,
            password: this.password,
            token: this.token
        };
    }
}

module.exports = Authentication;