var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
전체 리스트 조회
METHOD       : GET
URL          : /place?order={order}&category={category}&toilet&cooking&store
PARAMETER    : order = new, star, like, review
               category = 카테고리 (DEFAULT = 전체)
               toilet = 1 or X
               cooking = 1 or X
               store = 1 or X
TOKEN        : 토큰 값
*/

router.get('/', authUtil, async(req,res) => {

    let resData = [];

    console.log("order : ", req.query.order);
    console.log("category : ", req.query.category);
    console.log("toilet : ", req.query.toilet);
    console.log("cooking : ", req.query.cooking);
    console.log("store : ", req.query.store);

    //order 처리
    let order = "";
    if (req.query.order) {
        switch (req.query.order) {
            case "new":
                order = 'Place.placeDate ASC';
                break;
            case "star":
                order = 'Place.placeAvgStar DESC';
                break;
            case "like":
                order = 'Place.placeLikeCnt DESC';
                break;
            case "review":
                order = 'Place.placeReviewCnt DESC';
                break;
        }
    }
    else {
        order = 'Place.placeAvgStar DESC';
    }
    const orderQuery = 'ORDER BY ' + order;
    console.log("orderQuery : ", orderQuery);

    //category 처리
    let categoryQuery = "";
    if(req.query.category){
        const categoryName = req.query.category.split('/');
        let category = "";
        for(let i = 0; i<categoryName.length - 1; i++){
            category += "placeCategoryName = '" + categoryName[i] + "' OR ";
        }
        category += "placeCategoryName = '" + categoryName[categoryName.length - 1] + "'";
        console.log("category : ", category);

        const selectPlaceCategoryQuery = 'SELECT placeCategoryIdx FROM PlaceCategory WHERE ' + category;
        console.log(selectPlaceCategoryQuery);
        const selectPlaceCategoryResult = await db.queryParam_None(selectPlaceCategoryQuery);
        
        categoryQuery = "placeCategoryIdx in (";
        for(let i = 0; i<selectPlaceCategoryResult.length - 1; i++){
            categoryQuery += selectPlaceCategoryResult[i].placeCategoryIdx + ', ';
        }
        categoryQuery += selectPlaceCategoryResult[selectPlaceCategoryResult.length - 1].placeCategoryIdx + ') AND ';
    }
    console.log("categoryQuery = ", categoryQuery);

    //toilet 처리
    let toiletQuery = "";
    if (req.query.toilet) {
        toiletQuery = "placeIdx IN (SELECT DISTINCT placeIdx FROM PlaceToilet) AND ";
    }
    console.log("toiletQuery = ", toiletQuery);

    //cooking & store 처리
    let cookingQuery = (req.query.cooking) ? req.query.cooking : "NULL";
    let storeQuery = (req.query.store) ? req.query.store : "NULL"; 
    
    //전체 필터 완료
    const selectPlaceQuery = "SELECT placeIdx, placeTitle, placeAddress, placeAvgStar, placeThumbnail FROM Place WHERE " + categoryQuery + toiletQuery + "placeCooking=ifnull(" + cookingQuery + ", placeCooking) AND placeStore=ifnull(" + storeQuery + ", placeStore) " + orderQuery;
    console.log("전체 쿼리 : ", selectPlaceQuery);
    const selectPlaceResult = await db.queryParam_None(selectPlaceQuery);

    console.log("비교");
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

        resData.push(selectPlaceResult[i]);
    }

    // const promises = selectPlaceResult.map(async place => {
    //     //LikePlace 테이블 SELECT : placeIdx = placeIdx, userIdx = req.decoded.userIdx
    //     const selectLikePlaceQuery = "SELECT * FROM LikePlace WHERE placeIdx = ? AND userIdx = ?";
    //     const selectLikePlaceResult = await db.queryParam_Arr(selectLikePlaceQuery, [place.placeIdx, req.decoded.userIdx]);

    //     if (selectLikePlaceResult[0] == null) {
    //         place.userLike = false;
    //     }
    //     else {
    //         place.userLike = true;
    //     }

    //     return resData.push(place);
    // });
    // await Promise.all(promises);

    res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_PLACE_LIST, resData));
});

module.exports = router;