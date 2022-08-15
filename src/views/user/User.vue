<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>用户信息管理</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <el-button v-if="userStore.hasPermission('user:create')" type="success" :icon="Plus" @click="addDialogVisible = true">添加用户</el-button>
        <el-table v-loading="loading" :data="userList.users" border stripe>
          <el-table-column fixed prop="id" label="#" width="48" />
          <el-table-column prop="username" label="用户名" min-width="160" />
          <el-table-column prop="realName" label="真实姓名" min-width="176" />
          <el-table-column prop="sex" label="性别" width="80" />
          <el-table-column prop="age" label="年龄" width="64" />
          <el-table-column prop="phone" label="电话" min-width="144" />
          <el-table-column prop="roleName" label="角色" min-width="176" />
          <el-table-column fixed="right" label="操作" width="280">
            <template v-slot="{ row: user }">
              <div class="flex space-x-3">
                <el-button v-if="userStore.hasPermission('user:update')" type="primary" size="small" :icon="Edit" @click="openEditDialog(user.id)">编辑</el-button>
                <el-dropdown v-if="userStore.hasPermission('user:grant')" trigger="click" max-height="330px" @command="roleId => updateRole(user.id, roleId)">
                  <el-button type="warning" size="small" :icon="Key">
                    授予角色<el-icon class="el-icon--right"><ArrowDown /></el-icon>
                  </el-button>
                  <template #dropdown>
                    <el-dropdown-menu>
                      <el-dropdown-item v-for="role in roleList" :key="role.id" :command="role.id" :disabled="role.id === user.roleId">{{role.name}}</el-dropdown-item>
                    </el-dropdown-menu>
                  </template>
                </el-dropdown>
                <el-button v-if="userStore.hasPermission('user:delete')" type="danger" size="small" :icon="Delete" @click="removeUser(user.id)">删除</el-button>
              </div>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="paginationInfo.current"
          v-model:page-size="paginationInfo.size"
          :page-sizes="[2, 5, 8, 10]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="userList.total"
          @size-change="getUserList"
          @current-change="getUserList"
        />
      </div>
    </div>
    <el-dialog v-model="addDialogVisible" title="添加用户" @open="getRoleList" @close="resetForm(addFormRef)">
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
        <el-form-item label="角色" prop="roleId">
          <el-select v-model="addForm.roleId" clearable>
            <el-option v-for="role in roleList" :key="role.id" :label="role.name" :value="role.id" />
          </el-select>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialogVisible" title="编辑用户" @close="resetForm(editFormRef)">
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
import { ArrowDown, ArrowRight, Delete, Edit, Key, Plus } from '@element-plus/icons-vue'
import { pick } from 'lodash'
import { reactive, ref } from 'vue'
import { getUsers, getUserById, createUser, updateUser, deleteUser, grantRole, getRolesWithoutCustomer } from '../../api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const paginationInfo = reactive({
  current: 1,
  size: 2
})

const loading = ref(true)
const userList = reactive({
  users: [],
  total: 0
})
const getUserList = async () => {
  loading.value = true
  try {
    const { data: { users, total } } = await getUsers(paginationInfo)
    userList.users = users
    userList.total = total
  } catch (error) {
    userList.users = []
    userList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

const roleList = ref([])
const getRoleList = async () => {
  try {
    const { data: { roles } } = await getRolesWithoutCustomer()
    roleList.value = roles
  } catch (error) {
    roleList.value = []
    ElMessage.error(error)
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
  phone: '',
  roleId: ''
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
  ],
  roleId: [
    { required: true, message: '请选择角色', trigger: 'change' }
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
      const { message } = await createUser(addForm)
      addDialogVisible.value = false
      if (userList.users.length === paginationInfo.size) {
        paginationInfo.current = Math.ceil((userList.total + 1) / paginationInfo.size)
      }
      getUserList()
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
      const { data, message } = await updateUser(editForm.value.id, pick(editForm.value, ['username', 'realName', 'sex', 'age', 'phone']))
      if (data) {
        userStore.user.username = data.username
        userStore.user.realName = data.realName
      }
      editDialogVisible.value = false
      getUserList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const openEditDialog = async id => {
  try {
    const { data: user } = await getUserById(id)
    editForm.value = user
    editDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error)
  }
}

const updateRole = async (id, roleId) => {
  try {
    const { data, message } = await grantRole(id, roleId)
    if (data) {
      userStore.user.roleId = data.roleId
      userStore.user.permissions = data.permissions
    }
    getUserList()
    ElMessage.success(message)
  } catch (error) {
    ElMessage.error(error)
  }
}

const removeUser = async id => {
  ElMessageBox.confirm(
    '此操作将永久删除该用户，是否继续？',
    '警告',
    { type: 'warning' }
  ).then(async () => {
    try {
      const { message } = await deleteUser(id)
      if (userList.users.length === 1 && paginationInfo.current > 1) {
        paginationInfo.current -= 1
      }
      getUserList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

getUserList()
if (userStore.hasPermission('user:grant')) {
  getRoleList()
}
</script>
