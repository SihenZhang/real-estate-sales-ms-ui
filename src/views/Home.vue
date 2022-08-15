<template>
  <el-container class="h-screen">
    <el-header ref="headerRef">
      <div class="flex justify-between items-center h-full">
        <div class="flex items-center space-x-4">
          <img class="w-10 filter brightness-10000" src="../assets/logo.png" alt="logo" />
          <h1 class="text-white text-2xl font-bold">房产销售管理网站</h1>
        </div>
        <div class="flex items-center space-x-3">
          <span class="text-white">欢迎您，<strong>{{userStore.user.realName}}</strong></span>
          <el-button type="info" @click="quit">退出</el-button>
        </div>
      </div>
    </el-header>
    <el-container>
      <el-aside>
        <el-menu router :default-active="route.path">
          <template v-for="item in activeMenu" :key="item.id">
            <!-- 若二级菜单不为空，则使用 sub-menu 渲染一级菜单 -->
            <el-sub-menu v-if="item.children && item.children.length !== 0" :index="item.path">
              <!-- 一级菜单模板区域 -->
              <template #title>
                <el-icon><component :is="item.icon" /></el-icon>
                <span>{{item.name}}</span>
              </template>
              <!-- 二级菜单 -->
              <el-menu-item v-for="subItem in item.children" :key="subItem.id" :index="subItem.path">
                <el-icon><component :is="subItem.icon" /></el-icon>
                <span>{{subItem.name}}</span>
              </el-menu-item>
            </el-sub-menu>
            <!-- 否则，若二级菜单为空，则使用 menu-item 渲染一级菜单 -->
            <el-menu-item v-else :index="item.path">
              <el-icon><component :is="item.icon" /></el-icon>
              <span>{{item.name}}</span>
            </el-menu-item>
          </template>
        </el-menu>
      </el-aside>
      <el-main ref="mainRef">
        <el-scrollbar view-class="p-5">
          <router-view />
        </el-scrollbar>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed, markRaw, reactive, ref } from 'vue'
import { Key, MessageBox, OfficeBuilding, Unlock } from '@element-plus/icons-vue'
import { Person20Regular, PersonInfo20Regular, PremiumPerson20Regular } from '@vicons/fluent'
import { cloneDeep } from 'lodash'
import { logout } from '../api'
import { useUserStore } from '../store'
import { useRoute, useRouter } from 'vue-router'
import { useCssVar, useResizeObserver } from '@vueuse/core'

const route = useRoute()
const router = useRouter()

const userStore = useUserStore()

// 默认菜单
const menu = reactive([
  {
    id: 101,
    name: '用户管理',
    icon: markRaw(Person20Regular),
    path: '/users_manage',
    permission: ['user:query', 'role:query', 'permission:query'],
    children: [
      {
        id: 102,
        name: '用户信息管理',
        icon: markRaw(PersonInfo20Regular),
        path: '/users',
        permission: 'user:query'
      },
      {
        id: 103,
        name: '角色管理',
        icon: markRaw(Key),
        path: '/roles',
        permission: 'role:query'
      },
      {
        id: 104,
        name: '权限列表',
        icon: markRaw(Unlock),
        path: '/permissions',
        permission: 'permission:query'
      }
    ]
  },
  {
    id: 111,
    name: '楼盘管理',
    icon: markRaw(OfficeBuilding),
    path: '/houses',
    permission: 'house:query'
  },
  {
    id: 121,
    name: '客户管理',
    icon: markRaw(PremiumPerson20Regular),
    path: '/customers',
    permission: 'customer:query'
  },
  {
    id: 131,
    name: '销售信息管理',
    icon: markRaw(MessageBox),
    path: '/sales',
    permission: 'sales:query'
  }
])
// 根据权限列表动态渲染的菜单
const activeMenu = computed(() => {
  const newMenu = []
  for (const menuItem of menu) {
    // 权限为数组，需要根据或运算进行多种权限的判断
    if (Array.isArray(menuItem.permission)) {
      // 没有菜单项所需的权限，直接跳过
      if (!menuItem.permission.find(c => userStore.hasPermission(c))) {
        continue
      }
      // 深拷贝菜单项内容，并将菜单项的 children 字段设置为空
      const newItem = cloneDeep(menuItem)
      newItem.children = []
      if (menuItem.children && menuItem.children.length !== 0) {
        // 判断子菜单项的权限
        for (const subMenuItem of menuItem.children) {
          if (userStore.hasPermission(subMenuItem.permission)) {
            newItem.children.push(subMenuItem)
          }
        }
      }
      newMenu.push(newItem)
    } else {
      // 权限为字符串，直接判断是否包含权限
      if (userStore.hasPermission(menuItem.permission)) {
        newMenu.push(menuItem)
      }
    }
  }
  return newMenu
})

const quit = async () => {
  try {
    const { message } = await logout()
    userStore.$reset()
    router.push('/login')
    ElMessage.success(message)
  } catch (error) {
    ElMessage.error(error)
  }
}

const headerRef = ref()
const mainRef = ref()
const headerHeightForMain = useCssVar('--el-header-height', mainRef)
useResizeObserver(headerRef, entries => {
  const { height: headerHeight } = entries[0].contentRect
  headerHeightForMain.value = `${headerHeight}px`
})
</script>

<style scoped>
.el-header {
  background-color: var(--el-color-primary);
}

.el-aside {
  @apply w-56 border-r-1 bg-gray-100;
}

.el-menu {
  @apply border-none;
  --el-menu-bg-color: transparent;
}

.el-main {
  height: calc(100vh - var(--el-header-height));
  --el-main-padding: 0;
}
</style>
