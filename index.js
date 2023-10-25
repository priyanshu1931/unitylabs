const dotenv = require('dotenv');
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const AppError = require('./utils/appError');

const globalErrorHandler = require('./controllers/errorController');
const routers = require('./routers');

const app = express();

// Middlewares
app.use(express.json());
app.use(cors());

// Development logging
if (process.env.NODE_ENV === 'development') {
    app.use(morgan('dev'));
}

app.get('/', (req, res) => {
    res.send("Server is working fine.");
})

app.use('/api/auth', routers.authRouter);
app.use('/api/buyer', routers.buyerRouter);
app.use('/api/seller', routers.sellerRouter);


app.all('*', (req, res, next) => {
    next(new AppError(`Can't find ${req.originalUrl} on this server!`, 404));
});

app.use(globalErrorHandler);

module.exports = app;