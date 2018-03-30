// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import ElementUI from 'element-ui'
import axios from 'axios'
import Qs from 'qs';

import App from './AdminApp'
import router from './router/admin'

import Bus from '@/bus';
import DataBase from '@/vendor/database'

import * as Project from '@/vendor/project'
import statics from '@/vendor/statics';

import 'element-ui/lib/theme-default/index.css'
import './assets/style.less';
import './assets/admin.less';

// 绑定原型函数
Vue.prototype.$database = DataBase;
Vue.prototype.$bus = Bus;
Vue.prototype.$project = Project;
Vue.prototype.$http = axios;

// axios设置
axios.defaults.headers = { 'X-Requested-With': 'XMLHttpRequest' };
axios.defaults.paramsSerializer = params => Qs.stringify(params, { arrayFormat: 'brackets' });
axios.interceptors.request.use((config) => {
  if (config.data) {
    // post 请求
    config.headers['Content-Type'] = 'application/x-www-form-urlencoded';
    config.data = Qs.stringify(config.data, { arrayFormat: 'brackets' });
  }
  return config;
}, error => Promise.reject(error));
axios.interceptors.response.use((response) => {
  const data = response.data;
  return data;
}, (error) => {
  return Promise.reject(error);
});

Vue.use(ElementUI)

Vue.config.productionTip = false

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  template: '<App/>',
  components: { App }
})
