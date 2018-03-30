import Vue from 'vue'
import Router from 'vue-router'
import { LocalStore as Store } from '@/vendor/store';
import Shop from '@/components/Admin/Shop'
import Member from '@/components/Admin/Member'
import Qrcode from '@/components/Admin/Qrcode'
import Level from '@/components/Admin/Level'
import Login from '@/components/Admin/Login'
import Admin from '@/components/Admin/Admin'
import History from '@/components/Admin/History'
import { isSuper } from '@/vendor/util';
// import Music from '@/Admin/Music'
Vue.use(Router)

const router = new Router({
  routes: [
    {
      path: '/member',
      name: 'member',
      component: Member
    }, 
    {
      alias: '/',
      path: '/shop',
      name: 'shop',
      component: Shop
    },
    {
      path: '/qrcode',
      name: 'qrcode',
      component: Qrcode
    }, 
    {
      path: '/level',
      name: 'level',
      component: Level
    }, 
    {
      path: '/login',
      name: 'login',
      component: Login
    }, 
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    }, 
    {
      path: '/history',
      name: 'history',
      component: History,
    }
  ]
});

router.beforeEach((to, from, next) => {
  const matches = to.matched;
  const hasLogin = Store.get('admin_user');
  const isLogin = to.name === 'login';
  const isForce = !!to.params.force;
  let is_super = isSuper(hasLogin);
  if (!hasLogin && !isLogin) {
    next({name: 'login' , params: { path: to.fullPath }});
  } else if (hasLogin && isLogin && !isForce) {
    // 已登录状态下手动刷新login页面
    next('/');
  } else {
    next();
  }
});

export default router;
