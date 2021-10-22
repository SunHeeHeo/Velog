// nodejs transaction -> DB query 중 중도 에러 발생했을 경우,
// 동시에 DB접속을 했을 경우 , 따져보기
const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middlewares/auth');
const logger = require('../config/logger');
const { db } = require('../models/index');

//댓글 작성
router.post('/', auth.isAuth, addComment);
//댓글 수정
router.patch('/:commentId', auth.isAuth, modifyComment);
//댓글삭제
router.delete('/:commentId', auth.isAuth, deleteComment);

// 댓글 작성 함수
async function addComment(req, res) {
  try {
    const commentContent = req.body.commentContent;
    const { postId } = req.params;
    const userNickname = req.user.userNickname;
    const newDate = new Date();
    const commentTime = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    const params = [commentTime, commentContent, userNickname, Number(postId)];
    const query =
      'INSERT INTO comment(commentTime, commentContent, userNickname, postId) VALUES(?,?,?,?)';
    await db.query(query, params, async (error, rows, fields) => {
      if (error) {
        logger.error(`Msg: raise Error in createComment => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }
      const commentQuery = `select commentId, userNickname, commentContent, commentTime from comment where postId=${postId}`;
      await db.query(commentQuery, (error, comments) => {
        if (error) {
          logger.error('comment select query문 작성 중 발생한 에러: ', error);
          return res.status(400).json({
            success: false,
          });
        }
        logger.info(`댓글 등록이 완료되었습니다.`);
        return res.status(201).json({
          success: true,
          comments: getDetailCommentsData(comments),
        });
      });
    });
  } catch (err) {
    logger.error('댓글 작성 중 발생한 에러: ', err);
    return res.status(500).json({
      success: false,
    });
  }
}
// 댓글 수정 함수
async function modifyComment(req, res) {
  const { postId, commentId } = req.params;
  const { commentContent } = req.body;
  const userNickname = req.user.userNickname;
  const escapeQuery = {
    commentContent: commentContent,
  };
  const query = `UPDATE comment SET ? WHERE commentId = '${commentId}' and userNickname = '${userNickname}'`;
  await db.query(query, escapeQuery, async (error, rows, fields) => {
    if (error) {
      logger.error('댓글 수정 기능 중 query 관련 에러 발생: ', error);
      return res.status(400).json({
        success: false,
        error,
      });
    } else if (rows.affectedRows === 0) {
      logger.error(
        '댓글 수정 기능 중 잘못된 접근이거나 본인의 글이 아닐 때 발생'
      );
      return res.status(401).json({
        success: false,
      });
    } else {
      const commentQuery = `select commentId, userNickname, commentContent, commentTime from comment where postId=${postId}`;
      await db.query(commentQuery, (error, comments) => {
        if (error) {
          logger.error('comment select query문 작성 중 발생한 에러: ', error);
          return res.status(400).json({
            success: false,
          });
        }
        logger.info(`댓글 수정 완료되었습니다.`);
        return res.status(201).json({
          success: true,
          comments: getDetailCommentsData(comments),
        });
      });
    }
  });
}
// 댓글 삭제 함수
async function deleteComment(req, res) {
  const { postId, commentId } = req.params;
  const userNickname = req.user.userNickname;
  const query = `DELETE from comment where commentId = '${commentId}'  and userNickname = '${userNickname}'`;
  try {
    await db.query(query, async (error, rows, fields) => {
      if (error) {
        logger.error('댓글 삭제 기능 중 발생한 쿼리문 에러 ', error);
        return res.status(400).json({
          success: false,
        });
      } else if (rows.affectedRows === 0) {
        logger.error(
          '댓글 삭제 기능 중 잘못된 접근이거나 본인의 글이 아닐 때 발생'
        );
        return res.status(401).json({
          success: false,
        });
      } else {
        const commentQuery = `select commentId, userNickname, commentContent, commentTime from comment where postId=${postId}`;
        await db.query(commentQuery, (error, comments) => {
          if (error) {
            logger.error('comment select query문 작성 중 발생한 에러: ', error);
            return res.status(400).json({
              success: false,
            });
          }
          logger.info(`댓글이 정상적으로 삭제되었습니다.`);
          return res.status(200).json({
            success: true,
            comments: getDetailCommentsData(comments),
          });
        });
      }
    });
  } catch (err) {
    res.status(500).json({ err: err });
  }
}

// 상세페이지 댓글 내용 가져오는 함수
function getDetailCommentsData(rows) {
  let comments = [];
  logger.info('한번 보자', rows);

  for (let i = 0; i < rows.length; i++) {
    let tmp = {
      commentId: rows[i].commentId,
      userNickname: rows[i].userNickname,
      commentContent: rows[i].commentContent,
      commentDate: rows[i].commentTime,
    };
    comments.push(tmp);
  }
  return comments;
}

module.exports = router;
