/**
 * @swagger
 * /posts/4/comments:
 *   post:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Comment
 *     name: 댓글 작성
 *     summary: 댓글 작성(사용 가능)
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         default: 4
 *         schema:
 *           type: Number
 *           description: 해당 댓글 고유 아이디
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             commentContent:
 *               type: String
 *               description: 댓글 내용
 *           example:
 *             commentContent: "반갑습니다!! ㅎㅎ"
 *     responses:
 *       '201':
 *         description: 게시글 등록 완료.
 *       '400':
 *         description: DB관련 에러
 *       '500':
 *         description: 예상하지 못한 에러
 * /posts/:postId/comments/:commentId:
 *   patch:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Comment
 *     name: 댓글 수정
 *     summary: 댓글 수정
 *     parameters:
 *       - name: postId
 *         in: path
 *         required: true
 *         default: 4
 *         schema:
 *           type: Number
 *           description: 해당 댓글 고유 아이디
 *       - name: body
 *         in: body
 *         schema:
 *           type: object
 *           properties:
 *             commentContent:
 *               type: String
 *               description: 댓글 내용
 *           example:
 *             commentContent: "수정입니다!! ㅎㅎ"
 *     responses:
 *       '200':
 *         description: 게시글 수정 완료.
 *       '500':
 *         description: 예상하지 못한 에러 발생
 *   delete:
 *     security:
 *      - bearerAuth: []
 *     tags:
 *      - Comment
 *     summary: 댓글 삭제(사용 가능)
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
