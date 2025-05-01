var createError = require('http-errors');
require('dotenv').config();
var express = require('express');
var path = require('path');
var cors = require('cors');
var cookieParser = require('cookie-parser');
const session = require('express-session');
var logger = require('morgan');
var apiRouter = require('./routes/index');
const { error } = require('console');
const passport = require('passport');
const googlePassport = require('./passports/google.passport');

var app = express();
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(
  session({
    secret: process.env.SESSION_SECRET, // 🔐 Sử dụng biến môi trường trong thực tế
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // ⚠️ Chuyển thành true nếu dùng HTTPS
      maxAge: 1000 * 60 * 60 * 24 // 1 ngày
    },
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));
app.use(cors());
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});
passport.use(googlePassport)
app.use('/api', apiRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};
  console.log("err", err)
  // render the error page
  res.status(err.status || 500);
  res.json({
    message: err.message
  });
});

module.exports = app;
