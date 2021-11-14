const createError = require('http-errors');
const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const package = require('../package.json');
const moment = require('moment');
const logger = require('morgan');
const MongoClient = require('mongodb').MongoClient;
const indexRouter = require('./routes/index');
const config = require('./config/common');
const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  next(createError(404));
});

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

// 로딩 메세지
console.log(`[${package.name}] 로딩시각 : ${moment().format('YYYY-MM-DD HH:mm:ss')}`);
console.log(`[${package.name}] 로딩환경 : ${config.env}`);
console.log(`[${package.name}] 사용포트 : ${config.port}`);
console.log(`[${package.name}] Version : ${package.version}`);

// mongoDB 연결문
// mongodb://localhost:27017/
const mongoConnectionUri = `mongodb+srv://pain1127:psk2950!@skpark.cmkar.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// mongoDB 연결 시도
const client = new MongoClient(mongoConnectionUri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect()
  .then(() => {
    console.log(`[${package.name}] mongoDB 연결 성공 :` + mongoConnectionUri);
    app.locals.mongoClient = client;
  })
  .catch((error) => {
    console.log(`[${package.name}] mongoDB 연결 실패 : ` + mongoConnectionUri);
    process.exit(1);
  });

module.exports = app;
