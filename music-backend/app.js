'use strict';
const express = require('express');
const timeout = require('connect-timeout');
const path = require('path');
// const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const cors = require('cors');
// 加载云函数定义，你可以将云函数拆分到多个文件方便管理，但需要在主文件中加载它们
// require('./cloud');

const app = express();

const corsOptions = {
  // 跨域设置
  origin: ['http://www.sdstyle.cn','http://www.sdstyle.cn:3000','http://localhost:9999', 'http://www.laidianyinyue.com:9999'],
};

app.use(cors(corsOptions));
// 设置模板引擎
app.set('views', path.join(__dirname, 'views'));
// app.set('view engine', 'ejs');


// 设置默认超时时间
app.use(timeout('15s'));

app.enable('trust proxy');
// 需要重定向到 HTTPS 可去除下一行的注释。
// app.use(AV.Cloud.HttpsRedirect());

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
// app.use(cookieParser());

// 可以将一类的路由单独保存在一个文件中
// app.use('/wechat', require('./routes/wechatBot'));
app.use('/weixin', require('./routes/weixin'));

app.use('/api', require('./routes/api'));

app.get('/check', function (req, res) {
  if (req.protocol === 'https') {
    res.status(200).send('welcome https');
  } else {
    res.status(200).send('welcome.http');
  }
})
app.use(express.static('public'));


app.use(function(req, res, next) {
  // 如果任何一个路由都没有返回响应，则抛出一个 404 异常给后续的异常处理器
  if (!res.headersSent) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
  }
});

// error handlers
app.use(function(err, req, res, next) {
  if (req.timedout && req.headers.upgrade === 'websocket') {
    // 忽略 websocket 的超时
    return;
  }

  var statusCode = err.status || 500;
  if (statusCode === 500) {
    console.error(err.stack || err);
  }
  if (req.timedout) {
    console.error('请求超时: url=%s, timeout=%d, 请确认方法执行耗时很长，或没有正确的 response 回调。', req.originalUrl, err.timeout);
  }
  res.status(statusCode);
  // 默认不输出异常详情
  var error = {};
  if (app.get('env') === 'development') {
    // 如果是开发环境，则将异常堆栈输出到页面，方便开发调试
    error = err;
  }
  res.send(err);
  // res.render('error', {
  //   message: err.message,
  //   error: error
  // });
});

module.exports = app;
