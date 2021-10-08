const express = require('express');
const path = require('path');
const router = express.Router();

router.get('/', (req, res) => {
    //res.render('index');
    res.redirect('/app/rooms/exampleRoom');
});

router.get('/rooms/:roomID', (req, res) => {
    res.render('chat');
});

module.exports = router;