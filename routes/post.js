const express = require("express");
const router = express.Router();
const mysql = require('mysql');
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DATABASE,
});
console.log("111")
//게시글 작성하기
router.post('/', async (req, res) => {
  console.log("작성하기 접속이 되니")
  const { postTitle, postIntro, postContent, postImage } = req.body;
  const params = [postTitle, postIntro, postContent, postImage]; //코드가 길어지는 걸 간결하게 하기 위해서!
  const query =
    "INSERT INTO post(postTitle, postIntro, postContent, postImage) VALUES(?,?,?,?)";
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
});

//게시글 조회하기
router.get("/", function (req, res, next) {
  const query = 
  "select * from post;" //db에서 모든 포스트를 다 가지고 오겠다!
  db.query(query, (error,rows) =>{
     res.status(201).json({
      rows
  })
})
})



//게시글 상세페이지 조회
router.get("/:postId", async (req, res) => {
  const { postId } = req.params;
  try {
    const data = await isMatchEmailToPwd(postId);
  } catch (err) {
    console.log("상세페이지 조회에서 발생한 에러",err);
    res.status(500).json({
      success: false,
  })
}
})

//게시글 수정
router.patch("/posts/:postId",async(req,res) => {


})

module.exports = router;
