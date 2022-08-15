<template>
  <div class="space-y-4">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item to="/sales">销售信息管理</el-breadcrumb-item>
      <el-breadcrumb-item>添加销售信息</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="border-1 p-5 rounded space-y-4 shadow-lg">
      <el-alert title="添加销售信息" type="info" center show-icon :closable="false" />
      <el-steps :active="activeIndex" finish-status="success" align-center>
        <el-step title="购房客户"></el-step>
        <el-step title="所购楼盘"></el-step>
        <el-step title="所购户型"></el-step>
        <el-step title="其它信息"></el-step>
        <el-step title="完成"></el-step>
      </el-steps>
      <el-form ref="addFormRef" :model="addForm" :rules="addFormRules" label-width="80px">
        <div v-if="activeIndex === 0" class="space-y-4">
          <el-table ref="customerTableRef" v-loading="customerLoading" :data="customerList.customers" border stripe highlight-current-row @current-change="selectCustomer">
            <el-table-column fixed width="36">
              <template v-slot="{ row: customer }">
                <el-radio v-model="addForm.customerId" :label="customer.id" />
              </template>
            </el-table-column>
            <el-table-column fixed prop="id" label="#" width="48" />
            <el-table-column prop="username" label="用户名" min-width="160" />
            <el-table-column prop="realName" label="真实姓名" min-width="176" />
            <el-table-column prop="sex" label="性别" width="80" />
            <el-table-column prop="age" label="年龄" width="64" />
            <el-table-column prop="phone" label="电话" min-width="144" />
          </el-table>
          <el-pagination
            v-model:current-page="customerPaginationInfo.current"
            v-model:page-size="customerPaginationInfo.size"
            :page-sizes="[2, 5, 8, 10]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="customerList.total"
            @size-change="getCustomerList"
            @current-change="getCustomerList"
          />
        </div>
        <div v-else-if="activeIndex === 1" class="space-y-4">
          <el-table ref="houseTableRef" v-loading="houseLoading" :data="houseList.houses" border stripe highlight-current-row @current-change="selectHouse">
            <el-table-column fixed width="36">
              <template v-slot="{ row: house }">
                <el-radio v-model="addForm.houseId" :label="house.id" />
              </template>
            </el-table-column>
            <el-table-column fixed type="expand">
              <template v-slot="{ row: house }">
                <el-descriptions class="p-4" border :column="4">
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><CalendarLtr24Regular /></el-icon>
                        <span>开盘时间</span>
                      </div>
                    </template>
                    {{house.openingTime}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Phone /></el-icon>
                        <span>售楼处电话</span>
                      </div>
                    </template>
                    {{house.salesPhone}}
                  </el-descriptions-item>
                  <el-descriptions-item :span="2">
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><School /></el-icon>
                        <span>售楼处地址</span>
                      </div>
                    </template>
                    {{house.salesAddress}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><CalendarCheckmark24Regular /></el-icon>
                        <span>交房时间</span>
                      </div>
                    </template>
                    {{house.completeTime}}
                  </el-descriptions-item>
                  <el-descriptions-item :span="3">
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Suitcase /></el-icon>
                        <span>开发商</span>
                      </div>
                    </template>
                    {{house.developer}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Coin /></el-icon>
                        <span>产权年限</span>
                      </div>
                    </template>
                    {{house.property}}年
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><PuzzleCube24Regular /></el-icon>
                        <span>容积率</span>
                      </div>
                    </template>
                    {{house.plotRatio}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><LeafThree24Regular /></el-icon>
                        <span>绿化率</span>
                      </div>
                    </template>
                    {{house.greeningRate}}%
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><HomeOutlined /></el-icon>
                        <span>规划户数</span>
                      </div>
                    </template>
                    {{house.households}}户
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><CarOutlined /></el-icon>
                        <span>车位数</span>
                      </div>
                    </template>
                    {{house.carport}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Building24Regular /></el-icon>
                        <span>楼栋数</span>
                      </div>
                    </template>
                    {{house.buildingNum}}
                  </el-descriptions-item>
                  <el-descriptions-item :span="2">
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Certificate24Regular /></el-icon>
                        <span>预售证号</span>
                      </div>
                    </template>
                    {{house.license}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><AccountBookOutlined /></el-icon>
                        <span>物业费</span>
                      </div>
                    </template>
                    {{house.propertyFee}}元/m²/月
                  </el-descriptions-item>
                  <el-descriptions-item :span="3">
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Collection /></el-icon>
                        <span>物业公司</span>
                      </div>
                    </template>
                    {{house.manageCompany}}
                  </el-descriptions-item>
                  <el-descriptions-item>
                    <template #label>
                      <div class="flex items-center space-x-1">
                        <el-icon><Document /></el-icon>
                        <span>描述</span>
                      </div>
                    </template>
                    {{house.description}}
                  </el-descriptions-item>
                </el-descriptions>
              </template>
            </el-table-column>
            <el-table-column fixed prop="id" label="#" width="48" />
            <el-table-column label="楼盘名称" min-width="400">
              <template v-slot="{ row: house }">
                <div class="flex items-center space-x-4">
                  <el-image class="w-28 h-22 flex-shrink-0" :src="getUrl(house.thumbnail)" :alt="house.name" fit="cover">
                    <template #error>
                      <div class="flex justify-center items-center w-full h-full text-2xl bg-gray-100">
                        <el-icon><Picture /></el-icon>
                      </div>
                    </template>
                  </el-image>
                  <div class="space-y-2">
                    <div class="flex items-center space-x-2">
                      <span class="text-xl font-bold">{{house.name}}</span>
                      <el-tag v-if="house.saleStatus === 0" size="small" type="info" effect="dark">预售</el-tag>
                      <el-tag v-if="house.saleStatus === 1" size="small" type="success" effect="dark">在售</el-tag>
                      <el-tag v-if="house.saleStatus === 2" size="small" type="error" effect="dark">售罄</el-tag>
                    </div>
                    <el-space v-if="house.characteristic" wrap>
                      <el-tag v-for="characteristic in house.characteristic.split(',')" size="small">{{characteristic}}</el-tag>
                    </el-space>
                    <div>
                      <span class="text-orange-500 text-xl font-bold">{{house.averagePrice}}</span>
                      <span> 元/㎡</span>
                    </div>
                  </div>
                </div>
              </template>
            </el-table-column>
            <el-table-column label="地址" min-width="280">
              <template v-slot="{ row: house }">
                <div class="space-y-2">
                  <div class="text-lg text-gray-900">{{house.provinceName}}{{house.cityName}}{{house.areaName}}</div>
                  <div>{{house.address}}</div>
                </div>
              </template>
            </el-table-column>
          </el-table>
          <el-pagination
            v-model:current-page="housePaginationInfo.current"
            v-model:page-size="housePaginationInfo.size"
            :page-sizes="[2, 5, 8, 10]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="houseList.total"
            @size-change="getHouseList"
            @current-change="getHouseList"
          />
        </div>
        <div v-else-if="activeIndex === 2" class="space-y-4">
          <el-empty v-if="!houseUnitLoading && houseUnitList.houseUnits.length === 0" description="暂无数据" />
          <div v-else v-loading="houseUnitLoading" class="grid grid-cols-4 gap-4 min-h-10">
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
              <el-radio v-model="addForm.unitId" :label="houseUnit.id" border @change="label => selectHouseUnit(houseUnit)">选择该户型</el-radio>
            </div>
          </div>
          <el-pagination
            v-model:current-page="houseUnitPaginationInfo.current"
            v-model:page-size="houseUnitPaginationInfo.size"
            :page-sizes="[2, 4, 6, 8, 12]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="houseUnitList.total"
            @size-change="getHouseUnitList"
            @current-change="getHouseUnitList"
          />
        </div>
        <div v-else>
          <el-form-item label="销售时间" prop="salesTime">
            <el-date-picker v-model="addForm.salesTime" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="交房时间" prop="completeTime">
            <el-date-picker v-model="addForm.completeTime" type="date" value-format="YYYY-MM-DD" />
          </el-form-item>
          <el-form-item label="总价" prop="totalPrice">
            <el-input-number v-model="addForm.totalPrice" :precision="2" :controls="false" />
            <span class="ml-2">元</span>
          </el-form-item>
           <el-form-item label="首付" prop="deposit">
            <el-input-number v-model="addForm.deposit" :precision="2" :controls="false" />
            <span class="ml-2">元</span>
          </el-form-item>
           <el-form-item label="月供" prop="mortgage">
            <el-input-number v-model="addForm.mortgage" :precision="2" :controls="false" />
            <span class="ml-2">元</span>
          </el-form-item>
        </div>
      </el-form>
      <div class="text-center">
        <el-button v-if="activeIndex > 0" @click="activeIndex--">上一步</el-button>
        <el-button v-if="activeIndex < 3" type="primary" @click="next">下一步</el-button>
        <el-button v-if="activeIndex === 3" type="success" @click="submitAddForm">提交</el-button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, Coin, Collection, Document, Phone, Picture, School, Suitcase } from '@element-plus/icons-vue'
import { AccountBookOutlined, CarOutlined, HomeOutlined } from '@vicons/antd'
import { Building24Regular, CalendarCheckmark24Regular, CalendarLtr24Regular, Certificate24Regular, LeafThree24Regular, PuzzleCube24Regular } from '@vicons/fluent'
import { omit } from 'lodash'
import { reactive, ref } from 'vue'
import { createSales, getCustomers, getHouses, getHouseUnitsByHouseId, getUrl } from '../../api'
import { useRouter } from 'vue-router'

const router = useRouter()

const activeIndex = ref(0)

const addForm = reactive({
  customerId: '',
  houseId: '',
  unitId: '',
  salesTime: '',
  completeTime: '',
  totalPrice: undefined,
  deposit: undefined,
  mortgage: undefined
})
const addFormRef = ref()
const addFormRules = reactive({
  salesTime: [
    { required: true, message: '请选择销售时间', trigger: 'change' }
  ],
  completeTime: [
    { required: true, message: '请选择交房时间', trigger: 'change' }
  ],
  totalPrice: [
    { required: true, message: '请输入总价', trigger: 'blur' }
  ],
  deposit: [
    { required: true, message: '请输入首付', trigger: 'blur' }
  ],
  mortgage: [
    { required: true, message: '请输入月供', trigger: 'blur' }
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
      const { message } = await createSales(omit(addForm, ['houseId']))
      router.push('/sales')
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  })
}

const next = () => {
  if (activeIndex.value === 0) {
    if (!addForm.customerId) {
      ElMessage.error('请选择购房客户')
      return
    }
    getHouseList()
  }
  if (activeIndex.value === 1) {
    if (!addForm.houseId) {
      ElMessage.error('请选择所购楼盘')
      return
    }
    getHouseUnitList()
  }
  if (activeIndex.value === 2 && !addForm.unitId) {
    ElMessage.error('请选择所购户型')
    return
  }
  activeIndex.value++
}

const customerPaginationInfo = reactive({
  current: 1,
  size: 5
})
const customerLoading = ref(true)
const customerList = reactive({
  customers: [],
  total: 0
})
const getCustomerList = async () => {
  customerLoading.value = true
  try {
    const { data: { customers, total } } = await getCustomers(customerPaginationInfo)
    customerList.customers = customers
    customerList.total = total
  } catch (error) {
    customerList.customers = []
    customerList.total = 0
    ElMessage.error(error)
  } finally {
    customerLoading.value = false
  }
}
const customerTableRef = ref()
const selectCustomer = currentRow => {
  addForm.customerId = currentRow.id
}

const housePaginationInfo = reactive({
  current: 1,
  size: 5
})
const houseLoading = ref(true)
const houseList = reactive({
  houses: [],
  total: 0
})
const getHouseList = async () => {
  houseLoading.value = true
  try {
    const { data: { houses, total } } = await getHouses(housePaginationInfo)
    houseList.houses = houses
    houseList.total = total
  } catch (error) {
    houseList.houses = []
    houseList.total = 0
    ElMessage.error(error)
  } finally {
    houseLoading.value = false
  }
}
const houseTableRef = ref()
const selectHouse = currentRow => {
  if (currentRow.saleStatus === 2) {
    houseTableRef.value.setCurrentRow(null)
    ElMessage.error('该楼盘已经售罄')
    return
  }
  addForm.houseId = currentRow.id
}

const houseUnitPaginationInfo = reactive({
  current: 1,
  size: 4
})
const houseUnitLoading = ref(true)
const houseUnitList = reactive({
  houseUnits: [],
  total: 0
})
const getHouseUnitList = async () => {
  houseUnitLoading.value = true
  try {
    const { data: { houseUnits, total } } = await getHouseUnitsByHouseId(addForm.houseId, houseUnitPaginationInfo)
    houseUnitList.houseUnits = houseUnits
    houseUnitList.total = total
  } catch (error) {
    houseUnitList.houseUnits = []
    houseUnitList.total = 0
    ElMessage.error(error)
  } finally {
    houseUnitLoading.value = false
  }
}
const selectHouseUnit = houseUnit => {
  if (houseUnit.saleStatus === 2) {
    addForm.unitId = ''
    ElMessage.error('该户型已经售罄')
    return
  }
}

getCustomerList()
</script>
