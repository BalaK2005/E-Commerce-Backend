const express = require('express');
const qs = require('qs');
const app = express();
const errorMiddleware = require('./middlewares/error');
const auth = require('./routes/auth');
const cookieParser = require('cookie-parser');

app.use(express.json());
app.use(cookieParser());

app.set('query parser', (str) => qs.parse(str));
const products = require('./routes/product');
const order = require('./routes/order');


app.use('/api/v1/',products);
app.use('/api/v1/',auth);
app.use('/api/v1',order);
app.use(errorMiddleware);

module.exports = app;