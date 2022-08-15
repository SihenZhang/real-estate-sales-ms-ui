<template>
  <div class="space-y-4">
    <el-breadcrumb :separator-icon="ArrowRight">
      <el-breadcrumb-item to="/index">首页</el-breadcrumb-item>
      <el-breadcrumb-item>楼盘管理</el-breadcrumb-item>
    </el-breadcrumb>
    <div class="border-1 p-5 rounded space-y-4 shadow-lg">
      <router-link v-if="userStore.hasPermission('house:create')" to="/houses/add">
        <el-button type="success" :icon="Plus">添加楼盘</el-button>
      </router-link>
      <el-table v-loading="loading" :data="houseList.houses" border stripe>
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
        <el-table-column fixed="right" label="操作" width="180">
          <template v-slot="{ row: house }">
            <div class="flex justify-center flex-wrap -mx-3">
              <el-button v-if="userStore.hasPermission('house:update')" type="primary" size="small" :icon="Edit" class="mx-1.5">编辑</el-button>
              <router-link v-if="userStore.hasPermission('house_unit:query')" :to="`/houses/${house.id}/units`" class="mx-1.5">
                <el-button type="warning" size="small" :icon="HomeOutlined">户型</el-button>
              </router-link>
              <router-link v-if="userStore.hasPermission('house_photo:query')" :to="`/houses/${house.id}/photos`" class="mx-1.5">
                <el-button color="#059669" size="small" :icon="Picture">相册</el-button>
              </router-link>
              <el-button v-if="userStore.hasPermission('house:delete')" type="danger" size="small" :icon="Delete" class="mx-1.5" @click="removeHouse(house.id)">删除</el-button>
            </div>
          </template>
        </el-table-column>
      </el-table>
      <el-pagination
        v-model:current-page="paginationInfo.current"
        v-model:page-size="paginationInfo.size"
        :page-sizes="[2, 5, 8, 10]"
        layout="total, sizes, prev, pager, next, jumper"
        :total="houseList.total"
        @size-change="getHouseList"
        @current-change="getHouseList"
      />
    </div>
  </div>
</template>

<script setup>
import { ArrowRight, Coin, Collection, Document, Delete, Edit, Phone, Picture, Plus, School, Suitcase } from '@element-plus/icons-vue'
import { AccountBookOutlined, CarOutlined, HomeOutlined } from '@vicons/antd'
import { Building24Regular, CalendarCheckmark24Regular, CalendarLtr24Regular, Certificate24Regular, LeafThree24Regular, PuzzleCube24Regular } from '@vicons/fluent'
import { reactive, ref } from 'vue'
import { deleteHouse, getHouses, getUrl } from '../../api'
import { useUserStore } from '../../store'

const userStore = useUserStore()

const paginationInfo = reactive({
  current: 1,
  size: 5
})

const loading = ref(true)
const houseList = reactive({
  houses: [],
  total: 0
})
const getHouseList = async () => {
  loading.value = true
  try {
    const { data: { houses, total } } = await getHouses(paginationInfo)
    houseList.houses = houses
    houseList.total = total
  } catch (error) {
    houseList.houses = []
    houseList.total = 0
    ElMessage.error(error)
  } finally {
    loading.value = false
  }
}

const removeHouse = async id => {
  ElMessageBox.confirm(
    '此操作将永久删除该楼盘，是否继续？',
    '警告',
    { type: 'warning' }
  ).then(async () => {
    try {
      const { message } = await deleteHouse(id)
      if (houseList.houses.length === 1 && paginationInfo.current > 1) {
        paginationInfo.current -= 1
      }
      getHouseList()
      ElMessage.success(message)
    } catch (error) {
      ElMessage.error(error)
    }
  }).catch(() => {
    ElMessage.info('已取消删除')
  })
}

getHouseList()
</script>
