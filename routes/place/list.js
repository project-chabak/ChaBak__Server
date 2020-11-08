var express = require('express');
var router = express.Router();

const defaultRes = require('../../module/utils/utils');
const statusCode = require('../../module/utils/statusCode');
const resMessage = require('../../module/utils/responseMessage');

const db = require('../../module/pool');

/*
전체 리스트 조회
METHOD       : GET
URL          : /place/list?order={order}&category={category}&toilet&cooking&store
PARAMETER    : order = newest (DEFAULT = 별점 순)
               category = 카테고리 (DEFAULT = 전체)
               toilet = O or X
               cooking = O or X
               store = O or X
TOKEN        : 토큰 값
*/

router.get('/', async(req,res) =>{

    //PARAMETER 별로 나누기

    //테이블에 연속해서 필터를 거는 방법
});

module.exports = router;