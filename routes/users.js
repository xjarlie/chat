const express = require('express');
//const db = require('../Database');
const router = express.Router();

router.get('/', (req, res) => {
    res.status(403).send('User list forbidden');
});

router.get('/:userID', async (req, res) => {
    const { userID } = req.params;
    const { authID } = req.body;
    const ref = db.collection('users').doc(userID);
    const doc = await ref.get();
    res.send(doc.data());
});


module.exports = router;