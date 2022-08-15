<template>
  <div>
    <div class="space-y-4">
      <el-breadcrumb :separator-icon="ArrowRight">
        <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
        <el-breadcrumb-item to="/houses">楼盘管理</el-breadcrumb-item>
        <el-breadcrumb-item>添加楼盘</el-breadcrumb-item>
      </el-breadcrumb>
      <div class="border-1 p-5 rounded space-y-4 shadow-lg">
        <el-form ref="formRef" :model="form" :rules="formRules" label-width="100px">
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item prop="name">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Tickets /></el-icon>
                    <span>楼盘名称</span>
                  </div>
                </template>
                <el-input v-model="form.name" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="areaCode">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Map24Regular /></el-icon>
                    <span>所在区域</span>
                  </div>
                </template>
                <el-cascader ref="districtCascaderRef" v-model="form.areaCode" :props="districtCascaderProps" class="w-full" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item prop="address">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><OfficeBuilding /></el-icon>
                    <span>详细地址</span>
                  </div>
                </template>
                <el-input v-model="form.address" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item required>
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Location /></el-icon>
                    <span>地图坐标</span>
                  </div>
                </template>
                <el-row class="w-full" :gutter="0">
                  <el-col :span="10">
                    <el-form-item prop="lng">
                      <el-input v-model="form.lng" />
                    </el-form-item>
                  </el-col>
                  <el-col class="text-center" :span="2">,</el-col>
                  <el-col :span="10">
                    <el-form-item prop="lat">
                      <el-input v-model="form.lat" />
                    </el-form-item>
                  </el-col>
                  <el-col class="text-center" :span="2">
                    <el-tooltip content="打开地图以进行经纬度标注">
                      <el-button link :icon="MapLocation" @click="openMapDialog"></el-button>
                    </el-tooltip>
                  </el-col>
                </el-row>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="12">
              <el-form-item prop="averagePrice">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><MoneyCollectOutlined /></el-icon>
                    <span>均价</span>
                  </div>
                </template>
                <el-input-number v-model="form.averagePrice" :precision="2" :controls="false" class="flex-grow" />
                <span class="ml-2">元/㎡</span>
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="saleStatus">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Status24Regular /></el-icon>
                    <span>销售状态</span>
                  </div>
                </template>
                <el-radio-group v-model="form.saleStatus">
                  <el-radio :label="0">预售</el-radio>
                  <el-radio :label="1">在售</el-radio>
                  <el-radio :label="2">售罄</el-radio>
                </el-radio-group>
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="characteristic">
            <template #label>
              <div class="flex items-center space-x-1">
                <el-icon><TagsOutlined /></el-icon>
                <span>特色</span>
              </div>
            </template>
            <div class="flex items-center space-x-1">
              <el-space v-if="form.characteristic">
                <el-tag v-for="characteristic in form.characteristic.split(',')" closable @close="deleteCharacteristic(characteristic)">{{characteristic}}</el-tag>
              </el-space>
              <div v-if="form.characteristic.split(',').length < 8" class="leading-0">
                <el-input v-if="characteristicInputVisible" ref="characteristicInputRef" v-model="characteristicInputValue" size="small" maxlength="10" show-word-limit @keyup.enter="characteristicInputConfirm" @blur="characteristicInputConfirm" />
                <el-button v-else size="small" @click="showCharacteristicInput">+ 添加特色</el-button>
              </div>
            </div>
          </el-form-item>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item prop="openingTime">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><CalendarLtr24Regular /></el-icon>
                    <span>开盘时间</span>
                  </div>
                </template>
                <el-date-picker v-model="form.openingTime" type="date" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="salesPhone">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Phone /></el-icon>
                    <span>售楼处电话</span>
                  </div>
                </template>
                <el-input v-model="form.salesPhone" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="salesAddress">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><School /></el-icon>
                    <span>售楼处地址</span>
                  </div>
                </template>
                <el-input v-model="form.salesAddress" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item prop="completeTime">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><CalendarCheckmark24Regular /></el-icon>
                    <span>交房时间</span>
                  </div>
                </template>
                <el-date-picker v-model="form.completeTime" type="date" value-format="YYYY-MM-DD" />
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-form-item prop="developer">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Suitcase /></el-icon>
                    <span>开发商</span>
                  </div>
                </template>
                <el-input v-model="form.developer" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item prop="property">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Coin /></el-icon>
                    <span>产权年限</span>
                  </div>
                </template>
                <el-input-number v-model="form.property" :min="0" :controls="false" class="flex-grow" />
                <span class="ml-2">年</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="plotRatio">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><PuzzleCube24Regular /></el-icon>
                    <span>容积率</span>
                  </div>
                </template>
                <el-input-number v-model="form.plotRatio" :precision="2" :controls="false" class="flex-grow" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="greeningRate">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><LeafThree24Regular /></el-icon>
                    <span>绿化率</span>
                  </div>
                </template>
                <el-input-number v-model="form.greeningRate" :min="0" :max="100" :controls="false" class="flex-grow" />
                <span class="ml-2">%</span>
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="households">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><HomeOutlined /></el-icon>
                    <span>规划户数</span>
                  </div>
                </template>
                <el-input-number v-model="form.households" :min="0" :controls="false" class="flex-grow" />
                <span class="ml-2">户</span>
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item prop="carport">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><CarOutlined /></el-icon>
                    <span>车位数</span>
                  </div>
                </template>
                <el-input-number v-model="form.carport" :min="0" :controls="false" class="flex-grow" />
              </el-form-item>
            </el-col>
            <el-col :span="6">
              <el-form-item prop="buildingNum">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Building24Regular /></el-icon>
                    <span>楼栋数</span>
                  </div>
                </template>
                <el-input-number v-model="form.buildingNum" :min="0" :controls="false" class="flex-grow" />
              </el-form-item>
            </el-col>
            <el-col :span="12">
              <el-form-item prop="license">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Certificate24Regular /></el-icon>
                    <span>预售证号</span>
                  </div>
                </template>
                <el-input v-model="form.license" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-row :gutter="16">
            <el-col :span="6">
              <el-form-item prop="propertyFee">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><AccountBookOutlined /></el-icon>
                    <span>物业费</span>
                  </div>
                </template>
                <div class="flex items-center space-x-2">
                  <el-input-number v-model="form.propertyFee" :precision="2" :controls="false" />
                  <span class="flex-shrink-0">元/㎡/月</span>
                </div>
              </el-form-item>
            </el-col>
            <el-col :span="18">
              <el-form-item prop="manageCompany">
                <template #label>
                  <div class="flex items-center space-x-1">
                    <el-icon><Collection /></el-icon>
                    <span>物业公司</span>
                  </div>
                </template>
                <el-input v-model="form.manageCompany" />
              </el-form-item>
            </el-col>
          </el-row>
          <el-form-item prop="thumbnail">
            <template #label>
              <div class="flex items-center space-x-1">
                <el-icon><Picture /></el-icon>
                <span>缩略图</span>
              </div>
            </template>
            <el-upload class="image-uploader" :action="getUrl('images')" name="image" :with-credentials="true" :show-file-list="false" accept="image/jpeg,image/png" :limit="1" :on-success="imageUploadSuccess" :before-upload="beforeImageUpload">
              <el-image class="w-28 h-22" v-if="form.thumbnail" :src="getUrl(form.thumbnail)" fit="cover" />
              <el-icon v-else class="image-uploader-icon"><CloudUploadOutlined /></el-icon>
            </el-upload>
          </el-form-item>
          <el-form-item prop="description">
            <template #label>
              <div class="flex items-center space-x-1">
                <el-icon><Document /></el-icon>
                <span>描述</span>
              </div>
            </template>
            <el-input v-model="form.description" type="textarea" :rows="3" maxlength="300" show-word-limit />
          </el-form-item>
          <el-form-item>
            <el-button type="success" @click="submitForm">提交</el-button>
          </el-form-item>
        </el-form>
      </div>
    </div>
    <el-dialog v-model="mapDialogVisible" title="标注地图" width="60%" top="5vh" @opened="initMap">
      <div class="absolute z-9999 flex space-x-4">
        <div class="w-80">
          <el-input v-model="mapForm.address" />
        </div>
        <el-button type="primary" @click="search">搜索</el-button>
        <el-button type="success" @click="submitMapForm">确认</el-button>
      </div>
      <div id="map" class="w-full aspect-video rounded"></div>
    </el-dialog>
  </div>
