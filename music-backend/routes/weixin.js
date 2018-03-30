const appid = process.env.APPID || 'wxdd79669be3886b21';
const secret = process.env.SECRET || '6f2533b76f33496183234b7c328312aa';
const router = require('express').Router();
const http = require('http');

const OAuth = require('wechat-oauth');
const client = new OAuth(appid, secret);
// 微信认证
router.use('/codeVerify', (req, res) => {
    let openId = req.query.openId;
    let accessToken = req.query.accessToken;
    console.log(openId, accessToken);
    client.verifyToken(openId, accessToken, (result) => {
        console.log('codeVerify', result);
        // 凭证还有效
        if (result && result.errcode == '0') {
            res.send({
                verify: true
            })
        } else {
            res.send({
                verify: false
            })
        }
    })
})
router.use('/code', (req, res) => {
    let code = req.query.code;
    console.log('code', code);
    client.getAccessToken(code, (err, result) => {
        const accessToken = result.data.access_token;
        const openId = result.data.openid;
        client.getUser(openId, function (err, result) {
            console.log('userInfo', {result, accessToken, openId});
            var userInfo = result;
            res.send({
                userInfo,
                accessToken,
                openId
            });
        });
    });
})
module.exports = router;