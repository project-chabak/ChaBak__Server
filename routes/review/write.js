var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
리뷰 작성
METHOD       : POST
URL          : /review/write
BODY         : placeIdx = 장소 인덱스
               content = 리뷰 내용
               star = 리뷰 별점
               imgs = 리뷰 사진
TOKEN        : 토큰 값
*/

router.post('/', upload.array('imgs'), authUtil, async (req, res) => {

    //upload 미들웨어, authUtil 미들웨어 성공
    console.log("upload & authUtil 미들웨어 성공");

    //Review 테이블에 INSERT : 리뷰
    const insertReviewQuery = 'INSERT INTO Review (userIdx, placeIdx, reviewDate, reviewContent, reviewStar) VALUES (?, ?, ?, ?, ?)';
    const userIdx = req.decoded.userIdx;
    const placeIdx = req.body.placeIdx * 1;
    const today = new Date();   
    const year = today.getFullYear(); 
    const month = today.getMonth() + 1;  
    const date = today.getDate();  
    const hours = today.getHours();
    const minutes = today.getMinutes();  
    const seconds = today.getSeconds();
    const reviewDate = year + '-' + month + '-' + date + ' ' + hours + ':' + minutes + ':' + seconds;
    console.log(reviewDate);
    const reviewContent = req.body.content;
    const reviewStar = req.body.star * 1;
    console.log(placeIdx, reviewStar);
    
    const insertReviewResult = await db.queryParam_Arr(insertReviewQuery, [userIdx, placeIdx, reviewDate, reviewContent, reviewStar]);

    if (!insertReviewResult) {
        console.log("DB에 리뷰를 삽입할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    } 
    else {
        //ReviewImg 테이블에 INSERT : reviewIdx, reviewImg
        const reviewIdx = insertReviewResult.insertId
        const imgs = req.files;
        for (let i = 0; i < imgs.length; i++) {
            const insertReviewImgQuery = 'INSERT INTO ReviewImg (reviewIdx, reviewImg) VALUES (?, ?)';
            const reviewImg = imgs[i].location;
            const insertReviewImgResult = await db.queryParam_Arr(insertReviewImgQuery, [reviewIdx, reviewImg]);
        }

        //Place 테이블 UPDATE : placeReviewCnt, placeStar
        const updatePlaceQuery = 'UPDATE Place SET placeReviewCnt = placeReviewCnt + 1, placeStar = placeStar + ' + reviewStar +  ' WHERE placeIdx = ?';
        const updatePlaceResult = await db.queryParam_Parse(updatePlaceQuery, [req.body.placeIdx]);

        if (!updatePlaceResult) {
            console.log("DB에 장소 정보를 업데이트 할 수 없습니다.");
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
        }
        else {
            console.log("리뷰 등록 완료");
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_REVIEW_REGISTER));
        }
    }
});

module.exports = router;