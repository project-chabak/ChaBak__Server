var express = require('express');
var router = express.Router();

router.use("/auth", require("./auth/index"));

router.use("/place", require("./place/index"));

module.exports = router;