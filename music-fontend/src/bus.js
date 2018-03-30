import Vue from 'vue';
import DataBase from '@/vendor/database';
import { LocalStore as Store  } from '@/vendor/store';
import axios from 'axios';
import { weixin as SETTING } from '@/config/setting';

export default new Vue({
  data() {
    return {
      musicList: [],
      adminUser: {
        objectId: '',
        shop: [],
        role: 'manager',
      },
    };
  },
  methods: {
    // 通过公众号获得用户信息
    getUserInfo(code, state) {
      return axios.get(`https://api.weixin.qq.com/sns/oauth2/access_token?appid=${SETTING.appid}&secret=${SETTING.appSecret}&code=${code}&grant_type=authorization_code`)
      .then((access_msg) => {
        if (!access_msg.errcode) {
          return {
            access_token: access_msg.access_token,
            openid: access_msg.openid
          }
        } else {
          throw Error('请求错误');
        }
      }).then((access) => {
        axion.get(`https://api.weixin.qq.com/sns/userinfo?access_token=${access.access_token}&openid=${access.openid}&lang=zh_CN`).then((msg) => {
          console.log(msg);
          // 返回用户信息供白名单使用
          return msg;
        })
      }).catch((error) => {
        console.log(error);
        return null;
      })
    },
    getShopList() {
      return new Promise((resolve, reject) => {
        const query = new DataBase.Query('shop');
        query.find().then((data) => {
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
      });
    },
    getQrcodeList(shopId) {
      return new Promise((resolve, reject) => {
        const query = new DataBase.Query('qrcode');
        const shop = DataBase.Object.createWithoutData('shop', shopId);
        console.log(shopId);
        query.equalTo('shop', shop);
        query.find().then((data) => {
          resolve(data);
        }).catch((error) => {
          reject(error);
        });
      });
    },
    // 获得当前用户管理的商店（选择第一家）
    getShop() {
      return new Promise((resolve, reject) => {
        if (!Store.get('shop')) {
          const shop = Store.get('admin_user').shop[0];
          const query = new DataBase.Query('shop');
          if (!shop) {
            alert('请联系管理员绑定该帐号可管理的店面');
            window.location.replace('/admin.html');
            return;
          }
          query.get(shop.objectId).then((data) => {
            Store.set('shop', data);
            resolve(Store.get('shop'));
          });
        } else {
          resolve(Store.get('shop'));
        }
      });
    },
  },
});
