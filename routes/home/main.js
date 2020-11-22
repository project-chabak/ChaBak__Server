var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
홈 조회
METHOD       : GET
URL          : /home
TOKEN        : 토큰 값
*/

router.get('/', authUtil, async(req, res) => {
    let resData = {};
    let placeList = [];

    //카테고리 이름, 이미지 
    //PlaceCategory 테이블 SELECT : *
    const selectPlaceCategoryQuery = 'SELECT * FROM PlaceCategory';
    const selectPlaceCategoryResult = await db.queryParam_None(selectPlaceCategoryQuery);
    resData.category = selectPlaceCategoryResult;

    //추천 여행지 => 개수 제한 10개
    //Place 테이블 SELECT : placeIdx, placeTitle, placeAvgStar, placeThumbnail ORDER BY placeAvgStar DESC, placeReviewCnt DESC
    const selectPlaceQuery = "SELECT placeIdx, placeTitle, placeAddress, placeAvgStar, placeThumbnail FROM Place ORDER BY placeAvgStar DESC, placeReviewCnt DESC LIMIT 10";
    const selectPlaceResult = await db.queryParam_None(selectPlaceQuery);
    for(let i = 0; i<selectPlaceResult.length; i++){
        //LikePlace 테이블 SELECT : placeIdx = placeIdx, userIdx = req.decoded.userIdx
        const selectLikePlaceQuery = "SELECT * FROM LikePlace WHERE placeIdx = ? AND userIdx = ?";
        const selectLikePlaceResult = await db.queryParam_Arr(selectLikePlaceQuery, [selectPlaceResult[i].placeIdx, req.decoded.userIdx]);

        if (selectLikePlaceResult[0] == null) {
            selectPlaceResult[i].userLike = false;
        }
        else {
            selectPlaceResult[i].userLike = true;
        }

        placeList.push(selectPlaceResult[i]);
    }
    
    resData.placeList = placeList;
    
    console.log("resData : ", resData);
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_HOME, resData));
});

module.exports = router;