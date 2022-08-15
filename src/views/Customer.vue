<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item>客户管理</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <el-button v-if="userStore.hasPermission('customer:create')" type="success" :icon="Plus" @click="addDialogVisible = true">添加客户</el-button>
        <el-table v-loading="loading" :data="customerList.customers" border stripe>
          <el-table-column fixed prop="id" label="#" width="48" />
          <el-table-column prop="username" label="用户名" min-width="160" />
          <el-table-column prop="realName" label="真实姓名" min-width="176" />
          <el-table-column prop="sex" label="性别" width="80" />
          <el-table-column prop="age" label="年龄" width="64" />
          <el-table-column prop="phone" label="电话" min-width="144" />
          <el-table-column fixed="right" label="操作" width="200">
            <template v-slot="{ row: customer }">
              <el-button v-if="userStore.hasPermission('customer:update')" type="primary" size="small" :icon="Edit" @click="openEditDialog(customer.id)">编辑</el-button>
              <el-button v-if="userStore.hasPermission('customer:delete')" type="danger" size="small" :icon="Delete" @click="removeCustomer(customer.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="paginationInfo.current"
          v-model:page-size="paginationInfo.size"
          :page-sizes="[2, 5, 8, 10]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="customerList.total"
          @size-change="getCustomerList"
          @current-change="getCustomerList"
        />
      </div>
    </div>
    <el-dialog v-model="addDialogVisible" title="添加客户" @close="resetForm(addFormRef)">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="addForm.username" />
        </el-form-item>
        <el-form-item label="密码" prop="password">
          <el-input v-model="addForm.password" type="password" show-password />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="addForm.realName" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="addForm.sex">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="addForm.age" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="addForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialogVisible" title="编辑客户" @close="resetForm(editFormRef)">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="editForm.username" />
        </el-form-item>
        <el-form-item label="真实姓名" prop="realName">
          <el-input v-model="editForm.realName" />
        </el-form-item>
        <el-form-item label="性别" prop="sex">
          <el-radio-group v-model="editForm.sex">
            <el-radio label="男" />
            <el-radio label="女" />
          </el-radio-group>
        </el-form-item>
        <el-form-item label="年龄" prop="age">
          <el-input v-model.number="editForm.age" />
        </el-form-item>
        <el-form-item label="电话" prop="phone">
          <el-input v-model="editForm.phone" />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowRight, Delete, Edit, Plus } from '@element-plus/icons-vue'
import { pick } from 'lodash'
import { useUserStore } from '../store'
import { createCustomer, deleteCustomer, getCustomers, getCustomerById, updateCustomer } from '../api'

const userStore = useUserStore()

const paginationInfo = reactive({
  current: 1,
  size: 5
})

const loading = ref(true)
const customerList = reactive({
  customers: [],
  total: 0
})
const getCustomerList = async () => {
  loading.value = true
  try {
    const { data: { customers, total } } = await getCustomers(paginationInfo)
    customerList.customers = customers
    customerList.total = total
  } catch (error) {
    customerList.customers = []
    customerList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

const resetForm = formEl => {
  if (!formEl) {
    return
  }
  formEl.resetFields()
}

const validatePhone = (rule, value, callback) => {
  if (!value || value === '') {
    return callback()
  }
  const regPhone = /^(?:0|86|\+86)?1[3-9]\d{9}$/
  if (regPhone.test(value)) {
    return callback()
  }
  callback(new Error('请输入合法的电话号码'))
}

const addDialogVisible = ref(false)

const addForm = reactive({
  username: '',
  password: '',
  realName: '',
  sex: '',
  age: '',
  phone: ''
})
const addFormRef = ref()
const addFormRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    { min: 6, max: 15, message: '长度在 6 到 15 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  age: [
    { type: 'number', message: '年龄必须是一个数字' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
})
const submitAddForm = async () => {
  if (!addFormRef.value) {
    return
  }
  await addFormRef.value.validate(async valid => {
    if (!valid) {
      return
    }
    try {
      const { message } = await createCustomer(addForm)
      addDialogVisible.value = false
      if (customerList.customers.length === paginationInfo.size) {
        paginationInfo.current = Math.ceil((customerList.total + 1) / paginationInfo.size)
      }
      getCustomerList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const editDialogVisible = ref(false)

const editForm = ref({})
const editFormRef = ref()
const editFormRules = reactive({
  username: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 2, max: 8, message: '长度在 2 到 8 个字符', trigger: 'blur' }
  ],
  realName: [
    { required: true, message: '请输入真实姓名', trigger: 'blur' }
  ],
  age: [
    { type: 'number', message: '年龄必须是一个数字' }
  ],
  phone: [
    { validator: validatePhone, trigger: 'blur' }
  ]
})
const submitEditForm = async () => {
  if (!editFormRef.value) {
    return
  }
  await editFormRef.value.validate(async valid => {
    if (!valid) {
      return
    }
    try {
      const { message } = await updateCustomer(editForm.value.id, pick(editForm.value, ['username', 'realName', 'sex', 'age', 'phone']))
      editDialogVisible.value = false
      getCustomerList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const openEditDialog = async id => {
  try {
    const { data: customer } = await getCustomerById(id)
    editForm.value = customer
    editDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error)
  }
}

const removeCustomer = async id => {
  ElMessageBox.confirm(
    '此操作将永久删除该用户，是否继续？',
    '警告',
    { type: 'warning' }
  ).then(async () => {
    try {
      const { message } = await deleteCustomer(id)
      if (customerList.customers.length === 1 && paginationInfo.current > 1) {
        paginationInfo.current -= 1
      }
      getCustomerList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

getCustomerList()
</script>
