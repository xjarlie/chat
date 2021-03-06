const express = require('express');
const _ = require('lodash');
const db = require('../db/conn');
const router = express.Router();
const crypto = require('crypto');

router.get('/', (req, res) => {
    res.status(403).send('Room list forbidden');
});

router.post('/', async (req, res) => {
    const { id: roomID, unlisted, password, timeout } = req.body;

    const roomData = await db.get(`rooms/${roomID}`);
    if (roomData || roomID == 'create') {
        res.status(400).send('Room already exists');
    } else {
        let data = { name: roomID, exists: true, unlisted: unlisted };
        if (timeout) {
            const now = db.timestamp();
            let timeoutStamp = now + (timeout*3600*1000); // Add number of hours to timestamp
            data.timeoutStamp = timeoutStamp;
        }
        if (password) {

            data.salt = crypto.randomBytes(16).toString('hex');
            data.hash = crypto.pbkdf2Sync(password, data.salt, 1000, 64, 'sha512').toString('hex');

            await db.set(`rooms/${roomID}`, data);
            res.status(200).json({ id: roomID });
        } else {
            await db.set(`rooms/${roomID}`, data);
            res.status(200).json({ id: roomID });
        }
    }
});

router.get('/:roomID', async (req, res) => {
    const { roomID } = req.params;

    const roomData = await db.get(`rooms/${roomID}`);
    if (roomData) {
        res.status(200).json(roomData);
    } else {
        res.status(404).send(`Room doesn't exist`);
    }
});

router.get('/:roomID/messages/:lastID', async (req, res) => {
    const { roomID, lastID: lastMsgID } = req.params;
    const messages = await db.orderedList(`rooms/${roomID}/messages`, 'timestamp', 'asc');
    if (messages) {

        // Only send messages since last message
        const reversed = _.reverse(_.clone(messages));
        let newMessages = [];
        for (const message in reversed) {
            const id = reversed[message].id;
            if (id == lastMsgID) {
                break;
            } else {
                newMessages.push(reversed[message]);
            }
        }
        res.status(200).json(_.reverse(newMessages));
    } else {
        res.status(404).send('No messages');
    }
});

router.post('/:roomID/messages', async (req, res) => {
    const { roomID } = req.params;
    const { author, text } = req.body;

    const { path: messagePath, id: messageID } = await db.push(`rooms/${roomID}/messages`);
    const message = {
        author: author,
        text: text,
        timestamp: db.timestamp(),
        id: messageID
    };
    await db.set(messagePath, message);
    res.status(200).json({ id: messageID });
});

router.post('/:roomID/verifypw', async (req, res) => {
    const { roomID } = req.params;
    const password = req.body.password || '';

    const { hash: correctHash, salt: salt } = await db.get(`rooms/${roomID}`);

    const testHash = crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512').toString('hex');
    const verified = testHash === correctHash;
    res.status(200).json({ verified: verified });
});

module.exports = router;