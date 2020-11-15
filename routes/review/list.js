var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

/*
METHOD       : GET
URL          : /review/:placeIdx
PARAMETER    : placeIdx = 여행지 인덱스
*/

router.get('/:placeIdx', async(req,res) => {
    let resData = [];

    //Review JOIN User 테이블 SELECT : placeIdx = placeIdx
    const selectReviewQuery = 'SELECT nickname, reviewContent, reviewDate, reviewStar, reviewLikeCnt FROM Review JOIN User ON Review.userIdx = User.userIdx WHERE placeIdx = ? ORDER BY Review.reviewLikeCnt DESC';
    const selectReviewResult = await db.queryParam_Parse(selectReviewQuery, [req.params.placeIdx]);

    if (!selectReviewResult) {
        console.log("DB에 리뷰를 선택할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }
    else {
        for (let i = 0; i < selectReviewResult.length; i++) {
            const item = selectReviewResult[i];

            //ReviewImg 테이블 SELECT : reviewIdx = reviewIdx
            const selectReviewImgQuery = 'SELECT reviewImg FROM ReviewImg WHERE reviewIdx = ?';
            const selectReviewImgResult = await db.queryParam_Parse(selectReviewImgQuery, [selectReviewResult[i].reviewIdx]);

            let reviewImg = [];
            for(let j = 0; i<selectReviewImgResult.length; j++){
                reviewImg.push(selectReviewImgResult[j].reviewImg);
            }
            item.reviewImg = reviewImg;

            resData.push(item);
        }
        console.log("리뷰 리스트 성공");
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_REVIEW_LIST, resData)); 

    }
});

module.exports = router;