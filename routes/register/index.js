var express = require('express');
var router = express.Router();

//여행지 등록
router.use("/place", require("./place"));
//카테고리 등록
router.use("/category", require("./category"));
//카테고리 업데이트
router.use("/updateCategory", require("./updateCategory"));

module.exports = router;