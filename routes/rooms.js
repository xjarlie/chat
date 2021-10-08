const express = require('express');
const admin = require('firebase-admin')
const db = require('../db/conn');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(403).send('Room list forbidden');
});

router.post('/', async (req, res) => {
    const { name } = req.body;

    const { path: roomPath, id: roomID } = await db.push('rooms');
    await db.set(roomPath, { name: name });
    res.json({ roomID: roomID });
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

router.get('/:roomID/messages', async (req, res) => {
    const { roomID } = req.params;

    const messages = await db.orderedList(`rooms/${roomID}/messages`, 'timestamp', 'asc');
    if (messages) {
        res.status(200).json(messages);
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
        timestamp: db.timestamp()
    };
    await db.set(messagePath, message);
    res.status(200).json({ id: messageID });
});

module.exports = router;