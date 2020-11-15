var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
좋아요 리스트 조회
METHOD       : GET
URL          : /place/like
TOKEN        : 토큰 값
*/

router.get('/', authUtil, async(req,res) =>{

    //authUtil 미들웨어로 req.decoded에 유저 값(userIdx, id, nickname) 추가
    console.log("authUtil 성공");

    //LikePlace 테이블과 Place 테이블 조인 후 userIdx와 일치하는 정보 선택
    const likeplaceQuery = 'SELECT Place.placeIdx, Place.placeTitle, Place.placeAddress, Place.placeAvgStar, Place.placeThumbnail FROM Place JOIN LikePlace ON Place.placeIdx = LikePlace.placeIdx WHERE userIdx = ? ORDER BY Place.placeLikeCnt DESC';
    const likePlaceResult = await db.queryParam_Parse(likeplaceQuery, [req.decoded.userIdx]);

    //데이터 저장
    let resData = [];

    if (likePlaceResult == null) {
        console.log("Place, LikePlace 조인 실패");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    } 
    else {
        if (likePlaceResult[0] == null) {
            console.log("좋아요 한 장소가 없습니다.");
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.NO_LIKE_PLACE));
        }
        else {
            for (let i = 0; i < likePlaceResult.length; i++) {  
                likePlaceResult[i].userLike = true;
                resData.push(likePlaceResult[i]);
            }
            console.log("좋아요 장소 리스트 성공");
            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_LIKE_PLACE, resData)); 
        }
    }
});

/*
좋아요
METHOD       : POST
URL          : /place/like
BODY         : placeIdx = 여행지 인덱스
TOKEN        : 토큰 값
*/

router.post('/', authUtil, async(req,res) =>{

    //authUtil 미들웨어로 req.decoded에 유저 값(userIdx, id, nickname) 추가

    //LikePlace 테이블에 데이터(userIdx, placeIdx) 추가
    const likeQuery = 'INSERT INTO LikePlace (userIdx, placeIdx) VALUES (?, ?)';
    console.log("userIdx",req.decoded.userIdx,"placeIdx",req.body.placeIdx);
    const likeResult = await db.queryParam_Arr(likeQuery, [req.decoded.userIdx, req.body.placeIdx]);

    //좋아요 실패
    if (!likeResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_LIKE));
    }
    //좋아요 성공 
    else {
        //Place 테이블에 placeLikeCnt 속성 +1
        const updatePlaceLikeQuery = 'UPDATE Place SET placeLikeCnt = placeLikeCnt + 1 WHERE placeIdx = ?';
        const updatePlaceLikeResult = await db.queryParam_Parse(updatePlaceLikeQuery, [req.body.placeIdx]);

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_LIKE));
    }
});


/*
좋아요 취소
METHOD       : DELETE
URL          : /place/like
BODY         : placeIdx = 여행지 인덱스
TOKEN        : 토큰 값
*/

router.delete('/', authUtil, async(req,res) =>{

    //authUtil 미들웨어로 req.decoded에 유저 값(userIdx, id, nickname) 추가

    //LikePlace 테이블에 데이터(userIdx, placeIdx) 삭제
    const dislikeQuery = 'DELETE FROM LikePlace WHERE userIdx = ? AND placeIdx = ?';;
    const dislikeResult = await db.queryParam_Arr(dislikeQuery, [req.decoded.userIdx, req.body.placeIdx]);

    //좋아요 취소 실패
    if (!dislikeResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_DISLIKE));
    }
    //좋아요 취소 성공 
    else { 
        //Place 테이블에 placeLikeCnt 속성 -1
        const updatePlaceLikeQuery = 'UPDATE Place SET placeLikeCnt = placeLikeCnt - 1 WHERE placeIdx = ?';
        const updatePlaceLikeResult = await db.queryParam_Parse(updatePlaceLikeQuery, [req.body.placeIdx]);

        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_DISLIKE));
    }
});

module.exports = router;