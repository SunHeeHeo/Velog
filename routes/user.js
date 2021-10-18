const express = require('express');
const router = express.Router();
const mysql = require('mysql');
const auth = require('../middlewares/auth');
const bcrypt = require('bcrypt');
const setRounds = 10;
require('dotenv').config();
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});

/* GET users listing. */
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
    console.log(hashedPassword);
    // query
    const params = [userEmail, hashedPassword, userNickname];
    const query =
      'INSERT INTO user(userEmail, userPw, userNickname) VALUES(?,?,?)';
    await db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in createUser => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }

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
router.post('/auth', (req, res) => {
  const { userEmail, userPw } = req.body;

  // 해당  Email pw 일치 여부 확인
  const checkingUser = 'annonymous';
  if (!checkingUser) {
    console.log('일치한 유저가 없다!');
    return res.status(401).json({
      success: false,
    });
  }
});
module.exports = router;
