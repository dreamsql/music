### music-api
##### 一、安装项目依赖
npm i

##### 二、修改项目配置公众号
`package.json`文件中的`scripts`中`music`的appid和secret修改为绑定的微信公众号服务接口的appid和secret(已改)
```
"scripts": {
    "music": "cross-env APPID=微信公众号appid SECRET=微信公众号secret node server.js",
},
```

##### 三、运行项目
在命令行使用
```
npm run dev
```
即可

##### 四、测试项目是否可运行
打开浏览器访问：

搜索歌曲：
http://localhost:3000/api/search/song/netease?key=周杰伦&limit=10&page=1

获取歌曲播放地址：
http://localhost:3000/api/get/song/qq?id=003OUlho2HcRHC
