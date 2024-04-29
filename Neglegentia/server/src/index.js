const express = require('express');
const path = require('path');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const routes = require('./routes');
const Database = require('./database');

require('dotenv').config();

const app = express();
const db = new Database('main.db');

app.use(cookieParser());
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }));

app.disable('x-powered-by');
app.disable('etag');

app.set('view engine', 'ejs');
app.use('/public', express.static(path.resolve('public')))

app.use(routes(db));

app.all('*', (req, res) => {
    return res.status(404).send({
        error: 'Page not found.'
    });
});

app.use(function (err, req, res, next) {
    res.status(err.status || 500).send({ error: 'Server error' });
});

(async () => {
    console.log('Connecting to database...');
    await db.connect();
    console.log('Performing migrations...');
    await db.migrate();
    console.log('Setting up listener...');
    app.listen(1337, '0.0.0.0', () => {
        console.log('App launched.')
    })
})();
