<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item>用户管理</el-breadcrumb-item>
        <el-breadcrumb-item>角色管理</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <el-button v-if="userStore.hasPermission('role:create')" type="success" :icon="Plus" @click="addDialogVisible = true">添加角色</el-button>
        <el-table v-loading="loading" :data="roleList.roles" border stripe @expand-change="showPermissions">
          <el-table-column fixed type="expand">
            <template v-slot="{ row: role }">
              <!-- 未获取到角色权限或正在加载时，显示骨架图 -->
              <el-skeleton :loading="!rolePermissions[role.id] || rolePermissions[role.id].loading" animated>
                <template #template>
                  <el-space class="p-4" wrap>
                    <el-skeleton-item v-for="width in skeletonItemWidths" variant="text" :style="{ width: `${width}px`, height: '22px' }" />
                  </el-space>
                </template>
                <template #default>
                  <!-- 获取到角色权限后，如果有权限，则进行渲染 -->
                  <el-space v-if="rolePermissions[role.id] && rolePermissions[role.id].permissions && rolePermissions[role.id].permissions.length !== 0" class="p-4" wrap>
                    <el-tag v-for="rp in rolePermissions[role.id].permissions" :key="rp.id">
                      <div class="inline-flex items-center space-x-0.5">
                        <span>{{rp.permissionName}}</span>
                        <el-icon style="cursor: default"><DArrowRight /></el-icon>
                        <span>{{rp.permissionCode}}</span>
                      </div>
                    </el-tag>
                  </el-space>
                  <!-- 否则渲染空状态 -->
                  <el-empty v-else :image-size="96" description="无权限" style="--el-empty-padding: 0; --el-empty-description-margin-top: 8px;" />
                </template>
              </el-skeleton>
            </template>
          </el-table-column>
          <el-table-column fixed prop="id" label="#" width="48" />
          <el-table-column prop="name" label="角色名" min-width="144" />
          <el-table-column prop="description" label="角色描述" min-width="320" show-overflow-tooltip />
          <el-table-column fixed="right" label="操作" width="280">
            <template v-slot="{ row: role }">
              <el-button v-if="role.id !== CUSTOMER_ROLE_ID && userStore.hasPermission('role:update')" type="primary" size="small" :icon="Edit" @click="openEditDialog(role.id)">编辑</el-button>
              <el-button v-if="userStore.hasPermission('role:grant')" type="warning" size="small" :icon="Unlock" @click="openGrantDialog(role.id)">分配权限</el-button>
              <el-button v-if="role.id !== CUSTOMER_ROLE_ID && userStore.hasPermission('role:delete')" type="danger" size="small" :icon="Delete" @click="removeRole(role.id)">删除</el-button>
            </template>
          </el-table-column>
        </el-table>
        <el-pagination
          v-model:current-page="paginationInfo.current"
          v-model:page-size="paginationInfo.size"
          :page-sizes="[2, 5, 8, 10]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="roleList.total"
          @size-change="getRoleList"
          @current-change="getRoleList"
        />
      </div>
    </div>
    <el-dialog v-model="addDialogVisible" title="添加角色" @close="resetForm(addFormRef)">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="addForm.name" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="3" maxlength="50" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialogVisible" title="编辑角色" @close="resetForm(editFormRef)">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="角色名" prop="name">
          <el-input v-model="editForm.name" />
        </el-form-item>
        <el-form-item label="角色描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="50" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="editDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="grantDialogVisible" title="分配权限" @close="grantForm = {}">
      <el-checkbox-group v-model="grantForm.permissions">
        <el-checkbox v-for="permission in permissionList" :key="permission.id" :label="permission.id">
          <div class="inline-flex items-center space-x-0.5">
            <span>{{permission.name}}</span>
            <el-icon><DArrowRight /></el-icon>
            <span>{{permission.code}}</span>
          </div>
        </el-checkbox>
      </el-checkbox-group>
      <template #footer>
        <el-button @click="grantDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitGrantForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive } from 'vue'
import { ArrowRight, Delete, Edit, DArrowRight, Plus, Unlock } from '@element-plus/icons-vue'
import { omit, random, times } from 'lodash'
import { getRoles, getRoleById, createRole, updateRole, deleteRole, getPermissionsByRoleId, grantPermissions, getPermissions } from '../../api'
import { useUserStore } from '../../store'

