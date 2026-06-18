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
const reviewRoutes = require('./routes/reviewRoutes');
const globalErrorHandler = require('./controllers/errorController');

const app = express();

app.use(cookieParser());
app.use(cors({
  origin: ['http://localhost:5173'],
  credentials: true,
}));

// 1) MIDDLEWARES
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}


app.set('view engine', 'pug');
app.use(express.json());
app.set('views', path.join(__dirname, 'views'));

app.use('/public', express.static(path.join(__dirname, 'public')));

app.use(helmet());

const limiter = rateLimit({
  max: 100,
  windowMs: 60 * 60 * 1000,
  message: 'Too many requests from this IP, please try again in an hour!',
});
// FIX: was app.use('api', limiter) — missing leading slash meant this never
// matched any route and the limiter was inert.
app.use('/api', limiter);


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

app.get('/passwordReset', (req, res) => {
  res.render('email/passwordReset', {
    title: 'Password Reset',
    message: 'Please enter your new password.'
  });
});

// 2) ROUTES
app.use('/api/v1/pets', catRoute);
// FIX: reviewRoutes existed but was never mounted, so /reviews was
// completely unreachable. Mounted nested under pets (mergeParams gives
// reviewController access to req.params.petId) and flat for direct
// review access.
app.use('/api/v1/pets/:petId/reviews', reviewRoutes);
app.use('/api/v1/reviews', reviewRoutes);
app.use('/api/v1/customers', customerRoute);
app.use('/api/v1/adoptionForms', adoptionFormRoutes);
app.use(globalErrorHandler);

module.exports = app;
