const router = require("express").Router();
const setup = require("../db_setup");

const sha = require("sha256");

//express 라우터 설정
router.get("/post/list", async (req, res) => {
  const { mongodb } = await setup();
  list(mongodb, req, res);
});

//게시글 목록 조회
function list(mongodb, req, res) {
  mongodb
    .collection("post")
    .find()
    .toArray()
    .then((result) => {
      //console.log(result);
      res.render("list.ejs", { data: result });
    });
}

// MongoDB와 연결하여 게시글 목록 조회
router.get('/list', async (req, res) => {
  try {
    const { mongodb } = await setup();
    mongodb.collection('post')
      .find()
      .toArray()
      .then((result) => {
        res.render('list.ejs', { data: result });
      })
      .catch((err) => {
        console.error('게시글 조회 실패:', err);
        res.status(500).send('게시글 조회 실패');
      });
  } catch (err) {
    console.error('DB 연결 실패:', err);
    res.status(500).send('DB 연결 실패');
  }
});

module.exports = router;