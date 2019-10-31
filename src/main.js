// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import axios from './axios/axios'
import common from './assets/js/common'
import {Message, Spin} from 'iview'
import {ToastPlugin,LoadingPlugin } from 'vux'
import './assets/css/common.scss'
Vue.prototype.$axios = axios;
Vue.prototype.GLOBAL = common;
Vue.config.productionTip = false;
if (common.isPc()) {
    Vue.prototype.$Message = Message;
    Vue.prototype.$Spin = Spin;
}  else {
    Vue.use(ToastPlugin, {position: 'middle'});
    Vue.use(LoadingPlugin)
    document.body.style.background = '#FBF9FE'
}
//事件总线
var eventBus = {
    install(Vue, options) {
        Vue.prototype.$bus = new Vue();
    }
};
Vue.use(eventBus);
/* eslint-disable no-new */
let that = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
});

export default that;
