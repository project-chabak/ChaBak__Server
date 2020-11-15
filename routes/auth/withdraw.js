var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

/*
회원 탈퇴
METHOD       : DELETE
URL          : /auth/withdraw
TOKEN        : 토큰 값
*/

router.delete('/', authUtil, async (req, res) => {

    //User 테이블 DELETE : userIdx = req.decoded.userIdx
    const deleteUserQuery = 'DELETE FROM User WHERE userIdx = ?';
    const deleteUserResult = await db.queryParam_Parse(deleteUserQuery, [req.decoded.userIdx]);

    if (!deleteUserResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_WITHDRAW));
    } else {
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_WITHDRAW));
    }
});

module.exports = router;