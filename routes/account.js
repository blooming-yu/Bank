const router = require('express').Router();
const setup = require('../db_setup');

const sha = require('sha256');

// 로그아웃 처리
router.get('/account/logout', (req, res) => {
  req.session.destroy();
  res.render('index.ejs');
});

// 로그인 처리
router.post("/account/login", async (req, res) => {
  const { mongodb, mysqldb } = await setup();
  mongodb
    .collection("account")
    .findOne({ userid: req.body.userid })
    .then((result) => {
      if (result) {
        const sql = `SELECT salt FROM UserSalt 
                    WHERE userid=?`;
        mysqldb.query(sql, [req.body.userid], (err, rows, fields) => {
          if (err) {
            res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
            return;
          }
          try {
            const salt = rows[0].salt;
            const hashPw = sha(req.body.userpw + salt);
            //  console.log(hashPw);
            if (result.userpw == hashPw) {
              req.body.userpw = hashPw;
              req.session.user = req.body;
              //console.log(req.session.user);
              res.cookie("uid", req.body.userid);
              res.render("index.ejs");
            } else {
              res.render("index.ejs", { data: { alertMsg: '다시 로그인 해주세요' } });
            }
          } catch (err) {
            res.render("index.ejs", {data:{alertMsg:'다시 로그인 해주세요'}});
          }
        });
      } else {
        res.render("index.ejs", {data:{alertMsg:'다시 로그인 해주세요'}});
      }
    })
    .catch((err) => {
      res.render("index.ejs", {data:{alertMsg:'다시 로그인 해주세요'}});
    });
});

// 회원 가입 처리
router.post('/account/save', async (req, res) => {
  const { mongodb, mysqldb } = await setup();

  // 비밀번호 길이 확인
  if (req.body.userpw.length < 5) {
    return res.render('login_enter.ejs', { data: { pwMsg: '비밀번호를 5글자 이상으로 설정해주세요.' } });
  }

  try {
    const result = await mongodb.collection('account').findOne({ userid: req.body.userid });
    if (result) {
      return res.render('login_enter.ejs', { data: { msg: '다른 아이디를 사용해주세요.' } });
    } else {
      const generateSalt = (length = 16) => {
        const crypto = require('crypto');
        return crypto.randomBytes(length).toString('hex');
      };
      const salt = generateSalt();
      const role = req.body.userrole.toLowerCase(); // 권한 소문자로 변환

      // 만약 권한이 'admin'이면 관리자 권한 인증 코드를 검증
      if (role === 'admin') {
        const adminPassword = req.body.adminPassword; // 클라이언트에서 전송한 관리자 비밀번호
        if (adminPassword !== 'admin1234') {
          return res.render('index.ejs', { data: { alert: '관리자 인증에 실패하였습니다.' } });
        }
      }

      // 회원가입 처리
      req.body.userpw = sha(req.body.userpw + salt);
      const insertResult = await mongodb.collection('account').insertOne(req.body);

      if (insertResult) {
        console.log("회원가입 성공");
        const sql = `INSERT INTO usersalt(userid, salt) VALUES (?, ?)`;
        mysqldb.query(sql, [req.body.userid, salt], (err, rows, fields) => {
          if (err) {
            console.log(err);
          } else {
            console.log("salt 저장 성공");
          }
        });
        return res.redirect('/');
      } else {
        console.log("회원가입 실패");
        return res.render('index.ejs', { data: { alertMsg: '회원 가입 실패' } });
      }
    }
  } catch (err) {
    console.log(err);
    return res.render('index.ejs', { data: { alertMsg: '회원 가입 실패' } });
  }
});

// 회원 가입 화면 보기
router.get('/account/enter', (req, res) => {
  res.render('login_enter.ejs');
});

module.exports = router;