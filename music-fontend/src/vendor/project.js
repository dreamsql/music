import { weixin as SETTING, base as USERSETTING } from '@/config/setting';
import { LocalStore as Store } from '@/vendor/store';
import axios from 'axios';
import qs from 'qs';
var baseUrl = USERSETTING.baseUrl;
var appid = SETTING.appid; // lance
var path = SETTING.path;

const getAuthorizeURL = (redirect = path, state = '666', scope = 'snsapi_userinfo') => {
    var url = 'https://open.weixin.qq.com/connect/oauth2/authorize';
    var info = {
        appid: appid,
        redirect_uri: redirect,
        response_type: 'code',
        scope,
        state,
    };

    return `${url}?${qs.stringify(info)}#wechat_redirect`;
};
const dataParseJson = (arr) => {
    if (Array.isArray(arr)) {
        arr = arr.slice();
        arr.forEach((item, index) => {
            arr[index] = item.toJSON();
        });
        return arr;
    }
    return arr.toJSON();
};

// 通过公众号获得用户信息
const getUserInfo = (code) => {
    return axios.get(`${baseUrl}/weixin/code?code=${code}`)
        .then((data) => {
            return data;
        })
}
// 验证accessToken
const verifyToken = (openId, accessToken) => {
    return axios.get(`${baseUrl}/weixin/codeVerify?openId=${openId}&accessToken=${accessToken}`)
        .then((data) => {
            return data;
        })
}

const sortMusicList = (musicList) => {
    // 排序规则
    const music_now = Store.get('music_now');
    return musicList.sort((a, b) => {
        // 正在播放的歌曲永远在第一位
        if (a.objectId == music_now) {
            return -1;
        } else if (a.openId == b.openId) {

        } else if (a.openId == 'backend') {
            // 后台歌曲往后捎一捎
            return 1;
        } else if (b.openId == 'backend') {
            return -1;
        }
        // 两首歌曲置顶状态相同（都为false,都为true,或者都为undefined）
        if (a.top === b.top) {
            // if (a.openId == b.openId && a.openId == 'backend') {
            //
            // } else if (a.openId == 'backend') {
            //   return 1;
            // } else if (b.openId == 'backend') {
            //   return -1;
            // }
            // a,b 置顶状态相同（true:都置顶；false：都取消置顶；undefined：都未设置过）
            if (a.top === false) {
                // 如果都没置顶过，先点播的先播放
                return +new Date(a.createdAt) - +new Date(b.createdAt);
            } else {
                // 如果都置顶过，后点击置顶的先播放
                return +new Date(b.updatedAt) - +new Date(a.updatedAt);
            }
        } else if (a.top === true) {
            // a置顶排前
            return -1;
        } else if (b.top === true) {
            // a取消置顶，根据b是否置顶判断
            return 1;
        } else {
            // a 未设置过，b排前
            return 1;
        }
    });
};

export {
    dataParseJson,
    getAuthorizeURL,
    sortMusicList,
    getUserInfo,
    verifyToken
};