const CUSTOMER_ROLE_ID = '1'

const userStore = useUserStore()

const paginationInfo = reactive({
  current: 1,
  size: 5
})

const loading = ref(true)
const roleList = reactive({
  roles: [],
  total: 0
})
const getRoleList = async () => {
  loading.value = true
  try {
    const { data: { roles, total } } = await getRoles(paginationInfo)
    roleList.roles = roles
    roleList.total = total
  } catch (error) {
    roleList.roles = []
    roleList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

const permissionList = ref([])
const getPermissionList = async () => {
  try {
    const { data: { permissions } } = await getPermissions()
    permissionList.value = permissions
  } catch (error) {
    permissionList.value = []
    ElMessage.error(error)
  }
}

// 单独声明角色权限信息，避免直接修改角色列表造成表格的重新渲染
const skeletonItemWidths = ref(times(random(6, 10), () => random(110, 180, true)))
const rolePermissions = ref({})
const showPermissions = row => {
  if (rolePermissions.value[row.id]) {
    return
  }
  rolePermissions.value[row.id] = { loading: true }
  const getPermissionsByRoleIdPromise = getPermissionsByRoleId(row.id)
  .then(({ data: { rolePermissions: rp } }) => {
    rolePermissions.value[row.id].permissions = rp
  }).catch(error => {
    rolePermissions.value[row.id].loading = false
    ElMessage.error(error)
  })
  // 至少200ms后才会将loading设置为false，防止渲染抖动
  const timerPromise = new Promise((resolve) => {
    setTimeout(() => { resolve() }, 200)
  })
  Promise.all([getPermissionsByRoleIdPromise, timerPromise]).then(() => {
    rolePermissions.value[row.id].loading = false
  })
}

const resetForm = formEl => {
  if (!formEl) {
    return
  }
  formEl.resetFields()
}

const addDialogVisible = ref(false)

const addForm = reactive({
  name: '',
  description: ''
})
const addFormRef = ref()
const addFormRules = reactive({
  name: [
    { required: true, message: '请输入角色名', trigger: 'blur' }
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
      const { message } = await createRole(addForm)
      addDialogVisible.value = false
      if (roleList.roles.length === paginationInfo.size) {
        paginationInfo.current = Math.ceil((roleList.total + 1) / paginationInfo.size)
      }
      getRoleList()
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
  name: [
    { required: true, message: '请输入角色名', trigger: 'blur' }
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
      const { message } = await updateRole(editForm.value.id, omit(editForm.value, ['id']))
      editDialogVisible.value = false
      getRoleList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const openEditDialog = async id => {
  try {
    const { data: role } = await getRoleById(id)
    editForm.value = role
    editDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error)
  }
}

const grantDialogVisible = ref(false)

const grantForm = ref({})
const submitGrantForm = async () => {
  try {
    const { data, message } = await grantPermissions(grantForm.value.id, grantForm.value.permissions)
    rolePermissions.value[data.roleId] = { loading: false, permissions: data.rolePermissions }
    // 如果当前用户为自己的角色分配权限，则更新当前用户的权限
    if (data.permissions) {
      userStore.user.permissions = data.permissions
    }
    grantDialogVisible.value = false
    ElMessage.success(message)
  } catch (error) {
    ElMessage.error(error)
  }
}

const openGrantDialog = async id => {
  try {
    const { data: { rolePermissions } } = await getPermissionsByRoleId(id)
    grantForm.value = { id: id, permissions: rolePermissions.map(rolePermission => rolePermission.permissionId) }
    grantDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error)
  }
}

const removeRole = async id => {
  ElMessageBox.confirm(
    '此操作将永久删除该角色，是否继续？',
    '警告',
    { type: 'warning' }
  ).then(async () => {
    try {
      const { message } = await deleteRole(id)
      if (roleList.roles.length === 1 && paginationInfo.current > 1) {
        paginationInfo.current -= 1
      }
      getRoleList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

getRoleList()
if (userStore.hasPermission('role:grant')) {
  getPermissionList()
}
</script>
