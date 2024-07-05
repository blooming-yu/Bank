const dotenv = require('dotenv').config();
const {MongoClient} = require('mongodb');
const mysql = require('mysql2');

let mongodb;
let mysqldb;

const setup = async () => {
  if(mongodb && mysqldb) {
    return{mongodb, mysqldb};
  }

  try{
    //mongodb 접속
  const mongoDbUrl = 'mongodb+srv://admin:1234@cluster0.vgyrq7f.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0';
  const mongoConn = await MongoClient.connect(mongoDbUrl, 
    {
      useNewUrlParser:true,
      useUnifiedTopology:true
    });
    mongodb = mongoConn.db('myboard');
    console.log("몽고DB 접속 성공")

    //MySQL 접속
    mysqldb = mysql.createConnection({
      host: 'localhost',
      user: 'root',
      password: '0719',
      database: 'myboard'
    });
    mysqldb.connect();
    console.log("MySQL 접속 성공");

    return{mongodb, mysqldb};
  } catch (err) {
    console.error("DB 접속 실패", err);
    //서버 가능이 안되게 한다.
    throw err;
  }
};

//function 코드 방출
module.exports = setup;