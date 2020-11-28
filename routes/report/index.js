var express = require('express');
var router = express.Router();

//여행지 제보
router.use("/", require("./main"));

module.exports = router;