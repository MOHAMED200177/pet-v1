const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');

const catRoute = require('./routes/petRoute');
const customerRoute = require('./routes/CustomerRoute');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cors());

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!'
});
app.use("api", limiter);


app.use((req, res, next) => {
  console.log('Hello from the middleware 👋');
  next();
});


app.use(mongoSanitize());

app.use(xss());


app.use((req, res, next) => {
  req.requestTime = new Date().toISOString();
  next();
});

// 2) ROUTES
app.use('/api/v1/pets', catRoute);
app.use('/api/v1/customers', customerRoute);
app.use(globalErrorHandler);
module.exports = app;