</template>

<script setup>
import { ArrowRight, Coin, Collection, Document, Location, MapLocation, OfficeBuilding, Phone, Picture, School, Suitcase, Tickets } from '@element-plus/icons-vue'
import { AccountBookOutlined, CarOutlined, CloudUploadOutlined, HomeOutlined, MoneyCollectOutlined, TagsOutlined } from '@vicons/antd'
import { Building24Regular, CalendarCheckmark24Regular, CalendarLtr24Regular, Certificate24Regular, LeafThree24Regular, Map24Regular, PuzzleCube24Regular, Status24Regular } from '@vicons/fluent'
import { nextTick, reactive, ref } from 'vue'
import { createHouse, getDistricts, getSubDistrictsByCode, getUrl } from '../../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const form = reactive({
  name: '',
  areaCode: '',
  address: '',
  lng: '',
  lat: '',
  averagePrice: undefined,
  saleStatus: '',
  characteristic: '',
  openingTime: '',
  completeTime: '',
  salesPhone: '',
  salesAddress: '',
  developer: '',
  property: undefined,
  plotRatio: undefined,
  greeningRate: undefined,
  households: undefined,
  carport: undefined,
  buildingNum: undefined,
  license: '',
  propertyFee: undefined,
  manageCompany: '',
  thumbnail: '',
  description: ''
})
const formRef = ref()
const formRules = reactive({
  name: [
    { required: true, message: '请输入楼盘名称', trigger: 'blur' }
  ],
  areaCode: [
    { required: true, message: '请选择所在区域', trigger: 'change' }
  ],
  address: [
    { required: true, message: '请输入详细地址', trigger: 'blur' }
  ],
  lng: [
    { required: true, message: '请输入经度', trigger: 'blur' }
  ],
  lat: [
    { required: true, message: '请输入纬度', trigger: 'blur' }
  ],
  averagePrice: [
    { required: true, message: '请输入均价', trigger: 'blur' }
  ],
  saleStatus: [
    { required: true, message: '请选择销售状态', trigger: 'change' }
  ]
})
const submitForm = async () => {
  if (!formRef.value) {
    return
  }
  await formRef.value.validate(async valid => {
    if (!valid) {
      return
    }
    try {
      const { message } = await createHouse(form)
      router.push('/houses')
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const districtCascaderRef = ref()
const districtCascaderProps = reactive({
  emitPath: false,
  lazy: true,
  lazyLoad: async (node, resolve) => {
    const { level } = node
    if (level === 0) {
      try {
        const { data: { districts } } = await getDistricts()
        resolve(districts)
      } catch (error) {
        ElMessage.error(error)
      }
    } else {
      const { data: { code } } = node
      try {
        const { data: { districts } } = await getSubDistrictsByCode(code)
        if (level === 2) {
          districts.forEach(item => item.leaf = true)
        }
        resolve(districts)
      } catch (error) {
        ElMessage.error(error)
      }
    }
  },
  value: 'code',
  label: 'name',
  children: 'districts'
})

const characteristicInputVisible = ref(false)
const characteristicInputRef = ref()
const characteristicInputValue = ref('')
const deleteCharacteristic = characteristic => {
  form.characteristic = form.characteristic.split(',').filter(item => item !== characteristic).join(',')
}
const showCharacteristicInput = () => {
  characteristicInputVisible.value = true
  nextTick(() => {
    characteristicInputRef.value.input.focus()
  })
}
const characteristicInputConfirm = () => {
  if (characteristicInputValue.value) {
    if (form.characteristic) {
      form.characteristic += ','
    }
    form.characteristic += characteristicInputValue.value
  }
  characteristicInputVisible.value = false
  characteristicInputValue.value = ''
}

const mapDialogVisible = ref(false)

const mapForm = reactive({
  lng: 0,
  lat: 0,
  address: ''
})

const openMapDialog = () => {
  mapForm.lng = form.lng
  mapForm.lat = form.lat
  const nodes = districtCascaderRef.value.getCheckedNodes()
  if (nodes.length === 0) {
    // 如果没有选择区域，则判断是否有坐标，有坐标则使用坐标，没有坐标则提示错误信息
    if (mapForm.lng * 1 && mapForm.lat * 1) {
      mapForm.address = form.address
    } else {
      ElMessage.error('请选择所在区域')
      return
    }
  } else {
    // 有选择区域则使用区域信息
    const { pathLabels } = nodes[0]
    // 用于百度地图 API 地址解析的地址应为`省 + 市 + 区 + 楼盘地址`
    mapForm.address = pathLabels[0] + pathLabels[1] + pathLabels[2] + form.address
  }
  mapDialogVisible.value = true
}

const map = ref()
const initMap = () => {
  map.value = new BMapGL.Map('map')
  // 如果有坐标则根据坐标提供地图，否则根据区域和地址提供地图
  if (mapForm.lng * 1 && mapForm.lat * 1) {
    const point = new BMapGL.Point(mapForm.lng, mapForm.lat)
    const geo = new BMapGL.Geocoder()
    geo.getLocation(point, result => {
      const { address } = result
      mapForm.address = address
    })
    map.value.centerAndZoom(point, 15)
    const marker = new BMapGL.Marker(point)
    marker.enableDragging()
    marker.addEventListener('dragend', getMarkerPoint)
    map.value.addOverlay(marker)
  } else {
    const geo = new BMapGL.Geocoder()
    geo.getPoint(mapForm.address, point => {
      if (point) {
        mapForm.lng = point.lng
        mapForm.lat = point.lat
        map.value.centerAndZoom(point, 15)
        const marker = new BMapGL.Marker(point)
        marker.enableDragging()
        marker.addEventListener('dragend', getMarkerPoint)
        map.value.addOverlay(marker)
      }
    })
  }
  map.value.enableScrollWheelZoom(true)
}
const search = () => {
  const geo = new BMapGL.Geocoder()
  geo.getPoint(mapForm.address, point => {
    if (point) {
      mapForm.lng = point.lng
      mapForm.lat = point.lat
      map.value.centerAndZoom(point, 15)
      const marker = new BMapGL.Marker(point)
      marker.enableDragging()
      marker.addEventListener('dragend', getMarkerPoint)
      map.value.addOverlay(marker)
    }
  })
}
const getMarkerPoint = e => {
  const { target } = e
  mapForm.lng = target.getPosition().lng
  mapForm.lat = target.getPosition().lat
}
const submitMapForm = () => {
  form.lng = mapForm.lng.toFixed(6)
  form.lat = mapForm.lat.toFixed(6)
  mapDialogVisible.value = false
}

const imageUploadSuccess = response => {
  if (response.code !== 201) {
    ElMessage.error(response.message)
    return
  }
  form.thumbnail = response.data.path
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
  @apply w-28 h-22 text-2xl text-center;
  color: var(--el-color-info);
}
</style>
