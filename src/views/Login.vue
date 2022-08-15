<template>
  <div class="flex justify-center items-center h-screen">
    <div class="w-112 max-w-9/10 border-1 p-10 rounded bg-white bg-opacity-80 shadow-lg">
      <el-form ref="loginFormRef" :model="loginForm" :rules="loginFormRules">
        <div class="flex justify-center items-center w-full mb-8 space-x-4">
          <img class="w-10" src="../assets/logo.png" alt="logo" />
          <h1 class="text-2xl font-bold">房产销售管理网站</h1>
        </div>
        <el-form-item prop="username">
          <el-input v-model="loginForm.username" :prefix-icon="User" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item prop="password">
          <el-input v-model="loginForm.password" type="password" :prefix-icon="Unlock" show-password placeholder="请输入密码" />
        </el-form-item>
        <el-button class="w-full" type="primary" @click="submitLoginForm">登录</el-button>
      </el-form>
    </div>
    <div class="fixed inset-0 -z-100 bg-sky-50">
      <img class="absolute bottom-16 left-16 w-100" src="../assets/undraw_secure_login_pdn4.svg" />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { Unlock, User } from '@element-plus/icons-vue'
import { login } from '../api'
import { useUserStore } from '../store'
import { useRouter } from 'vue-router'

const router = useRouter()

const userStore = useUserStore()

const loginForm = reactive({
  username: '',
  password: ''
})
const loginFormRef = ref()
const loginFormRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
  ]
})
const submitLoginForm = async () => {
  if (!loginFormRef.value) {
    return
  }
  await loginFormRef.value.validate(async valid => {
    if (!valid) {
      return
    }
    try {
      const { data, message } = await login(loginForm)
      userStore.user = data
      router.push('/home')
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}
</script>
