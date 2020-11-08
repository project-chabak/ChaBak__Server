const jwt = require('../jwt');

const resMessage = require('./responseMessage');
const statusCode = require('./statusCode');
const util = require('./utils');

const authUtil = async (req, res, next) => {
    const token = req.headers.token;

    //토큰이 없을 경우
    if (!token ){
        return res.json(util.successFalse(statusCode.BAD_REQUEST, resMessage.EMPTY_TOKEN));
    }
    else {
        const user = jwt.verify(token);

        //토큰 값으로 사용자 분리할 수 없는 경우
        if (user == -1) {
            return res.json(util.successFalse(statusCode.UNAUTHORIZED, resMessage.INVALID_TOKEN));
        }
        //사용자 분리할 수 있는 경우
        else {
            req.decoded = user;
            next();
        }
    }
};

module.exports = authUtil;