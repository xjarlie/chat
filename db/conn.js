const path = require('path');
const Database = require('./Database');

const db = new Database(path.join(__dirname, '../database/db.json'));
db.set('rooms/exampleRoom/exists', true);

module.exports = db;