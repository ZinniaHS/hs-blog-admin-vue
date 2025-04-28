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
            path: '/Login',
            name: 'Login',
            meta: {title :'登录'},
            component: ()=>import( '../view/Login.vue'),
        },
        {
            path: '/manager',
            name: 'manager',
            component: ()=>import( '../view/Manager.vue'),
            meta: {
                title: '管理页',
                requiresAuth: true
            },
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
                {
                    path: 'bookCategory',
                    name: 'bookCategory',
                    meta: {title :'图书分类管理'},
                    component: ()=>import( '../view/BookCategory.vue'),
                },
                {
                    path: 'blog',
                    name: 'blog',
                    meta: {title :'博客管理'},
                    component: ()=>import( '../view/Blog.vue'),
                },
            ]
        }
    ]
})

router.beforeEach((to, from, next) => {
    document.title = to.meta.title || '默认标题';

    const token = localStorage.getItem('token');
    const requiresAuth = to.matched.some(record => record.meta.requiresAuth);

    // 需要认证但无token时跳转登录
    if (requiresAuth && !token) {
        next({
            path: '/Login',
            query: { redirect: to.fullPath } // 携带原始路径
        });
    }
    // 已登录时访问登录页跳转首页
    else if (to.path === '/Login' && token) {
        next('/manager/home');
    }
    else {
        next();
    }
});

export default router

