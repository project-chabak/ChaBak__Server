var express = require('express');
var router = express.Router();

//장소 등록용
router.use("/register", require("./register"));

//전체 리스트 조회
router.use("/list", require("./list"));
//좋아요 리스트 조회 & 상세 좋아요 or 좋아요 취소
router.use("/like", require("./like"));
//상세 뷰 조회
router.use("/detail", require("./detail"));

module.exports = router;