var express = require('express');
var router = express.Router();

//회원가입
router.use("/signup", require("./signup"));
//로그인
router.use("/login", require("./login"));
//회원탈퇴
router.use("/withdraw", require("./withdraw"));

module.exports = router;