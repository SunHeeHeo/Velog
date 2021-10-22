const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middlewares/auth');
const { db } = require('../models/index');
require('date-utils');
const comment = require('./comment');
const logger = require('../config/logger');

router.use('/:postId/comments', comment);

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
        logger.error(`Msg: raise Error in createPost => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }
      logger.info(`${postTitle}로 게시글 등록이 완료되었습니다.`);
      return res.status(201).json({
        success: true,
      });
    });
  } catch (err) {
    logger.error('게시글 작성 중 발생한 에러: ', err);
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
      if (error) {
        logger.error('게시글 조회 중 발생한 DB관련 에러', error);
        return res.sendStatus(400);
      }
      logger.info('게시글을 성공적으로 조회했습니다.');
      res.status(200).json({
        success: true,
        posts: rows,
      });
    });
  } catch (err) {
    logger.error('게시글 조회하기 중 발생한 예상하지 못한 에러: ', err);
    return res.sendStatus(500);
  }
});

//게시글 상세페이지 조회 (DB 한 번 접속후 데이터 가공)
router.get('/:postId', async (req, res) => {
  const { postId } = req.params;

  const query = `
  select 
  post.postId, comment.commentId, postTitle, postContent, post.userNickname as postUserNickname, postTime, commentContent, 
  comment.userNickname as commentUserNickname, commentTime from post 
  left join comment on post.postId = comment.postId WHERE post.postId=${postId}`;

  try {
    await db.query(query, (error, rows) => {
      if (error) {
        logger.error('게시글 상세페이지 중 발생한 DB 관련 에러 ', error);
        return res.sendStatus(400);
      } else {
        logger.info('게시글 상세페이지를 성공적으로 조회하였습니다.');
        res.status(200).json({
          success: true,
          post: getDetailPostData(rows),
          comments: getDetailCommentsData(rows),
        });
      }
    });
  } catch (err) {
    logger.error('상세 페이지 조회 기능 중 발생한 에러', err);
    res.status(500).json({
      success: false,
    });
  }
});

// 상세 페이지 조회( Data Base 2번 접속할 경우)
/* router.get('/:postId', async (req, res) => {
  try {
    const { postId } = req.params;
    const postQuery = `select * from post where postId=${postId}`;
    await db.query(postQuery, async (error, post) => {
      if (error) {
        return false;
      }
      const commentQuery = `select * from comment where postId=${postId}`;
      try {
        await db.query(commentQuery, (error, comments) => {
          if (error) {
            return false;
          }
          res.status(200).json({
            success: true,
            post: post,
            comments: comments,
          });
        });
      } catch (err) {
        logger.error(err);
        res.status(500).json({
          success: false,
        });
      }
    });
  } catch (err) {
    logger.error(err);
    res.status(500).json({
      success: false,
    });
  }
}); */

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
      logger.error('게시글 수정 중 발생한 DB관련 에러: ', error);
      return res.status(400).json({
        success: false,
        error,
      });
    } else {
      logger.info('게시글을 성공적으로 수정하였습니다.');
      return res.status(200).json({
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
        logger.error('게시글 삭제 중 쿼리문 에러가 발생하였습니다. :', error);
        return res.status(400).json({
          success: false,
        });
      }
      logger.info('게시글을 성공적으로 삭제하였습니다.');
      res.status(200).json({
        success: true,
      });
    });
  } catch (err) {
    res.status(500).json({ err: err });
  }
});

// 상세 페이지 포스트 내용 가져오기
function getDetailPostData(rows) {
  return {
    postTitle: rows[0].postTitle,
    postContent: rows[0].postContent,
    postTime: rows[0].postTime,
    postUserNickname: rows[0].postUserNickname,
  };
}

// 상세페이지 댓글 내용 가져오기
function getDetailCommentsData(rows) {
  let comments = [];
  for (let i = 0; i < rows.length; i++) {
    let tmp = {
      commentId: rows[i].commentId,
      userNickname: rows[i].commentUserNickname,
      commentContent: rows[i].commentContent,
      commentDate: rows[i].commentTime,
    };
    comments.push(tmp);
  }
  return comments;
}

module.exports = router;
