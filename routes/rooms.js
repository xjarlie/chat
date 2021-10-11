const express = require('express');
const _ = require('lodash');
const db = require('../db/conn');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(403).send('Room list forbidden');
});

router.post('/', async (req, res) => {
    const { id: roomID, unlisted: unlisted } = req.body;
    console.log(req.body);
    const roomData = await db.get(`rooms/${roomID}`);
    if (roomData || roomID == 'create') {
        res.status(400).send('Room already exists');
    } else {
        await db.set(`rooms/${roomID}`, { name: roomID, exists: true, unlisted: unlisted });
        res.status(200).json({ id: roomID });
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

module.exports = router;