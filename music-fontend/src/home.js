// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Qs from 'qs';
import FastClick from 'fastclick'
import VueRouter from 'vue-router'
import axios from 'axios';
import App from './HomeApp'
import router from './router/home'
import statics from '@/vendor/statics';
import { Indicator } from 'mint-ui';
import Bus from '@/bus';
import './assets/style.less';
Vue.config.productionTip = false;
Vue.prototype.$http = axios;
Vue.prototype.$bus = Bus;

// axios配置
axios.defaults.headers = { 'X-Requested-With': 'XMLHttpRequest' };
axios.defaults.paramsSerializer = params => Qs.stringify(params, { arrayFormat: 'brackets' });
axios.interceptors.request.use((config) => {
  Indicator.open('加载中...');
  if (config.data) {
    // post 请求
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    config.data = Qs.stringify(config.data, { arrayFormat: 'brackets' });
  }
  return config;
}, error => Promise.reject(error));
axios.interceptors.response.use((response) => {
  Indicator.close();
  const data = response.data;
  return data;
}, (error) => {
  return Promise.reject(error);
});

// fastclick绑定
FastClick.attach(document.body);

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
