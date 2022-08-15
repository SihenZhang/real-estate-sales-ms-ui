<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/houses">楼盘管理</el-breadcrumb-item>
        <el-breadcrumb-item>楼盘图片管理</el-breadcrumb-item>
        <el-breadcrumb-item v-if="housePhotoList.houseName">{{housePhotoList.houseName}}</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <el-button v-if="userStore.hasPermission('house_photo:create')" type="success" :icon="Plus" @click="addDialogVisible = true">添加图片</el-button>
        <el-empty v-if="!loading && housePhotoList.housePhotos.length === 0" description="暂无数据" />
        <div v-else v-loading="loading" class="grid grid-cols-4 gap-4 min-h-10">
          <div v-for="housePhoto in housePhotoList.housePhotos" class="border-1 p-4 rounded space-y-2 shadow-md">
            <div class="text-center">
              <el-image class="h-40" :src="getUrl(housePhoto.pic)" :alt="housePhoto.title" :preview-src-list="[getUrl(housePhoto.pic)]" :hide-on-click-modal="true" fit="cover">
                <template #error>
                  <div class="flex justify-center items-center w-full h-full text-2xl bg-gray-100">
                    <el-icon><Picture /></el-icon>
                  </div>
                </template>
              </el-image>
            </div>
            <el-space wrap>
              <span class="border-1 border-blue-400 rounded p-1 text-xs text-blue-400">{{housePhoto.type}}</span>
              <span class="text-2xl font-bold">{{housePhoto.title}}</span>
            </el-space>
            <div>
              <el-button v-if="userStore.hasPermission('house_photo:update')" type="primary" size="small" :icon="Edit">编辑</el-button>
              <el-button v-if="userStore.hasPermission('house_photo:delete')" type="danger" size="small" :icon="Delete">删除</el-button>
            </div>
          </div>
        </div>
        <el-pagination
          v-model:current-page="paginationInfo.current"
          v-model:page-size="paginationInfo.size"
          :page-sizes="[2, 4, 6, 8, 12]"
          layout="total, sizes, prev, pager, next, jumper"
          :total="housePhotoList.total"
          @size-change="getHousePhotoList(route.params.id)"
          @current-change="getHousePhotoList(route.params.id)"
        />
      </div>
    </div>
    <el-dialog v-model="addDialogVisible" :title="`添加图片${housePhotoList.houseName ? ' - ' + housePhotoList.houseName : ''}`" destroy-on-close @close="resetForm(addFormRef)">
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <el-form-item label="图片标题" prop="title">
          <el-input v-model="addForm.title" />
        </el-form-item>
        <el-form-item label="图片类型" prop="type">
          <el-input v-model="addForm.type" />
        </el-form-item>
        <el-form-item label="图片" prop="pic">
          <el-upload class="image-uploader" :action="getUrl('images')" name="image" :with-credentials="true" :show-file-list="false" accept="image/jpeg,image/png" :limit="1" :on-success="response => imageUploadSuccess(response, addForm)" :before-upload="beforeImageUpload">
            <el-image class="w-32 h-24" v-if="addForm.pic" :src="getUrl(addForm.pic)" fit="cover" />
            <el-icon v-else class="image-uploader-icon"><CloudUploadOutlined /></el-icon>
          </el-upload>
        </el-form-item>
      </el-form>
      <template #footer>
        <el-button @click="addDialogVisible = false">取消</el-button>
        <el-button type="primary" @click="submitAddForm">确定</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ArrowRight, Delete, Edit, Picture, Plus } from '@element-plus/icons-vue'
import { CloudUploadOutlined } from '@vicons/antd'
import { reactive, ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import { createHousePhoto, getHousePhotosByHouseId, getUrl } from '../../api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const route = useRoute()

const paginationInfo = reactive({
  current: 1,
  size: 4
})

const loading = ref(true)
const housePhotoList = reactive({
  houseName: '',
  housePhotos: [],
  total: 0
})
const getHousePhotoList = async id => {
  loading.value = true
  try {
    const { data: { houseName, housePhotos, total } } = await getHousePhotosByHouseId(id, paginationInfo)
    housePhotoList.houseName = houseName
    housePhotoList.housePhotos = housePhotos
    housePhotoList.total = total
  } catch (error) {
    houseUnitList.houseName = ''
    houseUnitList.housePhotos = []
    houseUnitList.total = 0
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

const addDialogVisible = ref(false)

const addForm = reactive({
  title: '',
  pic: '',
  type: ''
})
const addFormRef = ref()
const addFormRules = reactive({
  title: [
    { required: true, message: '请输入户型标题', trigger: 'blur' }
  ],
  type: [
    { required: true, message: '请输入户型类型', trigger: 'blur' }
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
      const { message } = await createHousePhoto(route.params.id, addForm)
      addDialogVisible.value = false
      paginationInfo.current = Math.ceil((housePhotoList.total + 1) / paginationInfo.size)
      getHousePhotoList(route.params.id)
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
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

watch(() => route.params, toParams => {
  if (toParams.id) {
    getHousePhotoList(toParams.id)
  }
})

getHousePhotoList(route.params.id)
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
