<template>
  <div class="home-page">
    <!-- 应用筛选 -->
    <section ref="appsSection" class="py-8 bg-gray-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="mb-6">          
          <!-- 紧凑型筛选栏 -->
          <div class="bg-white rounded-lg shadow-sm border p-4 mb-4">
            <div class="flex flex-wrap gap-3 items-center justify-between">
              <!-- 左侧筛选器 -->
              <div class="flex flex-wrap gap-3 items-center">
                <select 
                  v-model="selectedType"
                  class="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500"
                >
                  <option 
                    v-for="option in typeOptions" 
                    :key="option.value" 
                    :value="option.value"
                  >
                    {{ option.label }}
                  </option>
                </select>
                

                
                <input 
                  v-model="searchQuery"
                  type="text"
                  placeholder="搜索应用..."
                  class="text-sm px-2 py-1 border border-gray-300 rounded focus:ring-1 focus:ring-primary-500 focus:border-primary-500 w-40"
                />
              </div>
              
              <!-- 右侧信息和操作 -->
              <div class="flex items-center gap-3">
                <span class="text-xs text-gray-500">{{ filteredApps.length }} 个应用</span>
                <button 
                  @click="resetFilters"
                  class="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-600 rounded transition-colors"
                >
                  重置
                </button>
              </div>
            </div>
          </div>
        </div>
        
        <!-- 应用网格 -->
        <div class="app-grid">
          <div 
            v-for="app in filteredApps" 
            :key="app.id"
            class="app-card card card-hover p-6 cursor-pointer"
            @click="viewApp(app)"
          >
            <!-- 应用图标和收藏按钮 -->
            <div class="flex items-start justify-between mb-4">
              <div class="text-4xl mb-3">{{ app.icon }}</div>
              <button 
                @click.stop="toggleFavorite(app.id)"
                class="p-2 rounded-full hover:bg-gray-100 transition-colors"
                :title="isFavorite(app.id) ? '取消收藏' : '添加收藏'"
              >
                <span class="text-xl">
                  {{ isFavorite(app.id) ? '❤️' : '🤍' }}
                </span>
              </button>
            </div>
            
            <!-- 应用信息 -->
            <div class="flex items-center gap-2 mb-2">
              <h3 class="text-xl font-semibold text-gray-900">{{ app.name }}</h3>
              <span v-if="isFavorite(app.id)" class="text-xs bg-red-100 text-red-600 px-2 py-1 rounded-full">
                已收藏
              </span>
            </div>
            <p class="text-gray-600 text-sm mb-4 line-clamp-2">{{ app.description }}</p>
            
            <!-- 标签 -->
            <div class="flex flex-wrap gap-2 mb-4">
              <span 
                v-for="tag in app.tags.slice(0, 3)" 
                :key="tag"
                class="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-md"
              >
                {{ tag }}
              </span>
            </div>
            
            <!-- 功能特性 -->
            <div class="text-xs text-gray-500 mb-4">
              <div class="flex items-center gap-1 mb-1">
                <span>✨</span>
                <span>{{ app.features.join(' • ') }}</span>
              </div>
            </div>
            
            <!-- 操作按钮 -->
            <div class="flex gap-2">
              <button 
                class="flex-1 bg-primary-600 hover:bg-primary-700 text-white text-sm font-medium py-2 px-4 rounded-lg transition-colors"
                @click.stop="viewApp(app)"
              >
                立即使用
              </button>
            </div>
          </div>
        </div>
        
        <!-- 空状态 -->
        <div v-if="filteredApps.length === 0" class="text-center py-16">
          <div class="text-6xl mb-4">🔍</div>
          <h3 class="text-xl font-semibold text-gray-900 mb-2">暂无相关应用</h3>
          <p class="text-gray-600">请尝试其他筛选条件</p>
        </div>
      </div>
    </section>
  </div>
</template>

<script>
import { APPS_DATA, APP_TYPES } from '@/data/apps.js'

export default {
  name: 'Home',
  data() {
    return {
      selectedType: 'all',
      searchQuery: '',
      favorites: [] // 收藏的应用ID列表
    }
  },
  computed: {
    /**
     * 筛选后的应用列表
     */
    filteredApps() {
      let apps = APPS_DATA
      
      // 按类型筛选
      if (this.selectedType !== 'all') {
        apps = apps.filter(app => app.type === this.selectedType)
      }
      
      // 按搜索关键词筛选
      if (this.searchQuery.trim()) {
        const query = this.searchQuery.toLowerCase().trim()
        apps = apps.filter(app => 
          app.name.toLowerCase().includes(query) ||
          app.description.toLowerCase().includes(query) ||
          app.tags.some(tag => tag.toLowerCase().includes(query))
        )
      }
      
      // 收藏的应用置顶排序
      return apps.sort((a, b) => {
        const aIsFavorite = this.isFavorite(a.id)
        const bIsFavorite = this.isFavorite(b.id)
        
        if (aIsFavorite && !bIsFavorite) return -1
        if (!aIsFavorite && bIsFavorite) return 1
        return 0
      })
    },
    
    /**
     * 应用类型选项
     */
    typeOptions() {
      return [
        { value: 'all', label: '全部类型' },
        { value: APP_TYPES.TOOL, label: '实用工具' },
        { value: APP_TYPES.GAME, label: '趣味游戏' },
        { value: APP_TYPES.AI, label: 'AI应用' },
        { value: APP_TYPES.CREATIVE, label: '创意工具' }
      ]
    },
    

  },
  methods: {
    /**
     * 重置筛选条件
     */
    resetFilters() {
      this.selectedType = 'all'
      this.searchQuery = ''
    },
    
    /**
     * 查看应用详情
     */
    viewApp(app) {
      this.$router.push(`/app/${app.id}`)
    },
    
    /**
     * 切换收藏状态
     */
    toggleFavorite(appId) {
      // console.log('切换收藏状态:', appId)
      const index = this.favorites.indexOf(appId)
      if (index > -1) {
        // 取消收藏
        this.favorites.splice(index, 1)
        // console.log('已取消收藏应用:', appId)
      } else {
        // 添加收藏
        this.favorites.push(appId)
        // console.log('已收藏应用:', appId)
      }
      // 保存到本地存储
      this.saveFavoritesToStorage()
    },
    
    /**
     * 检查应用是否已收藏
     */
    isFavorite(appId) {
      return this.favorites.includes(appId)
    },
    
    /**
     * 从本地存储加载收藏列表
     */
    loadFavoritesFromStorage() {
      try {
        const stored = localStorage.getItem('playmint_favorites')
        if (stored) {
          this.favorites = JSON.parse(stored)
          // console.log('已加载收藏列表:', this.favorites)
        }
      } catch (error) {
        console.error('加载收藏列表失败:', error)
        this.favorites = []
      }
    },
    
    /**
     * 保存收藏列表到本地存储
     */
    saveFavoritesToStorage() {
      try {
        localStorage.setItem('playmint_favorites', JSON.stringify(this.favorites))
        // console.log('已保存收藏列表到本地存储')
      } catch (error) {
        // console.error('保存收藏列表失败:', error)
      }
    },
    

  },
  mounted() {
    // 加载收藏列表
    this.loadFavoritesFromStorage()
    // console.log('首页已加载，收藏列表已初始化')
  }
}
</script>

<style scoped>
.stat-item {
  @apply transform hover:scale-105 transition-transform duration-200;
}

.app-card {
  @apply transform transition-all duration-300;
}

.app-card:hover {
  @apply scale-105 shadow-xl;
}

.line-clamp-2 {
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
</style>