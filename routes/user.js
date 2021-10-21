const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const auth = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const setRounds = 10;
const jwt = require('jsonwebtoken');
require('dotenv').config();
const { db } = require('../example');

// 회원가입
router.post('/signup', async (req, res) => {
  try {
    const { userEmail, userNickname, userPw, userPwCheck } = req.body;

    if (!checkMatchingPassword(userPw, userPwCheck)) {
      // 잘못된 요청인 경우
      return res.status(400).json({
        success: false,
      });
    }
    // userEmail 중복 여부
    if (await checkUserEmailValidation(userEmail)) {
      console.log('email이 중복 되어 있습니다.');
      return res.status(400).json({
        success: false,
      });
    }
    // userNickname 중복 여부
    if (await checkUserNicknameValidation(userNickname)) {
      console.log('닉네임이 중복 되어 있습니다.');
      return res.status(400).json({
        success: false,
      });
    }

    // 비밀번호 암호화(암호화)
    const salt = bcrypt.genSaltSync(setRounds);
    const hashedPassword = bcrypt.hashSync(userPw, salt);

    const userParams = [userEmail, hashedPassword, userNickname];
    const userQuery =
      'INSERT INTO user(userEmail, userPw, userNickname) VALUES(?,?,?)';

    // user 생성
    await db.query(userQuery, userParams, async (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in createUser => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }
      const userId = rows.insertId;
      const profileParams = [userId];
      const profileQuery = 'INSERT INTO profile(userId) VALUES(?)';

      // profile 생성
      await db.query(profileQuery, profileParams, (error, rows, fields) => {
        if (error) {
          console.log(`Msg: raise Error in createProfile => ${error}`);
          return res.status(400).json({
            success: false,
          });
        }
      });

      console.log(`${userEmail}로 회원 등록이 완료되었습니다.`);
      return res.status(201).json({
        success: true,
      });
    });
  } catch (err) {
    console.log('회원가입 기능 중 발생한 에러: ', err);
    return res.status(500).json({
      success: false,
    });
  }
});

// 이메일 중복 여부
function checkUserEmailValidation(userEmail) {
  return new Promise((resolve, reject) => {
    const query = 'select * from user where userEmail = ?';
    const params = [userEmail];
    db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in checkValidationEmail => ${error}`);
        return resolve(true);
      }

      // 아무 값이 없기 때문에, 중복이 없다. (가능 하다는 얘기)
      if (rows.length == 0) {
        return resolve(false);
      }

      // 존재하다면, 이메일 중복으로 인지
      resolve(true);
    });
  });
}

// 닉네임 중복 여부
function checkUserNicknameValidation(userNickname) {
  return new Promise((resolve, reject) => {
    const query = 'select * from user where userNickname = ?';
    const params = [userNickname];
    db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in checkValidationNickname => ${error}`);
        return resolve(true);
      }

      // 아무 값이 없기 때문에, 중복이 없다. (가능 하다는 얘기)
      if (rows.length == 0) {
        return resolve(false);
      }
      // 존재하다면, 닉네임 중복으로 인지
      resolve(true);
    });
  });
}

// 비밀번호 일치 여부 알려주는 함수
function checkMatchingPassword(userPw, userPwCheck) {
  if (userPw === userPwCheck) {
    return true;
  }
  return false;
}

// login
router.post('/auth', async (req, res) => {
  try {
    const { userEmail, userPw } = req.body;

    const data = await isMatchEmailToPwd(userEmail, userPw);
    console.log(data);
    // 로그인 정보가 일치하지 않을 경우
    if (!data.success) {
      return res.status(401).json({
        success: false,
      });
    }

    // DB에서 nickname, email을 가져온다. 토큰에 넣기 위함.
    const nickname = data.rows.userNickname;
    const email = data.rows.userEmail;
    const id = data.rows.userId;
    const hashedPw = data.rows.userPw;

    // 비밀번호가 일치하지 않는 경우(Unauthorized)
    if (!bcrypt.compareSync(userPw, hashedPw)) {
      console.log('비밀번호가 일치하지 않는 경우에 걸림');
      return res.status(401).json({
        success: false,
      });
    }

    // 토큰 생성
    const token = createJwtToken(nickname, email);
    res.status(201).json({
      success: true,
      token,
      userEmail: email,
      userNickname: nickname,
      userId: id,
    });
  } catch (err) {
    console.log('로그인 기능 중 에러가 발생: ', err);
    res.status(500).json({
      success: false,
    });
  }
});

//JWT 토큰 생성
function createJwtToken(userNickname, userEmail) {
  return jwt.sign({ userNickname, userEmail }, process.env.SECRET_KEY, {
    expiresIn: '1h',
  });
}

const isMatchEmailToPwd = (userEmail, userPw) => {
  return new Promise((resolve, reject) => {
    const params = [userEmail];
    const query = 'select * from user where userEmail= ?'; // userEmail를 통해서 해당 유저 데이터를 가져온다.

    db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.error(`Msg: raise Error in isMatchEmailToPwd => ${error}`);
        return resolve({ success: false });
      }
      // query문의 결과가 1개 이상이면서 비밀번호가 일치할 때,
      if (rows.length >= 1 && bcrypt.compareSync(userPw, rows[0].userPw)) {
        return resolve({
          success: true,
          rows: rows[0],
        });
      }
      return resolve({ success: false });
    });
  });
};

// 유저페이지 불러오기
router.get('/:userNickname', async (req, res) => {
  try {
    let userNickname = req.params.userNickname;
    userNickname = userNickname.split('@')[1];
    const postQuery = `select postTitle, postIntro, postTime from post where userNickname='${userNickname}'`;
    await db.query(postQuery, async (error, posts) => {
      if (error) {
        console.log(' 유저 페이지 postQuery문 실행 중 발생한 에러: ', error);
        return res.status(400).json({
          success: false,
        });
      }
      try {
        await db.query(userQuery);
        return res.status(200).json({
          success: true,
          posts,
          user,
        });
      } catch (err) {
        console.log('유저 페이지 userQuery문 실행 중 발생한 에러:', err);
        return res.status(400).json({
          success: false,
        });
      }
    });
  } catch (err) {
    res.status(400).json({
      success: false,
    });
  }
});

module.exports = router;
