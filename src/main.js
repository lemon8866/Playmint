import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import App from './App.vue'
import './style.css'

// 导入页面组件
import Home from './views/Home.vue'
import AppDetail from './views/AppDetail.vue'
import About from './views/About.vue'

/**
 * 路由配置
 * 定义应用的所有路由规则
 */
const routes = [
  {
    path: '/',
    name: 'Home',
    component: Home,
    meta: { title: '首页 - 轻玩' }
  },
  {
    path: '/app/:id',
    name: 'AppDetail',
    component: AppDetail,
    meta: { title: '应用详情 - 轻玩' }
  },
  {
    path: '/about',
    name: 'About',
    component: About,
    meta: { title: '关于我们 - 轻玩' }
  },
  {
    path: '/:pathMatch(.*)*',
    redirect: '/'
  }
]

/**
 * 创建路由实例
 */
const router = createRouter({
  history: createWebHistory(),
  routes,
  scrollBehavior(to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { top: 0 }
    }
  }
})

/**
 * 路由守卫 - 设置页面标题
 */
router.beforeEach((to, from, next) => {
  if (to.meta.title) {
    document.title = to.meta.title
  }
  next()
})

/**
 * 创建Vue应用实例
 */
const app = createApp(App)

// 使用路由
app.use(router)

// 挂载应用
app.mount('#app')