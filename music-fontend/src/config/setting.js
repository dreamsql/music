const isdev = process.env.NODE_ENV == 'development';
let base;
// 微信相关;
const weixin = {
    // 信息
    appid: 'wxdd79669be3886b21',
    appSecret: '6f2533b76f33496183234b7c328312aa'
};
// 服务器相关嘻嘻
base = isdev? { baseUrl: 'http://localhost:3000' } : { baseUrl: 'http://www.sdstyle.cn' };
export { base, weixin };