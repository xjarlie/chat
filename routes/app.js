const express = require('express');
const path = require('path');
const router = express.Router();
const db = require('../db/conn');

router.get('/', (req, res) => {
    //res.render('index');
    res.redirect('/app/rooms/exampleRoom');
});

router.get('/public', async (req, res) => {
    const globalList = await db.orderedList('rooms', 'name', 'asc');
    res.render('public', { list: globalList, name: 'Public Rooms' });
});

router.get('/rooms/create', (req, res) => {
    res.render('create', { name: '' });
});

router.get('/rooms/:roomID', async (req, res) => {
    const { roomID } = req.params;
    const roomData = await db.get(`rooms/${roomID}`);

    if (roomData) {
        let data = { name: roomData.name };

        // Check room timeout
        const now = db.timestamp();
        if (roomData.timeoutStamp) {

            if (roomData.timeoutStamp <= now) {
                db.remove(`rooms/${roomID}`);
                res.render('create', data);
            } else {
                data.timeoutStamp = roomData.timeoutStamp;
                res.render('chat', data);
            }
        } else {
            res.render('chat', data);
        }

    } else {
        res.render('create', { name: roomID });
    }
});

module.exports = router;