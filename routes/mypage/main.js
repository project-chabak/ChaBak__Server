var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
마이 페이지 조회
METHOD       : GET
URL          : /mypage
TOKEN        : 토큰 값
*/

router.get('/', authUtil, async (req, res) => {

    //User 테이블 SELECT : userIdx = req.decoded.userIdx
    const selectUserQuery = 'SELECT userIdx, nickname, id, birthDate, gender FROM User WHERE userIdx = ?';
    const selectUserResult = await db.queryParam_Parse(selectUserQuery, [req.decoded.userIdx]);

    if (!selectUserResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_MYPAGE));
    } else {
        const resData = selectUserResult[0];
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_MYPAGE, resData));
    }
});

module.exports = router;