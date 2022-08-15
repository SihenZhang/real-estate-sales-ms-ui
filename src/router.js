import { createRouter, createWebHistory } from 'vue-router'
import { progressStart, progressDone } from './progress/progress'
import { useUserStore } from './store'
import { ElMessage } from 'element-plus'
import { useTitle } from '@vueuse/core'

const routes = [
  {
    path: '/',
    redirect: '/home'
  },
  {
    path: '/login',
    name: '登录',
    component: () => import('./views/Login.vue')
  },
  {
    path: '/home',
    name: '主页',
    component: () => import('./views/Home.vue'),
    redirect: '/index',
    children: [
      {
        path: '/index',
        name: '首页',
        component: () => import('./views/Index.vue')
      },
      {
        path: '/users',
        name: '用户信息管理',
        meta: { permission: 'user:query' },
        component: () => import('./views/user/User.vue')
      },
      {
        path: '/roles',
        name: '角色管理',
        meta: { permission: 'role:query' },
        component: () => import('./views/user/Role.vue')
      },
      {
        path: '/permissions',
        name: '权限列表',
        meta: { permission: 'permission:query' },
        component: () => import('./views/user/Permission.vue')
      },
      {
        path: '/customers',
        name: '客户管理',
        meta: { permission: 'customer:query' },
        component: () => import('./views/Customer.vue')
      },
      {
        path: '/houses',
        name: '楼盘管理',
        meta: { permission: 'house:query' },
        component: () => import('./views/house/House.vue')
      },
      {
        path: '/houses/add',
        name: '添加楼盘',
        meta: { permission: 'house:create' },
        component: () => import('./views/house/AddHouse.vue')
      },
      {
        path: '/houses/:id/units',
        name: '户型管理',
        meta: { permission: 'house_unit:query' },
        component: () => import('./views/house/HouseUnit.vue')
      },
      {
        path: '/houses/:id/photos',
        name: '楼盘图片管理',
        meta: { permission: 'house_photo:query' },
        component: () => import('./views/house/HousePhoto.vue')
      },
      {
        path: '/sales',
        name: '销售信息管理',
        meta: { permission: 'sales:query' },
        component: () => import('./views/sales/Sales.vue')
      },
      {
        path: '/sales/add',
        name: '添加销售信息',
        meta: { permission: 'sales:create' },
        component: () => import('./views/sales/AddSales.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from) => {
  console.log(from)
  console.log(to)
  // 路由跳转前启动进度条
  progressStart()
  if (to.path !== '/login') {
    const userStore = useUserStore()
    try {
      // 如果未登录，获取当前用户信息
      if (!userStore.isLogin) {
        await userStore.loadCurrentUser()
      }
      if (to.meta.permission && !userStore.hasPermission(to.meta.permission)) {
        ElMessage.error(`无此权限：${to.meta.permission}`)
        return false
      }
    } catch {
      return '/login'
    }
  }
})

router.afterEach((to, from) => {
  // 修改标题
  const title = useTitle()
  title.value = `${to.name} · 房产销售管理网站`
  // 路由跳转后结束进度条
  progressDone()
})

export default router
