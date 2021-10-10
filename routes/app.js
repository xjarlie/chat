const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../db/conn');

router.get('/', (req, res) => {
    //res.render('index');
    res.redirect('/app/rooms/exampleRoom');
});

router.get('/rooms/create', (req, res) => {
    res.render('create', { name: '' });
});

router.get('/rooms/:roomID', async (req, res) => {
    const { roomID } = req.params;
    const roomData = await db.get(`rooms/${roomID}`);
    if (roomData) {
        res.render('chat');
    } else {
        res.render('create', { name: roomID });
    }
});

module.exports = router;