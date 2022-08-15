import axios from 'axios'
import { progressStart, progressDone } from './progress/progress'
import router from './router'
import { useUserStore } from './store'

const ROOT = 'http://localhost:8080/api/'

const instance = axios.create({
  baseURL: ROOT,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  },
  responseType: 'json'
})

instance.interceptors.request.use(
  config => {
    // 请求发送前启动进度条
    progressStart()
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

instance.interceptors.response.use(
  response => {
    console.log(response)
    // 收到响应后结束进度条
    progressDone()
    // 后端返回的响应数据结果为失败时，抛出错误
    if (response.data.code !== 200 && response.data.code !== 201) {
      // 如果是未验证状态，则清空用户状态并跳转到登录页面
      if (response.data.code === 401) {
        const userStore = useUserStore()
        userStore.$reset()
        router.replace('/login')
      }
      // 返回响应错误信息
      return Promise.reject(response.data.message)
    }
    // 返回响应数据
    return response.data
  },
  error => {
    console.log(error)
    progressDone()
    // 返回错误响应信息（此处为Spring Boot的错误响应）
    if (error.response.data) {
      const message = error.response.data.error ?? error.response.data.message
      return Promise.reject(message)
    }
    // 返回Axios错误信息
    return Promise.reject(error.message)
  }
)

export function getUrl(path) {
  return new URL(path, ROOT).href
}

export async function login(loginForm) {
  return await instance.post('users/login', loginForm)
}

export async function getCurrentUser() {
  return await instance.get('users/current')
}

export async function logout() {
  return await instance.get('users/logout')
}

export async function getUsers(paginationInfo) {
  return await instance.get('users', { params: paginationInfo })
}

export async function getUserById(id) {
  return await instance.get(`users/${id}`)
}

export async function createUser(user) {
  return await instance.post('users', user)
}

export async function updateUser(id, user) {
  return await instance.put(`users/${id}`, user)
}

export async function deleteUser(id) {
  return await instance.delete(`users/${id}`)
}

export async function grantRole(id, roleId) {
  return await instance.put(`users/${id}/role`, roleId)
}

export async function getRoles(paginationInfo) {
  return await instance.get('roles', { params: paginationInfo })
}

export async function getRolesWithoutCustomer(paginationInfo) {
  const queryParams = {
    withoutCustomer: true,
    ...paginationInfo
  }
  return await instance.get('roles', { params: queryParams })
}

export async function getRoleById(id) {
  return await instance.get(`roles/${id}`)
}

export async function createRole(role) {
  return await instance.post('roles', role)
}

export async function updateRole(id, role) {
  return await instance.put(`roles/${id}`, role)
}

export async function deleteRole(id) {
  return await instance.delete(`roles/${id}`)
}

export async function getPermissionsByRoleId(id) {
  return await instance.get(`roles/${id}/permissions`)
}

export async function grantPermissions(id, permissions) {
  return await instance.put(`roles/${id}/permissions`, permissions)
}

export async function getPermissions(paginationInfo) {
  return await instance.get('permissions', { params: paginationInfo })
}

export async function getCustomers(paginationInfo) {
  return await instance.get('customers', { params: paginationInfo })
}

export async function getCustomerById(id) {
  return await instance.get(`customers/${id}`)
}

export async function createCustomer(customer) {
  return await instance.post('customers', customer)
}

export async function updateCustomer(id, user) {
  return await instance.put(`customers/${id}`, user)
}

export async function deleteCustomer(id) {
  return await instance.delete(`customers/${id}`)
}

export async function getDistricts(level = 1, subDistrict = 0) {
  const queryParams = { level, subDistrict }
  return await instance.get('districts', { params: queryParams })
}

export async function getSubDistrictsByCode(code) {
  return await instance.get(`districts/${code}`)
}

export async function getHouses(paginationInfo) {
  return await instance.get('houses', { params: paginationInfo })
}

export async function createHouse(house) {
  return await instance.post('houses', house)
}

export async function deleteHouse(id) {
  return await instance.delete(`houses/${id}`)
}

export async function getHouseUnitsByHouseId(id, paginationInfo) {
  return await instance.get(`houses/${id}/units`, { params: paginationInfo })
}

export async function getHouseUnitById(hid, uid) {
  return await instance.get(`houses/${hid}/units/${uid}`)
}

export async function createHouseUnit(id, houseUnit) {
  return await instance.post(`houses/${id}/units`, houseUnit)
}

export async function updateHouseUnit(hid, uid, houseUnit) {
  return await instance.put(`houses/${hid}/units/${uid}`, houseUnit)
}

export async function deleteHouseUnit(hid, uid) {
  return await instance.delete(`houses/${hid}/units/${uid}`)
}

export async function getHousePhotosByHouseId(id, paginationInfo) {
  return await instance.get(`houses/${id}/photos`, { params: paginationInfo })
}

export async function createHousePhoto(id, housePhoto) {
  return await instance.post(`houses/${id}/photos`, housePhoto)
}

export async function getSales(paginationInfo) {
  return await instance.get('sales', { params: paginationInfo })
}

export async function createSales(sales) {
  return await instance.post('sales', sales)
}
