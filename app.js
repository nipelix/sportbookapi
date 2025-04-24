const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const logger = require('morgan');
const cors = require('cors');
const cron = require('node-cron');




const auth = require('./Routes/Auth');
const category = require('./Routes/Category');
const favorite = require('./Routes/Favorite');
const feed = require('./Routes/Feed');
const coupon = require('./Routes/Coupon');

const {getSports} = require("./Utils/CategorySource");


const app = express();
app.use(cors())

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


app.use('/auth', auth);
app.use('/category', category);
app.use('/favorite', favorite);
app.use('/feed', feed);
app.use('/coupon', coupon);

app.use(function (req, res, next) {
    return res.status(404).json({
        result: false,
        message: 'api.found'
    });
})


cron.schedule('*/30 * * * *', getSports);

module.exports = app;
