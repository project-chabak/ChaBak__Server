var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

/*
홈 조회
METHOD       : GET
URL          : /home
TOKEN        : 토큰 값
*/

router.get('/', async(req, res) => {
    let resData = {};

    //카테고리 이름, 이미지 
    //PlaceCategory 테이블 SELECT : placeCategoryName, placCategoryImg
    const selectPlaceCategoryQuery = 'SELECT placeCategoryName, placeCategoryImg FROM placeCategory';
    const selectPlaceCategoryResult = await db.queryParam_None(selectPlaceCategoryQuery);

    resData.category = selectPlaceCategoryResult;

    console.log("resData : ", resData);
    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_MYPAGE, resData));

    //추천 여행지 => /place?order=star URI 사용
});

module.exports = router;