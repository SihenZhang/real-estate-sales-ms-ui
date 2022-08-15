<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/houses">楼盘管理</el-breadcrumb-item>
        <el-breadcrumb-item>户型管理</el-breadcrumb-item>
        <el-breadcrumb-item v-if="houseUnitList.houseName">{{houseUnitList.houseName}}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <el-button v-if="userStore.hasPermission('house_unit:create')" type="success" :icon="Plus" @click="addDialogVisible = true">添加户型</el-button>
        <el-empty v-if="!loading && houseUnitList.houseUnits.length === 0" description="暂无数据" />
        <div v-else v-loading="loading" class="grid grid-cols-4 gap-4 min-h-10">
          <div v-for="houseUnit in houseUnitList.houseUnits" class="border-1 p-4 rounded space-y-2 shadow-md">
            <div class="text-center">
              <el-image class="h-40" :src="getUrl(houseUnit.pic)" :alt="houseUnit.title" :preview-src-list="[getUrl(houseUnit.pic)]" :hide-on-click-modal="true" fit="cover">
                <template #error>
                  <div class="flex justify-center items-center w-full h-full text-2xl bg-gray-100">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <div class="flex items-center space-x-2">
              <span class="text-2xl font-bold">{{houseUnit.title}}</span>
              <el-tag v-if="houseUnit.saleStatus === 0" type="info" effect="dark">预售</el-tag>
              <el-tag v-if="houseUnit.saleStatus === 1" type="success" effect="dark">在售</el-tag>
              <el-tag v-if="houseUnit.saleStatus === 2" type="error" effect="dark">售罄</el-tag>
              <el-tag v-if="houseUnit.isMain === 1" color="#f59e0b" style="--el-tag-border-color: #f59e0b;" effect="dark">主推</el-tag>
            </div>
            <div class="flex justify-between items-center">
              <div>
                <span class="text-lg">{{houseUnit.room}}</span>
                <span>室</span>
                <span class="text-lg">{{houseUnit.livingRoom}}</span>
                <span>厅</span>
                <span class="text-lg">{{houseUnit.restroom}}</span>
                <span>卫</span>
                <span class="text-lg">{{houseUnit.kitchen}}</span>
                <span>厨</span>
              </div>
              <div v-if="houseUnit.price">
                <span class="text-orange-500 text-xl font-bold">{{houseUnit.price}}</span>
                <span> 元</span>
              </div>
            </div>
            <el-space v-if="houseUnit.characteristic" wrap>
              <el-tag v-for="characteristic in houseUnit.characteristic.split(',')" size="small">{{characteristic}}</el-tag>
            </el-space>
            <div class="grid grid-cols-2 gap-2">
              <div class="space-x-3">
                <span>面积</span>
                <span>{{houseUnit.area}}㎡</span>
              </div>
              <div class="space-x-3">
                <span>朝向</span>
                <span>{{houseUnit.aspect}}</span>
              </div>
              <div class="space-x-3">
                <span>层高</span>
                <span>{{houseUnit.height}}m</span>
              </div>
            </div>
            <el-collapse v-if="houseUnit.description" v-model="descCollaspe" style="--el-collapse-header-height: 32px; border: none;">
              <el-collapse-item title="描述" :name="houseUnit.id">
                <p class="text-sm">{{houseUnit.description}}</p>
              </el-collapse-item>
            </el-collapse>
            <el-button v-if="userStore.hasPermission('house_unit:update')" type="primary" :icon="Edit" @click="openEditDialog(houseUnit.id)">编辑</el-button>
            <el-button v-if="userStore.hasPermission('house_unit:delete')" type="danger" :icon="Delete" @click="removeHouseUnit(houseUnit.id)">删除</el-button>
          </div>
        </div>
        <el-pagination
          v-model:current-page="paginationInfo.current"
          v-model:page-size="paginationInfo.size"
          :page-sizes="[2, 4, 6, 8, 12]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="houseUnitList.total"
          @size-change="getHouseUnitList(route.params.id)"
          @current-change="getHouseUnitList(route.params.id)"
        />
      </div>
    </div>
    <el-dialog v-model="addDialogVisible" :title="`添加户型${houseUnitList.houseName ? ' - ' + houseUnitList.houseName : ''}`" top="5vh" destroy-on-close @close="resetForm(addFormRef)">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="户型标题" prop="title">
          <el-input v-model="addForm.title" />
        </el-form-item>
        <el-form-item label="户型图" prop="pic">
          <el-upload class="image-uploader" :action="getUrl('images')" name="image" :with-credentials="true" :show-file-list="false" accept="image/jpeg,image/png" :limit="1" :on-success="response => imageUploadSuccess(response, addForm)" :before-upload="beforeImageUpload">
            <el-image class="w-32 h-24" v-if="addForm.pic" :src="getUrl(addForm.pic)" fit="cover" />
            <el-icon v-else class="image-uploader-icon"><CloudUploadOutlined /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="销售状态" prop="saleStatus">
          <el-radio-group v-model="addForm.saleStatus">
            <el-radio :label="0">预售</el-radio>
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="2">售罄</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <div class="flex items-center space-x-2">
                <el-input-number v-model="addForm.price" :precision="2" :controls="false" />
                <span class="flex-shrink-0">元</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主推户型" prop="isMain">
              <el-radio-group v-model="addForm.isMain">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="户型布局">
          <el-row class="w-full" :gutter="8">
            <el-col :span="6">
              <el-form-item prop="room">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="addForm.room" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">室</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="livingRoom">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="addForm.livingRoom" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">厅</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="restroom">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="addForm.restroom" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">卫</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="kitchen">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="addForm.kitchen" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">厨</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="特色" prop="characteristic">
          <div class="flex items-center space-x-1">
            <el-space v-if="addForm.characteristic">
              <el-tag v-for="characteristic in addForm.characteristic.split(',')" closable @close="deleteCharacteristic(addForm, characteristic)">{{characteristic}}</el-tag>
            </el-space>
            <div v-if="addForm.characteristic.split(',').length < 8" class="leading-0">
              <el-input v-if="characteristicInputVisible" ref="characteristicInputRef" v-model="characteristicInputValue" size="small" maxlength="10" show-word-limit @keyup.enter="characteristicInputConfirm(addForm)" @blur="characteristicInputConfirm(addForm)" />
              <el-button v-else size="small" @click="showCharacteristicInput">+ 添加特色</el-button>
            </div>
          </div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="面积" prop="area">
              <div class="flex items-center space-x-2">
                <el-input-number v-model="addForm.area" :min="0" :precision="2" :controls="false" />
                <span class="flex-shrink-0">㎡</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="层高" prop="height">
              <div class="flex items-center space-x-2">
                <el-input-number v-model="addForm.height" :min="0" :precision="2" :controls="false" />
                <span class="flex-shrink-0">m</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="朝向" prop="aspect">
          <el-select v-model="addForm.aspect">
            <el-option value="北" />
            <el-option value="南" />
            <el-option value="西" />
            <el-option value="东" />
            <el-option value="南北" />
            <el-option value="东西" />
            <el-option value="西北" />
            <el-option value="西南" />
            <el-option value="东北" />
            <el-option value="东南" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="addForm.description" type="textarea" :rows="3" maxlength="300" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
    <el-dialog v-model="editDialogVisible" :title="`编辑户型${houseUnitList.houseName ? ' - ' + houseUnitList.houseName : ''}`" top="5vh" destroy-on-close @close="resetForm(editFormRef)">
      <el-form ref="editFormRef" :model="editForm" :rules="editFormRules" label-width="80px">
        <el-form-item label="户型标题" prop="title">
          <el-input v-model="editForm.title" />
        </el-form-item>
        <el-form-item label="户型图" prop="pic">
          <el-upload class="image-uploader" :action="getUrl('images')" name="image" :with-credentials="true" :show-file-list="false" accept="image/jpeg,image/png" :limit="1" :on-success="response => imageUploadSuccess(response, editForm)" :before-upload="beforeImageUpload">
            <el-image class="w-32 h-24" v-if="editForm.pic" :src="getUrl(editForm.pic)" fit="cover" />
            <el-icon v-else class="image-uploader-icon"><CloudUploadOutlined /></el-icon>
          </el-upload>
        </el-form-item>
        <el-form-item label="销售状态" prop="saleStatus">
          <el-radio-group v-model="editForm.saleStatus">
            <el-radio :label="0">预售</el-radio>
            <el-radio :label="1">在售</el-radio>
            <el-radio :label="2">售罄</el-radio>
          </el-radio-group>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="价格" prop="price">
              <div class="flex items-center space-x-2">
                <el-input-number v-model="editForm.price" :precision="2" :controls="false" />
                <span class="flex-shrink-0">元</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="主推户型" prop="isMain">
              <el-radio-group v-model="editForm.isMain">
                <el-radio :label="1">是</el-radio>
                <el-radio :label="0">否</el-radio>
              </el-radio-group>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="户型布局">
          <el-row class="w-full" :gutter="8">
            <el-col :span="6">
              <el-form-item prop="room">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="editForm.room" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">室</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="livingRoom">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="editForm.livingRoom" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">厅</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="restroom">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="editForm.restroom" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">卫</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="kitchen">
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="editForm.kitchen" :min="0" :controls="false" style="width: auto;" />
                  <span class="flex-shrink-0">厨</span>
                </div>
              </el-form-item>
            </el-col>
          </el-row>
        </el-form-item>
        <el-form-item label="特色" prop="characteristic">
          <div class="flex items-center space-x-1">
            <el-space v-if="editForm.characteristic">
              <el-tag v-for="characteristic in editForm.characteristic.split(',')" closable @close="deleteCharacteristic(editForm, characteristic)">{{characteristic}}</el-tag>
            </el-space>
            <div v-if="editForm.characteristic.split(',').length < 8" class="leading-0">
              <el-input v-if="characteristicInputVisible" ref="characteristicInputRef" v-model="characteristicInputValue" size="small" maxlength="10" show-word-limit @keyup.enter="characteristicInputConfirm(editForm)" @blur="characteristicInputConfirm(editForm)" />
              <el-button v-else size="small" @click="showCharacteristicInput">+ 添加特色</el-button>
            </div>
          </div>
        </el-form-item>
        <el-row :gutter="16">
          <el-col :span="12">
            <el-form-item label="面积" prop="area">
              <div class="flex items-center space-x-2">
                <el-input-number v-model="editForm.area" :min="0" :precision="2" :controls="false" />
                <span class="flex-shrink-0">㎡</span>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="12">
            <el-form-item label="层高" prop="height">
              <div class="flex items-center space-x-2">
                <el-input-number v-model="editForm.height" :min="0" :precision="2" :controls="false" />
                <span class="flex-shrink-0">m</span>
              </div>
            </el-form-item>
          </el-col>
        </el-row>
        <el-form-item label="朝向" prop="aspect">
          <el-select v-model="editForm.aspect">
            <el-option value="北" />
            <el-option value="南" />
            <el-option value="西" />
            <el-option value="东" />
            <el-option value="南北" />
            <el-option value="东西" />
            <el-option value="西北" />
            <el-option value="西南" />
            <el-option value="东北" />
            <el-option value="东南" />
          </el-select>
        </el-form-item>
        <el-form-item label="描述" prop="description">
          <el-input v-model="editForm.description" type="textarea" :rows="3" maxlength="300" show-word-limit />
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitEditForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ArrowRight, Delete, Edit, Picture, Plus } from '@element-plus/icons-vue'
import { CloudUploadOutlined } from '@vicons/antd'
import { omit } from 'lodash'
import { nextTick, reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createHouseUnit, deleteHouseUnit, getHouseUnitById, getHouseUnitsByHouseId, getUrl, updateHouseUnit } from '../../api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const route = useRoute()

