const express = require('express');
const morgan = require('morgan');
const path = require('path');
const cors = require('cors');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const cookieParser = require('cookie-parser');

const catRoute = require('./routes/petRoute');
const customerRoute = require('./routes/CustomerRoute');
const adoptionFormRoutes = require('./routes/adoptionFormRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: ['https://petopia-one.vercel.app', 'http://localhost:5173'],
  credentials: true,
}));

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

app.use(express.json());
app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
app.use('api', limiter);


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
app.use('/api/v1/adoptionForms', adoptionFormRoutes);
app.use(globalErrorHandler);
module.exports = app;
