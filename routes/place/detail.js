var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
상세 뷰 조회
METHOD       : GET
URL          : /place/detail/:placeIdx
PARAMETER    : placeIdx = 여행지 인덱스
TOKEN        : 토큰 값
*/

router.get('/:placeIdx', authUtil, async(req,res) =>{

    //authUtil 미들웨어로 req.decoded에 유저 값(userIdx, id, nickname) 추가
    console.log("authUtil 성공");

    //placeIdx로 Place 테이블 접근해서 칼럼 저장
    let resData = [];

    const selectPlaceQuery = 'SELECT * FROM Place WHERE placeIdx = ?';
    const selectPlaceResult = await db.queryParam_Parse(selectPlaceQuery, [req.params.placeIdx]);

    if (!selectPlaceResult) {
        console.log("DB Place 테이블 접근할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }
    else {
        if (selectPlaceResult[0] == null) {
            console.log("Place 테이블에 placeIdx에 해당하는 칼럼이 존재하지 않습니다.");
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_PLACE_VIEW));
        } 
        else {
            resData.push(selectPlaceResult[0]);
            resData[0].placeDate = new Date(resData[0].placeDate);
            resData[0].placeStar = resData[0].placeStar / resData[0].placeReviewCnt;
            
            //placeCategory 정보 -> PlaceCategory 테이블 접근
            const selectPlaceCategoryQuery = 'SELECT placeCategoryName FROM PlaceCategory WHERE placeCategoryIdx = ?';
            const selectPlaceCategoryResult = await db.queryParam_Parse(selectPlaceCategoryQuery, [selectPlaceResult[0].placeCategoryIdx]);

            if (!selectPlaceCategoryResult) {
                console.log("DB PlaceCategory 테이블 접근할 수 없습니다.");
                res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
            }
            else {
                if (selectPlaceCategoryResult[0] == null) {
                    console.log("PlaceCategory 테이블에 placeCategoryIdx에 해당하는 칼럼이 존재하지 않습니다.");
                    res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_PLACE_VIEW));
                }
                else {
                    resData[0].placeCategoryName = selectPlaceCategoryResult[0].placeCategoryName;
                    
                    //placeImg 정보 -> PlaceImg 테이블 접근
                    const selectPlaceImgQuery = 'SELECT placeImg FROM PlaceImg WHERE placeIdx = ?';
                    const selectPlaceImgResult = await db.queryParam_Parse(selectPlaceImgQuery, [req.params.placeIdx]);

                    if (!selectPlaceImgResult) {
                        console.log("DB PlaceImg 테이블 접근할 수 없습니다.");
                        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
                    }
                    else {
                        if (selectPlaceImgResult[0] == null) {
                            console.log("PlaceImg 테이블에 placeIdx에 해당하는 칼럼이 존재하지 않습니다.");
                            res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.FAIL_PLACE_VIEW, resData));
                        }
                        else {
                            let placeImg = [];
                            for(let i = 0; i<selectPlaceImgResult.length; i++){
                                placeImg.push(selectPlaceImgResult[i].placeImg);
                            }
                            resData[0].placeImg = placeImg;
                            
                            //placeToilet 정보 -> PlaceToilet 테이블 접근
                            const selectPlaceToiletQuery = 'SELECT toiletLatitude, toiletLongitude FROM PlaceToilet WHERE placeIdx = ?';
                            const selectPlaceToiletResult = await db.queryParam_Parse(selectPlaceToiletQuery, [req.params.placeIdx]);

                            if (!selectPlaceToiletResult) {
                                console.log("DB PlaceToilet 테이블 접근할 수 없습니다.");
                                res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
                            } 
                            else {
                                let placeToilet = [];
                                for(let i = 0; i<selectPlaceToiletResult.length; i++){
                                    placeToilet.push(selectPlaceToiletResult[i]);
                                }
                                resData[0].placeToilet = placeToilet;

                                //LikePlace 테이블 SELECT : placeIdx = placeIdx, userIdx = req.decoded.userIdx
                                const selectLikePlaceQuery = "SELECT * FROM LikePlace WHERE placeIdx = ? AND userIdx = ?";
                                const selectLikePlaceResult = await db.queryParam_Arr(selectLikePlaceQuery, [req.params.placeIdx, req.decoded.userIdx]); 

                                if (selectLikePlaceResult[0]) {
                                    resData[0].userLike = true;
                                }
                                else {
                                    resData[0].userLike = false;
                                }

                                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_PLACE_VIEW, resData[0]));
                            }
                        }
                    }
                }
            }
        }
    }
});

module.exports = router;