const createError = require('http-errors'); //에러 핸들러*
const express = require('express'); //express 모듈을 받아 오겠다
const compression = require('compression'); //페이지를 압축하기 위한 미들웨어 compression 모듈 설치
const path = require('path'); //path 모듈은 파일과 Directory 경로 작업을 위한 utility 제공한다
const cookieParser = require('cookie-parser'); // 로그인 인증을 위해 쿠키파서라는 모듈을 require 함수를 통해 불러옴
const logger = require('morgan'); //모간 모듈을 require 함수를 통해 불러옴
const indexRouter = require('./routes/index'); 
const app = express(); //express 인스턴스를 생성
require('dotenv').config(); //dotenv 라이브러리를 임포트 한후, config함수를 호출*
app.use(compression()); // 요청받은 내용들 압축

//CORS
const cors = require('cors');
const corsOptions = {
  //cors 설정
  origin: '*', // 전체 허용
  methods: 'GET, HEAD, PUT, PATCH, POST, DELETE',
  preflightContinue: false,

  credentials: true,
  optionsSuccessStatus: 204,
};

app.use(cors(corsOptions));

//DB connect
const mysql = require('mysql');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'jade');

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', indexRouter);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
