/**
 * @Author: Lancelot Lewis
 * @Date:   2017-05-25T19:12:46+08:00
 * @Email:  lancelot_lewis@163.com
 * @Last modified by:   Lancelot Lewis
 * @Last modified time: 2017-06-02T09:54:23+08:00
 * @License: MIT LICENSE
 * @Copyright: 2017 © Lancelot Lewis
 */
import engine from 'store/src/store-engine';
import sessionStorage from 'store/storages/sessionStorage';
import localStorage from 'store/storages/localStorage';
import cookieStorage from 'store/storages/cookieStorage';
import expirePlugin from 'store/plugins/expire';

const SessionStore = engine.createStore([
  sessionStorage,
]);
const LocalStore = engine.createStore([
  localStorage,
]);
const CookieStore = engine.createStore([
  cookieStorage,
]);

SessionStore.addPlugin(expirePlugin);
LocalStore.addPlugin(expirePlugin);
CookieStore.addPlugin(expirePlugin);

export {
  SessionStore,
  LocalStore,
  CookieStore,
};
