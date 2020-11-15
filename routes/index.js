var express = require('express');
var router = express.Router();

router.use("/home", require("./home/index"));

router.use("/auth", require("./auth/index"));

router.use("/place", require("./place/index"));

router.use("/review", require("./review/index"));

router.use("/mypage", require("./mypage/index"));

router.use("/register", require("./register/index"));

module.exports = router;