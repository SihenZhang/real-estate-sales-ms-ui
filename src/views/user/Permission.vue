<template>
  <div class="space-y-4">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item>用户管理</el-breadcrumb-item>
      <el-breadcrumb-item>权限列表</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="border-1 p-5 rounded space-y-4 shadow-lg">
      <el-table v-loading="loading" :data="permissionList.permissions" border stripe>
        <el-table-column fixed prop="id" label="#" width="48" />
        <el-table-column prop="name" label="权限名" min-width="144" />
        <el-table-column prop="code" label="权限代码" min-width="112">
          <template v-slot="{ row: permission }">
            <el-tag>{{permission.code}}</el-tag>
          </template>
        </el-table-column>
        <el-table-column prop="description" label="权限描述" min-width="320" show-overflow-tooltip />
      </el-table>
      <el-pagination
        v-model:current-page="paginationInfo.current"
        v-model:page-size="paginationInfo.size"
        :page-sizes="[2, 5, 8, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="permissionList.total"
        @size-change="getPermissionList"
        @current-change="getPermissionList"
      />
    </div>
  </div>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { ArrowRight } from '@element-plus/icons-vue'
import { getPermissions } from '../../api'

const paginationInfo = reactive({
  current: 1,
  size: 5
})

const loading = ref(true)
const permissionList = reactive({
  permissions: [],
  total: 0
})
const getPermissionList = async () => {
  loading.value = true
  try {
    const { data: { permissions, total } } = await getPermissions(paginationInfo)
    permissionList.permissions = permissions
    permissionList.total = total
  } catch (error) {
    permissionList.permissions = []
    permissionList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

getPermissionList()
</script>
