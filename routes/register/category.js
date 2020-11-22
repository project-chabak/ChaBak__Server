var express = require('express');
var router = express.Router();

const upload = require('../../config/multer');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

/*
카테고리 등록용
METHOD       : POST
URL          : /register/category
BODY         : name = 카테고리 이름 : 서울, 부산, 제주도, 경기도, 강원도, 경상도, 충청도, 전라도
               img = 카테고리 이미지
*/

router.post('/', upload.single('img'), async (req, res) => {

    //upload 미들웨어 사용
    console.log("upload 미들웨어 성공");

    //placeCategory 테이블에 INSERT : placeCategoryName = name, placeCategoryImg = img
    const insertPlaceCategoryQuery = 'INSERT INTO PlaceCategory (placeCategoryName, placeCategoryImg) VALUES (?, ?)';
    const placeCategoryName = req.body.name;
    const placeCategoryImg = req.file.location;
    const insertPlaceCategoryResult = await db.queryParam_Arr(insertPlaceCategoryQuery, [placeCategoryName, placeCategoryImg]);

    //결과 확인
    if (!insertPlaceCategoryResult) {
        console.log("DB에 카테고리를 삽입할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }
    else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_CATEGORY_REGISTER)); 
    }
});

module.exports = router;