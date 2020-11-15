var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

const jwtUtils = require('../../module/jwt');

/*
로그인
METHOD       : POST
URL          : /auth/login
BODY         : id = 아이디
               password = 회원가입 패스워드
*/

router.post('/', async(req, res) => {
    const loginQuery = 'SELECT * FROM User WHERE id = ?';
    const loginResult = await db.queryParam_Parse(loginQuery, [req.body.id]);

    //아이디 존재X
    if(loginResult[0] == null){
        console.log("아이디가 존재하지 않습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_EXIST_ID));
    }
    //아이디 존재 => 비밀번호 일치 검사
    else {
        console.log("아이디가 존재합니다.");
        const salt = loginResult[0].salt;
        crypto.pbkdf2(req.body.password.toString(), salt, 1000, 32, 'SHA512', (err, key) => {
            const hashedEnterPw = key.toString('base64');
            
            const canLogin = (loginResult[0].password == hashedEnterPw) ? true : false;
            console.log(loginResult[0].password);
            console.log(hashedEnterPw)

            //비밀번호 일치
            if(canLogin){
                const token = jwtUtils.sign(loginResult[0]);
                console.log("로그인 성공.");
                res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SIGNIN, token));
            }
            //비밀번호 불일치
            else {
                console.log("비밀번호가 일치하지 않습니다.");
                res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.NOT_CORRECT_PASSWORD));
            }
        });
    }
});

module.exports = router;