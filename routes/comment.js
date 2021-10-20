const express = require('express');
const router = express.Router({ mergeParams: true });
const auth = require('../middlewares/auth');
const db = require('../example');

//comments creating
router.post('/', auth.isAuth, async (req, res) => {
  try {
    const commentContent = req.body.commentContent;
    const { postId } = req.params;
    const userNickname = req.user.userNickname;
    const newDate = new Date();
    const commentTime = newDate.toFormat('YYYY-MM-DD HH24:MI:SS');
    const params = [commentTime, commentContent, userNickname, postId];
    const query =
      'INSERT INTO comment(commentTime, commentContent, userNickname, postId) VALUES(?,?,?,?)';
    await db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in createPost => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }
      console.log(`댓글 등록이 완료되었습니다.`);
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

//댓글 수정
router.patch('/:commentId', auth.isAuth, async (req, res) => {
  const { commentId } = req.params;
  const { commentContent } = req.body;
  const userNickname = req.user.userNickname;
  const escapeQuery = {
    commentContent: commentContent,
  };
  const query = `UPDATE comment SET ? WHERE commentId = '${commentId}' and userNickname = '${userNickname}'`;
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

//댓글삭제
router.delete('/:commentId', auth.isAuth, async (req, res) => {
  const { commentId } = req.params;
  const userNickname = req.user.userNickname;
  const query = `DELETE from comment where commentId = '${commentId}'  and userNickname = "${userNickname}"`;
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
