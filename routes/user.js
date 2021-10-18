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
router.post('/auth', async (req, res) => {
  try {
    const { userEmail, userPw } = req.body;
    const query = 'select * from user where userEmail=?';
    const params = [userEmail];
    let checkingUser;

    console.log('보자1');
    const result = await db.query(query, params, (error, rows, fields) => {
      if (error) {
        console.log(`Msg: raise Error in login => ${error}`);
        return res.status(400).json({
          success: false,
        });
      }
      checkingUser = rows[0];
      console.log(checkingUser, '11111');
    });

    console.log('result:', result);
    console.log('보자2');
    console.log(checkingUser, '22222');
    console.log('checkingUser: ', checkingUser);
    // 해당  Email pw 일치 여부 확인
    if (!checkingUser) {
      console.log('일치한 유저가 없다!');
      return res.status(401).json({
        success: false,
        s,
      });
    }

    // 비밀번호가 일치하지 않는 경우(Unauthorized)
    if (!bcrypt.compareSync(userPw, checkingUser.userPw)) {
      console.log('비밀번호가 일치하지 않는 경우에 걸림');
      return res.status(401).json({
        success: false,
      });
    }
    console.log('보자3');
    // email, nickname
  } catch (err) {
    console.log('로그인 기능 중 에러가 발생: ', err);
    res.status(500).json({
      success: false,
    });
  }
});
module.exports = router;
