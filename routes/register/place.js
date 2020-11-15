var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

/*
여행지 등록용
METHOD       : POST
URL          : /register/place
BODY         : category = 장소 카테고리(ex. 경기도, 강원도 ..)
               address = 장소 세부주소
               title = 장소 글 제목
               name = 장소 이름
               content = 장소 세부 내용
               store = 편의점 유무(0 or 1)
               cooking = 취사가능 유무(0 or 1)
               latitude = 장소 위도
               longitude = 장소 경도
               imgs = 장소 이미지(배열)
*/

router.post('/', upload.array('imgs'), async (req, res) => {

    //upload 미들웨어 사용
    console.log("upload 미들웨어 성공");

    //category로 PlaceCategory 테이블의 placeCategoryIdx 값 가져오기 => placeCategoryIdx
    const selectCategoryIndexQuery = 'SELECT placeCategoryIdx FROM PlaceCategory WHERE placeCategoryName = ?';
    const selectCategoryIndexResult = await db.queryParam_Parse(selectCategoryIndexQuery, [req.body.category]);
    if (!selectCategoryIndexResult) {
        console.log("카테고리를 찾을 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }

    //Place 테이블에 삽입 => placeIdx
    const insertPlaceQuery = 'INSERT INTO Place (placeCategoryIdx, placeAddress, placeTitle, placeName, placeDate, placeContent, placeStore, placeCooking, placeLatitude, placeLongitude, placeThumbnail) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
    //쿼리에 넣을 데이터들
    const placeCategoryIdx = selectCategoryIndexResult[0].placeCategoryIdx;
    const placeAddress = req.body.address;
    const placeTitle = req.body.title;
    const placeName = req.body.name;
    
    //날짜 데이터
    const today = new Date();   
    const year = today.getFullYear(); 
    const month = today.getMonth() + 1;  
    const date = today.getDate();  
    const placeDate = year + '-' + month + '-' + date;

    const placeContent = req.body.content;
    const placeStore = req.body.store;
    const placeCooking = req.body.cooking;
    const placeLatitude = req.body.latitude;
    const placeLongitude = req.body.longitude;

    const insertPlaceResult = await db.queryParam_Arr(insertPlaceQuery, [placeCategoryIdx, placeAddress, placeTitle, placeName, placeDate, placeContent, placeStore, placeCooking, placeLatitude, placeLongitude, req.files[0].location]);
    if (!insertPlaceResult) {
        console.log("DB에 장소를 삽입할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }
    console.log("insert로그 : ", insertPlaceResult.insertId);
    
    const selectPlaceIdxQuery = 'SELECT placeIdx FROM Place WHERE placeName = ?';
    const selectPlaceIdxResult = await db.queryParam_Parse(selectPlaceIdxQuery, [placeName]);
    if (!selectPlaceIdxResult) {
        console.log("장소 인덱스를 찾을 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }

    const placeIdx = selectPlaceIdxResult[0].placeIdx;

    //PlaceImg 테이블에 이미지 삽입
    const imgs = req.files;
    for (let i = 0; i < imgs.length; i++) {
        const insertImgQuery = 'INSERT INTO PlaceImg (placeIdx, placeImg) VALUES (?, ?)';
        const placeImg = imgs[i].location;
        const insertImgResult = await db.queryParam_Arr(insertImgQuery, [placeIdx, placeImg]);

        if (!insertImgResult) {
            console.log("DB에 이미지를 삽입할 수 없습니다.");
            res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
        }
    }

    //위도, 경도로 Toilet 테이블의 가능한 위도, 경도를 PlaceToilet에 삽입
    const selectToiletQuery = 'SELECT *, (6371*acos(cos(radians(' + req.body.latitude +  '))*cos(radians(latitude))*cos(radians(longitude)-radians(' + req.body.longitude + '))+sin(radians(' + req.body.latitude + '))*sin(radians(latitude)))) AS distance FROM Toilet HAVING distance <= 0.3 ORDER BY distance LIMIT 0,300';
    const selectToiletResult = await db.queryParam_None(selectToiletQuery);
    
    if (!selectToiletResult) {
        console.log("DB에 화장실 위치를 찾을 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    } 
    else {
        if (selectToiletResult[0] == null) {
            console.log("주변에 화장실이 없습니다.");
        }
        else {
            for (let i = 0; i < selectToiletResult.length; i++) {
                const insertToiletQuery = 'INSERT INTO PlaceToilet (placeIdx, toiletLatitude, toiletLongitude) VALUES (?, ?, ?)';
                const toiletLatitude = selectToiletResult[i].latitude;
                const toiletLongitude = selectToiletResult[i].longitude;
                
                const insertToiletResult = await db.queryParam_Arr(insertToiletQuery, [placeIdx, toiletLatitude, toiletLongitude]);

                if (insertToiletResult == null) {
                    console.log("DB에 화장실 위치를 삽입할 수 없습니다.");
                    res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
                }
            }
        }
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_PLACE_REGISTER)); 
    }
});

module.exports = router;