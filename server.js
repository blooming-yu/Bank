const setup = require('./db_setup');
const express = require("express");
const path = require("path");
const dotenv = require("dotenv").config();

const app = express();

app.use(express.static(path.join(__dirname, "assets")));

const session = require("express-session");
app.use(
  session({
    secret: "암호화키",
    resave: false,
    saveUninitialized: false,
  })
);

const cookieParser = require("cookie-parser");
app.use(cookieParser());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({ extended: true }));

// // 템플릿 엔진 설정
// app.set('view engine', 'ejs');
// app.set('views', path.join(__dirname, 'views'));

app.get('/', (req, res) => {
  res.render('index.ejs');
});

// 등록자를 사용하겠다 -> 등록 대행자 설정
app.use('/', require('./routes/account'));
app.use('/', require('./routes/post'));

app.listen(process.env.WEB_PORT, async () => {
  await setup();
  console.log(`${process.env.WEB_PORT} 서버가 준비되었습니다...`);
});
