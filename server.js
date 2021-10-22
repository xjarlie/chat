const express = require('express');
const cors = require('cors');
const path = require('path');

const indexRouter = require('./routes/index');
const appRouter = require('./routes/app');
const roomsRouter = require('./routes/rooms');
const utilRouter = require('./routes/util');

const app = express();
const port = 3001;

app.set('view engine', 'ejs');

app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
app.use(express.json());


app.use('/', indexRouter);
app.use('/app', appRouter);
app.use('/rooms', roomsRouter);
app.use('/util', utilRouter);

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});