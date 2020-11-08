var express = require('express');
var router = express.Router();

const crypto = require('crypto-promise');

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

/*
회원가입
METHOD       : POST
URL          : /auth/signup
BODY         : id = 회원가입 아이디
               nickname = 회원가입 닉네임
               password = 회원가입 패스워드
               confirmPassword = 회원가입 패스워드 확인
               gender = 회원가입 성별
               birthDate = 회원가입 생년월일
*/

router.post('/', async(req, res) => {
    const signupQuery = 'INSERT INTO User (id, password, nickname, birthDate, gender, salt) VALUES (?, ?, ?, ?, ?, ?)';

    const buf = await crypto.randomBytes(64);
    const salt = buf.toString('base64');
    console.log(req.body.password);
    const hashedPw = await crypto.pbkdf2(req.body.password.toString(), salt, 1000, 32, 'SHA512');
    const signupResult = await db.queryParam_Arr(signupQuery, [req.body.id, hashedPw.toString('base64'), req.body.nickname, req.body.birthDate, req.body.gender, salt]);

    if (!signupResult) {
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.FAIL_SIGNUP));
    } else { //쿼리문이 성공했을 때
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_SIGNUP));
    }
});

/*
이메일 중복체크
METHOD       : GET
URL          : /auth/signup/check?id={id}
PARAMETER    : id = 아이디
*/

router.get('/check', async(req,res) =>{
    const checkidQuery = 'SELECT * FROM User WHERE id = ?';
    const checkidResult = await db.queryParam_Parse(checkidQuery, [req.query.id]);
    
    if (checkidResult[0] == null) {
        console.log("아이디 사용 가능");
        res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.USABLE_ID));
    } else {
        console.log("이미 존재하는 아이디");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.ALREADY_EXIST_ID));
    }
});

module.exports = router;