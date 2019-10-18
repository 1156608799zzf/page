import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: "/",
            redirect: "/mobile"
        },
        {
            path: '/pc',
            component: resolve => require(['../view/PC'], resolve),
            name: 'pc'
        },
        {
            path: '/mobile',
            component: resolve => require(['../view/Mobile'], resolve),
            name: 'mobile'
        }
    ]
})
