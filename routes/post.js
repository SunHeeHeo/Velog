const express = require('express');
const router = express.Router({mergeParams: true});
const mysql = require('mysql');
const auth = require('../middlewares/auth');
require('date-utils'); //*
const comment = require('./comment')
router.use('/:postId/comments', comment);
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

//게시글 작성하기
router.post('/', auth.isAuth, async (req, res) => {
  try {
    const { postTitle, postIntro, postContent, postImage } = req.body;
    const userNickname = req.user.userNickname;
    const newDate = new Date();
    const postTime = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    const params = [
      postTitle,
      userNickname,
      postIntro,
      postContent,
      postImage,
      postTime,
    ]; //코드가 길어지는 걸 간결하게 하기 위해서!
    const query =
      'INSERT INTO post(postTitle, userNickname, postIntro, postContent, postImage, postTime) VALUES(?,?,?,?,?,?)';
    await db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in createPost => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }
      console.log(`${postTitle}로 게시글 등록이 완료되었습니다.`);
      return res.status(201).json({
        success: true,
      });
    });
  } catch (err) {
    console.log('게시글 작성 중 발생한 에러: ', err);
    return res.status(500).json({
      success: false,
    });
  }
});

//게시글 조회하기
router.get('/', function (req, res, next) {
  try {
    const query = 'select * from post ORDER BY postId DESC;'; //db에서 모든 포스트를 다 가지고 오겠다!
    db.query(query, (error, rows) => {
      res.status(200).json({
        success: true,
        posts: rows,
      });
    });
  } catch (err) {
    console.log('게시글 조회하기 중 발생한 에러: ', err);
    return res.sendStatus(500);
  }
});

//게시글 상세페이지 조회
router.get('/:postId', async (req, res) => {
  console.log('상세페이지 조회 라우터 부르기 !');
  const { postId } = req.params;
  const query = `SELECT * FROM post WHERE postId = ${postId}`;
  try {
    await db.query(query, (error, rows) => {
      if (error) {
        return false;
      } else {
        res.status(200).json({
          success: true,
          post: rows[0],
        });
      }
    });
  } catch (err) {
    res.status(500).json({
      ssuccess: false,
    });
  }
});

//게시글 수정
router.patch('/:postId', auth.isAuth, async (req, res) => {
  const userNickname = req.user.userNickname;
  const { postId } = req.params;
  const { postTitle, postIntro, postContent, postImage } = req.body;
  const escapeQuery = {
    postTitle: postTitle,
    postIntro: postIntro,
    postContent: postContent,
    postImage: postImage,
  };
  const query = `UPDATE post SET ? WHERE postId = ${postId} and userNickname = '${userNickname}'`;
  await db.query(query, escapeQuery, (error, rows, fields) => {
    if (error) {
      res.status(400).json({
        success: false,
        error,
      });
      return false;
    } else {
      res.status(200).json({
        success: true,
      });
    }
  });
});

// 게시글 삭제
router.delete('/:postId', auth.isAuth, async (req, res) => {
  const { postId } = req.params;
  const userNickname = req.user.userNickname;
  const query = `DELETE from post where postId = ${postId} and userNickname = "${userNickname}"`;
  try {
    await db.query(query, (error, rows, fields) => {
      if (error) {
        console.log('쿼리문 에러 ', error);
        return res.status(400).json({
          success: false,
        });
      }
      res.status(200).json({
        success: true,
      });
    });
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

module.exports = router;

