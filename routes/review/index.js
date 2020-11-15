var express = require('express');
var router = express.Router();

//리뷰 리스트 조회
router.use("/", require("./list"));
//리뷰 작성
router.use("/write", require("./write"));
//리뷰 좋아요 or 좋아요 취소
router.use("/like", require("./like"));

module.exports = router;