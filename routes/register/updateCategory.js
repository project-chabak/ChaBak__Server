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
BODY         : categoryIdx = 카테고리 인덱스
               img = 카테고리 이미지
*/

router.post('/', upload.single('img'), async (req, res) => {

    //upload 미들웨어 사용
    console.log("upload 미들웨어 성공");

    //PlaceCategory 테이블 UPDATE : placeCategoryImg = img
    const updatePlaceCategoryQuery = 'UPDATE PlaceCategory SET placeCategoryImg = ? WHERE placeCategoryIdx = ?';
    const placeCategoryIdx = req.body.categoryIdx;
    const placeCategoryImg = req.file.location;
    const updatePlaceCategoryResult = await db.queryParam_Arr(updatePlaceCategoryQuery, [placeCategoryImg, placeCategoryIdx]);

    //결과 확인
    if (!updatePlaceCategoryResult) {
        console.log("DB에 카테고리를 수정할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    }
    else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_CATEGORY_REGISTER)); 
    }
});

module.exports = router;