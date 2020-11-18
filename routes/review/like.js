var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
좋아요
METHOD       : POST
URL          : /review/like
BODY         : reviewIdx = 리뷰 인덱스
TOKEN        : 토큰 값
*/

router.post('/', authUtil, async(req,res) =>{

    //authUtil 미들웨어로 req.decoded에 유저 값(userIdx, id, nickname) 추가
    console.log("userIdx : ", req.decoded.userIdx);

    //LikeReview 테이블에 데이터(userIdx, reviewIdx) 추가
    const insertLikeReviewQuery = 'INSERT INTO LikeReview (userIdx, reviewIdx) VALUES (?, ?)';
    const insertLikeReviewResult = await db.queryParam_Arr(insertLikeReviewQuery, [req.decoded.userIdx, req.body.reviewIdx]);

    //좋아요 실패
    if (!insertLikeReviewResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_LIKE));
    }
    //좋아요 성공 
    else {
        //Review 테이블에 reviewLikeCnt 속성 + 1
        const updateReviewQuery = 'UPDATE Review SET reviewLikeCnt = reviewLikeCnt + 1 WHERE reviewIdx = ?';
        const updateReviewResult = await db.queryParam_Parse(updateReviewQuery, [req.body.reviewIdx]);

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_LIKE));
    }
});


/*
좋아요 취소
METHOD       : DELETE
URL          : /review/like
BODY         : reviewIdx = 리뷰 인덱스
TOKEN        : 토큰 값
*/

router.delete('/', authUtil, async(req,res) =>{

    //authUtil 미들웨어로 req.decoded에 유저 값(userIdx, id, nickname) 추가

    //LikeReview 테이블에 데이터(userIdx, reviewIdx) 삭제
    const deleteLikeReviewQuery = 'DELETE FROM LikeReview WHERE userIdx = ? AND reviewIdx = ?';;
    const deleteLikeReviewResult = await db.queryParam_Arr(deleteLikeReviewQuery, [req.decoded.userIdx, req.body.reviewIdx]);

    //좋아요 취소 실패
    if (!deleteLikeReviewResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_DISLIKE));
    }
    //좋아요 취소 성공 
    else { 
        //Review 테이블에 reviewLikeCnt 속성 -1
        const updateReviewQuery = 'UPDATE Review SET reviewLikeCnt = reviewLikeCnt - 1 WHERE reviewIdx = ?';
        const updateReviewResult = await db.queryParam_Parse(updateReviewQuery, [req.body.reviewIdx]);
        
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_DISLIKE));
    }
});

module.exports = router;