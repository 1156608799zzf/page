import Vue from 'vue'
import Router from 'vue-router'

Vue.use(Router)

export default new Router({
    routes: [
        {
            path: "/",
            redirect: "/index"
        },
        {
            path: '/index',
            component: resolve => require(['../view/Index'], resolve),
            name: 'index'
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
        },
        {
            path: "/mobile/chooseUser",
            component: resolve => require(['../view/Mobile/ChooseUser'], resolve),
            name: 'ChooseUser',
        }
    ]
})
