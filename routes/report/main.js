var express = require('express');
var nodemailer = require('nodemailer');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const authUtil = require('../../module/utils/authUtil');

const db = require('../../module/pool');

const serverEmail = require('../../config/mailConfig');

/*
여행지 제보
METHOD       : POST
URL          : /report
BODY         : name = 장소 이름
               address = 장소 주소
               content = 장소 설명
               toilet = 화장실 유무
               store = 편의점 유무
               cooking = 취사가능 여부
TOKEN        : 토큰 값
*/

router.post('/', authUtil, async (req, res) => {

    //ReportPlace 테이블에 INSERT : 장소
    const insertReportPlaceQuery = 'INSERT INTO ReportPlace (userIdx, placeName, placeAddress, placeContent, placeToilet, placeStore, placeCooking) VALUES (?, ?, ?, ?, ?, ?, ?)';
    const userIdx = req.decoded.userIdx;
    const placeName = req.body.name;
    const placeAddress = req.body.address;
    const placeContent = req.body.content;
    const placeToilet = req.body.toilet;
    const placeStore = req.body.store;
    const placeCooking = req.body.cooking;
    
    const insertReportPlaceResult = await db.queryParam_Arr(insertReportPlaceQuery, [userIdx, placeName, placeAddress, placeContent, placeToilet, placeStore, placeCooking]);

    if (!insertReportPlaceResult) {
        console.log("DB에 제보 장소를 삽입할 수 없습니다.");
        res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.DB_ERROR));
    } 
    else {
        console.log("제보장소 DB 저장 성공");

        //email보내기
        const transporter = nodemailer.createTransport(serverEmail);

        let mailOptions = {
            from: serverEmail.auth.user,    // 발송 메일 주소
            to: serverEmail.auth.user,      // 수신 메일 주소
            subject: '[차박2일]' + req.decoded.nickname +' 님의 여행지 제보 입니다.',   // 제목
            html: `<h1>여행지 제보</h1>
            <h3>여행지 이름</h3>
            <p>${placeName}</p>
            <h3>여행지 주소</h3>
            <p>${placeAddress}</p>
            <h3>여행지 설명</h3>
            <p>${placeContent}</p>
            <h3>여행지 화장실 유무</h3>
            <p>${placeToilet}</p>
            <h3>여행지 편의점 유무</h3>
            <p>${placeStore}</p>
            <h3>여행지 취사가능 여부</h3>
            <p>${placeCooking}</p>
            `  // 내용
        };

        transporter.sendMail(mailOptions, function(error, info){
            if (error) {
              console.log(error);
              res.status(200).send(defaultRes.successFalse(statusCode.OK, resMessage.SUCCESS_REPORT_PLACE));
            }
            else {
              console.log('Email sent: ' + info.response);
              res.status(200).send(defaultRes.successTrue(statusCode.OK, resMessage.SUCCESS_REPORT_PLACE));
            }
        });
    }
});

module.exports = router;