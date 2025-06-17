<template>
  <div class="app-detail-page">
    <!-- 加载状态 -->
    <div v-if="loading" class="flex items-center justify-center min-h-screen">
      <div class="loading-spinner"></div>
      <span class="ml-3 text-gray-600">加载中...</span>
    </div>
    
    <!-- 应用未找到 -->
    <div v-else-if="!app" class="flex flex-col items-center justify-center min-h-screen">
      <div class="text-6xl mb-4">😕</div>
      <h2 class="text-2xl font-bold text-gray-900 mb-2">应用未找到</h2>
      <p class="text-gray-600 mb-6">抱歉，您访问的应用不存在或已被移除</p>
      <router-link 
        to="/" 
        class="btn-primary"
      >
        返回首页
      </router-link>
    </div>
    
    <!-- 应用详情内容 -->
    <div v-else class="min-h-screen bg-gray-50">
      <!-- 顶部导航栏 -->
      <div class="bg-white shadow-sm border-b border-gray-200">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex items-center justify-between h-16">
            <div class="flex items-center gap-3">
              <router-link 
                to="/" 
                class="text-gray-600 hover:text-gray-900 transition-colors"
              >
                ← 返回首页
              </router-link>
              <span class="text-gray-300">|</span>
              <div class="flex items-center gap-2">
                <span class="text-2xl">{{ app.icon }}</span>
                <h1 class="text-xl font-semibold text-gray-900">{{ app.name }}</h1>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      <!-- 应用主体区域 -->
      <div class="flex-1 p-4">
        <div class="max-w-7xl mx-auto">
          <!-- 应用组件容器 -->
          <div class="app-container bg-white rounded-lg shadow-sm">
            <component 
              :is="appComponent" 
              v-if="appComponent"
              @error="handleAppError"
            />
            <div v-else class="text-center py-20">
              <div class="text-6xl mb-6">🚧</div>
              <h3 class="text-xl font-semibold text-gray-900 mb-2">应用正在开发中</h3>
              <p class="text-gray-600">该应用组件正在开发中，请稍后再试</p>
            </div>
          </div>
          

        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { getAppById, importAppComponent } from '@/data/apps.js'

export default {
  name: 'AppDetail',
  data() {
    return {
      app: null,
      loading: true,
      appComponent: null
    }
  },
  methods: {
    /**
     * 加载应用信息
     */
    async loadApp() {
      const appId = this.$route.params.id
      
      this.loading = true
      
      // 模拟加载延迟
      await new Promise(resolve => setTimeout(resolve, 300))
      
      this.app = getAppById(appId)
      
      if (this.app) {
        await this.loadAppComponent()
      }
      
      this.loading = false
    },
    
    /**
     * 动态加载应用组件
     */
    async loadAppComponent() {
      if (!this.app) return
      
      try {
        const component = await importAppComponent(this.app.component, this.app.type)
        this.appComponent = component.default
      } catch (error) {
        this.appComponent = null
        // 可以在这里添加用户友好的错误提示
      }
    },
    
    /**
     * 处理应用错误
     */
    handleAppError(error) {
      // 可以在这里添加用户友好的错误提示
      this.appComponent = null
    }
  },
  async created() {
    await this.loadApp()
  },
  watch: {
    /**
     * 监听路由变化，重新加载应用
     */
    '$route.params.id': {
      handler() {
        this.loadApp()
      },
      immediate: false
    }
  }
}
</script>

<style scoped>
.app-container {
  @apply min-h-screen border-0 rounded-lg overflow-hidden;
}

.loading-spinner {
  @apply w-8 h-8 border-4 border-primary-200 border-t-primary-600 rounded-full animate-spin;
}
</style>