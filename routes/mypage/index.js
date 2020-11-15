var express = require('express');
var router = express.Router();

//마이 페이지 조회
router.use("/", require("./main"));

module.exports = router;