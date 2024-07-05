const setup = require('./db_setup');
const express = require("express");
const path = require("path");

const app = express();

app.use(express.static(path.join(__dirname, "assets")));

// app.use(express.static("Bank")); 

const session = require('express-session');
app.use(session({
  secret: "암호화키",
  resave: false,
  saveUninitialized: false,
}));

const cookieParser = require('cookie-parser');
app.use(cookieParser());

const bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

app.get('/', (req,res) => {
  res.render('index.ejs');
});

//등록자를 사용하겠다 -> 등록 대행자 설정
app.use('/', require('./routes/account'));
app.use('/', require('./routes/post')); 

app.listen(8080, async () => {
  await setup();
  console.log("8080 서버가 준비되었습니다...");
});