const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const auth = require('../middlewares/auth')
require('date-utils');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
console.log('111');

//게시글 작성하기
router.post('/', (req, res) => {
  console.log('작성하기 접속이 되니');
  const { postTitle, postIntro, postContent, postImage } = req.body;
  console.log(req.body);
  // const userNickname = 'yunjae'; 닉네임 미들웨어에서 꺼내오기
  const newDate = new Date();
  const postTime = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
  const params = [ postTitle, postIntro, postContent, postImage, postTime ]; //코드가 길어지는 걸 간결하게 하기 위해서!
  const query =
    'INSERT INTO post(postTitle, postIntro, postContent, postImage, postTime) VALUES(?,?,?,?,?)';
  db.query(query, params, (error, rows, fields) => {
    if (error) {
      console.log(`Msg: raise Error in createPost => ${ error }`);
      return res.status(400).json({
        success: false,
      });
    }
    console.log(`${ postTitle }로 게시글 등록이 완료되었습니다.`);
    return res.status(201).json({
      success: true,
    });
  });
});

//게시글 조회하기
router.get('/', function (req, res, next) {
  const query =
    'select * from post ORDER BY postId DESC;'; //db에서 모든 포스트를 다 가지고 오겠다!
  db.query(query, (error, rows) => {
    res.status(201).json({
      rows
    });
  });
});


//게시글 상세페이지 조회
router.get('/:postId', async (req, res) => {
  console.log('상세페이지 조회 라우터 부르기 !');
  const { postId } = req.params;
  const query =
    `SELECT * FROM post WHERE postId = ${postId}`;
  try {
    await db.query(query, (error, rows) => {
      console.log(rows);
      if (error) {
        console.log(error);
        return false;
      } else {
        res.status(200).json({
          success: true,
          post: rows[0]
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      ssuccess: false
    });
    console.log(err);
  }
});

//게시글 수정
router.patch('/:postId', async (req, res) => {
  console.log('게시글 수정 라우터 부르기 !!');
  const { postId } = req.params;
  const { postTitle, postIntro, postContent, postImage } = req.body;
  const escapeQuery = {
    postTitle: postTitle,
    postIntro: postIntro,
    postContent: postContent,
    postImage: postImage,
  };
  const query =
    `UPDATE post SET ? WHERE postId = ${postId}`;
  await db.query(query, escapeQuery, (error, rows, fields) => {
    if (error) {
      res.status(400).json({ error });
      return false;
    } else {
      console.log('정상작동 됐지만 에러는?', error);
      console.log('필드는?', fields);
      res.status(200).json({
        success: true
      });
    }
  });
});

router.delete('/:postId', auth.isAuth, async (req, res) => {
  console.log('게시글 삭제 라우터 부르기 !!');

})


module.exports = router;