import Vue from 'vue'
import Router from 'vue-router'
import axios from 'axios';
import PageSearch from '../components/Home/PageSearch'
import PageList from '../components/Home/PageList'
import PageError from '../components/Home/PageError'
import PageMsgBoard from '../components/Home/PageMsgBoard'
import DataBase from '@/vendor/database';
import { getAuthorizeURL, getUserInfo, verifyToken } from '@/vendor/project';
import { LocalStore as Store } from '@/vendor/store';
import { getQueryStr } from '@/vendor/util';
// import { Indicator } from 'mint-ui';
Vue.use(Router)
// 获取用户数据库对象
const User = DataBase.Object.extend('music_user');

const router = new Router({
    routes: [{
            name: 'search',
            path: '/search',
            component: PageSearch
        },
        {
            path: '/list',
            name: 'list',
            component: PageList,
        },
        {
            path: '/msgboard',
            name: 'msgboard',
            component: PageMsgBoard
        },
        {
            path: '/error',
            name: 'error',
            meta: {
                single: true,
            },
            component: PageError,
        },
        {
            path: '/logout',
            name: 'logout',
            meta: {
                single: true,
            },
            beforeEnter(to, from, next) {
                Store.clearAll();
                next('/error');
            },
        },
        {
            path: '*',
            // 自动跳转到search页面
            beforeEnter(to, from, next) {
                next('/search');
            },
        },
    ]
})

// 进入路由前（微信环境）
router.beforeEach((to, from, next) => {
    // localstorage 经实验，在微信中切换帐号会清空，所以使用localstorage存储openId比较合适
    const musicUser = Store.get('music_user');
    // 二维码ID(二维码跳转带上)
    const qrcodeId = to.query.qId || (musicUser && musicUser.qrcodeId);
    // 商店ID(二维码跳转带上)
    const shopId = to.query.sId || (musicUser && musicUser.shopId);
    // 默认游客账户
    const openId = musicUser && musicUser.openIdReal;
    // 默认accessToken
    const accessToken = musicUser && musicUser.accessToken;
    // 换取用户信息的code
    const code = getQueryStr(location.search, 'code') || (musicUser && musicUser.code);
    // 扫描二维码跳转执行路由逻辑
    if (to.path == '/error') {
        next();
        // 没有附带店家ObjectId和二维码Id
    } else if (!qrcodeId || !shopId) {
        // 提示先添加二维码
        next('/error');
    } else {
        // 当扫码进入的时候才进行检测 其他时刻不检测
        if (to.path == '/') {
            // 跳转微信链接第一次没有musicUser
            if (!musicUser) {
                getUserInfo(code).then((data) => {
                    // 如果查询不到用户信息，则对用户进行默认注册为普通会员（leancloud中创建）
                    const user = new User();
                    // 通过code获取用户信息
                    let userName = data.nickname;
                    let accessToken = data.accessToken;
                    let openIdReal = data.openId;
                    // 如果数据库没有这个用户，新建一个
                    user.set({
                        openId: userName || 'tourist',
                        qrcode: DataBase.Object.createWithoutData('qrcode', qrcodeId),
                        shop: DataBase.Object.createWithoutData('shop', shopId)
                    });
                    user.save();
                    // 设置用户到localstorage
                    Store.set('music_user', { openId: userName || 'tourist', qrcodeId, shopId, openIdReal, accessToken});
                })
            } else {
                // 如果有了musicUser 检测token的有效性
                // 验证token的有效性
                verifyToken(openId, accessToken).then((res) => {
                    // 有效token 不需要重新请求
                    if (!res.verify) {
                        getUserInfo(code).then((data) => {
                            // 如果查询不到用户信息，则对用户进行默认注册为普通会员（leancloud中创建）
                            const user = new User();
                            // 通过code获取用户信息
                            let userName = data.userInfo.nickname;
                            let accessToken = data.accessToken;
                            let openIdReal = data.openId;
                            // 设置用户到localstorage
                            Store.set('music_user', { openId: userName || 'tourist', qrcodeId, shopId, openIdReal, accessToken});
                        })
                    }
                })
            }
        }
        next();
    }
});

export default router;