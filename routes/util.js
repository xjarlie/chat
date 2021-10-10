const express = require('express');
const router = express.Router();
const _ = require('lodash');

router.post('/sort', (req, res) => {
    const { order, property, dataset } = req.body;
    let sorted = _.orderBy(dataset, (o) => {
        return o[property];
    }, order);
    res.json(sorted);
});

module.exports = router;