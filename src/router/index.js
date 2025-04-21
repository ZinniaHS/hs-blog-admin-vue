import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        // 进入重定向至首页
        {
            path: '/',
            redirect: '/manager/home',
        },
        // 404页面
        {
            path: '/:pathMatch(.*)*',
            redirect: '/404',
        },
        {
            path: '/404',
            name: '404',
            meta: {title :'页面未找到'},
            component: ()=>import( '../view/404.vue'),
        },
        {
            path: '/manager',
            name: 'manager',
            component: ()=>import( '../view/Manager.vue'),
            children: [
                {
                    // 子路由路径前不用添加'/'
                    path: 'home',
                    name: 'home',
                    meta: {title :'主页'},
                    component: ()=>import( '../view/Home.vue'),
                },
                {
                    path: 'test',
                    name: 'test',
                    meta: {title :'测试'},
                    component: ()=>import( '../view/Test.vue'),
                },
                {
                    path: 'book',
                    name: 'book',
                    meta: {title :'图书管理'},
                    component: ()=>import( '../view/Book.vue'),
                },
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    document.title = to.matched[0].meta.title
    next()
})

export default router

