<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item>销售信息管理</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <router-link v-if="userStore.hasPermission('sales:create')" to="/sales/add">
          <el-button type="success" :icon="Plus">添加销售信息</el-button>
        </router-link>
        <el-table v-loading="loading" :data="salesList.sales" border stripe>
          <el-table-column fixed prop="id" label="#" width="48" />
          <el-table-column prop="houseName" label="楼盘名称" min-width="160" />
          <el-table-column prop="unitTitle" label="户型标题" min-width="160" />
          <el-table-column prop="customerRealName" label="客户真实姓名" width="176" />
          <el-table-column prop="salesTime" label="销售时间" width="128" />
          <el-table-column prop="completeTime" label="交房时间" min-width="128" />
          <el-table-column prop="totalPrice" label="总价" min-width="112" />
          <el-table-column prop="deposit" label="首付" min-width="112" />
          <el-table-column prop="mortgage" label="月供" min-width="112" />
          <el-table-column fixed="right" label="操作" width="200">
            <template v-slot="{ row: sales }">
              <el-button v-if="userStore.hasPermission('sales:update')" type="primary" size="small" :icon="Edit">编辑</el-button>
              <el-button v-if="userStore.hasPermission('sales:delete')" type="danger" size="small" :icon="Delete">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="paginationInfo.current"
          v-model:page-size="paginationInfo.size"
          :page-sizes="[2, 5, 8, 10]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="salesList.total"
          @size-change="getSalesList"
          @current-change="getSalesList"
        />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { reactive, ref } from 'vue'
import { getSales } from '../../api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const paginationInfo = reactive({
  current: 1,
  size: 2
})

const loading = ref(true)
const salesList = reactive({
  sales: [],
  total: 0
})
const getSalesList = async () => {
  loading.value = true
  try {
    const { data: { sales, total } } = await getSales(paginationInfo)
    salesList.sales = sales
    salesList.total = total
  } catch (error) {
    salesList.sales = []
    salesList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

getSalesList()
</script>
