/**
 * @swagger
 * /posts:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Post
 *     name: 게시글 작성
 *     summary: 게시글 작성(사용 가능)
 *     parameters:
 *       - name: body
 *         in: body
 *         required: true
 *         default: 4
 *         schema:
 *           type: object
 *           properties:
 *             postTitle:
 *               type: string
 *               description: 게시글 제목
 *             postIntro:
 *               type: String
 *               description: 게시글 간단 설명
 *             postContent:
 *               type: String
 *               description: 게시글 내용
 *             postImage:
 *               type: String
 *               description: 사진 URL
 *           example:
 *             postTitle: "안녕하세요"
 *             postIntro: "자기소개"
 *             postContent: "반갑습니다!! ㅎㅎ"
 *             postImage: "https://www.sg=AI4_-kSVKKmmP1sS5Y5cOtg&sa=X&ved=Vi-CBaYM"
 *     responses:
 *       '201':
 *         description: 게시글 등록 완료.
 *       '400':
 *         description: DB관련 에러
 *       '500':
 *         description: 예상하지 못한 에러
 * /posts/{postId}:
 *   get:
 *     tags:
 *      - Post
 *     name: 게시글 상세 페이지 조회
 *     summary: 게시글 상세 페이지 조회(댓글 기능 아직 구현 못했어요!)
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         default: 4
 *         schema:
 *           type: Number
 *           description: 해당 게시글 고유 아이디
 *     responses:
 *       '200':
 *         description: 게시글 상세 페이지 조회
 *       '500':
 *         description: 예상하지 못한 에러
 *   patch:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Post
 *     name: 게시글 수정
 *     summary: 게시글 수정(사용 가능)
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         default: 4
 *         schema:
 *           type: Number
 *           description: 해당 게시글 고유 아이디
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             postTitle:
 *               type: string
 *               description: 게시글 제목
 *             postIntro:
 *               type: String
 *               description: 게시글 간단 설명
 *             postContent:
 *               type: String
 *               description: 게시글 내용
 *             postImage:
 *               type: String
 *               description: 게시글 이미지 URL
 *           example:
 *             postTitle: "안녕하세요"
 *             postIntro: "자기소개"
 *             postContent: "반갑습니다!! ㅎㅎ"
 *             postImage: "https://www.sg=AI4_-kSVKKmmP1sS5Y5cOtg&sa=X&ved=Vi-CBaYM"
 *     responses:
 *       '200':
 *         description: 게시글 수정 완료.
 *       '500':
 *         description: 예상하지 못한 에러 발생
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Post
 *     summary: 게시글 삭제(사용 가능)
 *     parameters:
 *       - name: postId
 *         in: path
 *         default: 4
 *         required: true
 *         schema:
 *           type: Number
 *           description: 해당 게시글 고유 아이디
 *     responses:
 *       '200':
 *         description: 해당 포스트 삭제 완료
 *       '400':
 *         description: DB 관련 에러 발생
 *       '500':
 *         description: 예상하지 못한 에러 발생
 */