const paginationInfo = reactive({
  current: 1,
  size: 4
})

const loading = ref(true)
const houseUnitList = reactive({
  houseName: '',
  houseUnits: [],
  total: 0
})
const getHouseUnitList = async id => {
  loading.value = true
  try {
    const { data: { houseName, houseUnits, total } } = await getHouseUnitsByHouseId(id, paginationInfo)
    houseUnitList.houseName = houseName
    houseUnitList.houseUnits = houseUnits
    houseUnitList.total = total
  } catch (error) {
    houseUnitList.houseName = ''
    houseUnitList.houseUnits = []
    houseUnitList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

const descCollaspe = ref([])

const resetForm = formEl => {
  if (!formEl) {
    return
  }
  formEl.resetFields()
}

const addDialogVisible = ref(false)

const addForm = reactive({
  title: '',
  pic: '',
  saleStatus: '',
  price: undefined,
  characteristic: '',
  area: undefined,
  height: undefined,
  aspect: '',
  room: undefined,
  livingRoom: undefined,
  kitchen: undefined,
  restroom: undefined,
  isMain: '',
  description: ''
})
const addFormRef = ref()
const addFormRules = reactive({
  title: [
    { required: true, message: '请输入户型标题', trigger: 'blur' }
  ],
  saleStatus: [
    { required: true, message: '请选择户型状态', trigger: 'change' }
  ],
  isMain: [
    { required: true, message: '请选择是否为主推户型', trigger: 'change' }
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
      const { message } = await createHouseUnit(route.params.id, addForm)
      addDialogVisible.value = false
      paginationInfo.current = Math.ceil((houseUnitList.total + 1) / paginationInfo.size)
      getHouseUnitList(route.params.id)
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
  title: [
    { required: true, message: '请输入户型标题', trigger: 'blur' }
  ],
  saleStatus: [
    { required: true, message: '请选择户型状态', trigger: 'change' }
  ],
  isMain: [
    { required: true, message: '请选择是否为主推户型', trigger: 'change' }
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
      const { message } = await updateHouseUnit(route.params.id, editForm.value.id, omit(editForm.value, ['id', 'houseId']))
      editDialogVisible.value = false
      getHouseUnitList(route.params.id)
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const openEditDialog = async id => {
  try {
    const { data: houseUnits } = await getHouseUnitById(route.params.id, id)
    editForm.value = houseUnits
    editDialogVisible.value = true
  } catch (error) {
    ElMessage.error(error)
  }
}

const characteristicInputVisible = ref(false)
const characteristicInputRef = ref()
const characteristicInputValue = ref('')
const deleteCharacteristic = (form, characteristic) => {
  form.characteristic = form.characteristic.split(',').filter(item => item !== characteristic).join(',')
}
const showCharacteristicInput = () => {
  characteristicInputVisible.value = true
  nextTick(() => {
    characteristicInputRef.value.input.focus()
  })
}
const characteristicInputConfirm = form => {
  if (characteristicInputValue.value) {
    if (form.characteristic) {
      form.characteristic += ','
    }
    form.characteristic += characteristicInputValue.value
  }
  characteristicInputVisible.value = false
  characteristicInputValue.value = ''
}

const imageUploadSuccess = (response, form) => {
  if (response.code !== 201) {
    ElMessage.error(response.message)
    return
  }
  form.pic = response.data.path
}
const beforeImageUpload = rawFile => {
  if (rawFile.type !== 'image/jpeg' && rawFile.type !== 'image/png') {
    ElMessage.error('图片类型必须为 jpg 或 png！')
    return false
  } else if (rawFile.size / 1024 / 1024 > 10) {
    ElMessage.error('图片大小不能超过 10MB！')
    return false
  }
  return true
}

const removeHouseUnit = async id => {
  ElMessageBox.confirm(
    '此操作将永久删除该户型，是否继续？',
    '警告',
    { type: 'warning' }
  ).then(async () => {
    try {
      const { message } = await deleteHouseUnit(route.params.id, id)
      if (houseUnitList.houseUnits.length === 1 && paginationInfo.current > 1) {
        paginationInfo.current -= 1
      }
      getHouseUnitList(route.params.id)
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

watch(() => route.params, toParams => {
  if (toParams.id) {
    getHouseUnitList(toParams.id)
  }
})

getHouseUnitList(route.params.id)
</script>

<style scoped>
.image-uploader:deep() .el-upload {
  @apply rounded-md overflow-hidden;
  border: 1px solid var(--el-border-color);
  transition: var(--el-transition-duration-fast);
}

.image-uploader:deep() .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.image-uploader-icon {
  @apply w-32 h-24 text-2xl text-center;
  color: var(--el-color-info);
}
</style>
