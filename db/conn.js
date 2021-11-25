const path = require('path');
const Database = require('x-jsondb');

const db = new Database(path.join(__dirname, '../database/db.json'));
db.set('rooms/exampleRoom/exists', true);
db.set('rooms/exampleRoom/name', 'exampleRoom');

module.exports = db;