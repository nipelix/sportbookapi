const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');




const auth = require('./Routes/Auth');
const sport = require('./Routes/Sport');


const app = express();
app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/auth', auth);
app.use('/sport', sport);
app.use(function (req, res, next) {
    return res.status(404).json({
        result: false,
        message: 'api.found'
    });
})

module.exports = app;
