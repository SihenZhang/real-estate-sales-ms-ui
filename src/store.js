import { defineStore } from 'pinia'
import { getCurrentUser } from './api'

export const useUserStore = defineStore('user', {
  state: () => {
    return {
      user: null
    }
  },
  getters: {
    isLogin: state => {
      return !!state.user
    },
    hasPermission: state => {
      return permission => state.user?.permissions.includes(permission)
    }
  },
  actions: {
    async loadCurrentUser() {
      const { data: user } = await getCurrentUser()
      this.user = user
    }
  }
})
