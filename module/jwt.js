const jwt = require('jsonwebtoken');

const secretKey = require('../config/secretKey');

module.exports = {
    sign: (user) => {
        const payload = {
            userIdx: user.userIdx,
            id: user.id,
            nickname: user.nickname
        };

        const encodedToken = {
            token: jwt.sign(payload, secretKey)
        };

        return encodedToken;
    },
    verify: (token) => {
        let decoded;
        try {
            decoded = jwt.verify(token, secretKey);
        } catch (err) {
            console.log("jwt verify error");
            return -1;
        }
        return decoded;
    }
};