<template>
  <div id="app" class="min-h-screen bg-gray-50">
    <!-- 导航栏 -->
    <nav class="bg-white shadow-sm border-b border-gray-200 sticky top-0 z-50">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center h-16">
          <!-- Logo和标题 -->
          <div class="flex items-center space-x-3">
            <router-link to="/" class="flex items-center space-x-3 hover:opacity-80 transition-opacity">
              <div class="w-8 h-8 bg-gradient-to-br from-primary-500 to-secondary-500 rounded-lg flex items-center justify-center">
                <span class="text-white font-bold text-sm">轻</span>
              </div>
              <div>
                <h1 class="text-xl font-bold gradient-text">轻玩</h1>
                <p class="text-xs text-gray-500 -mt-1">Playmint</p>
              </div>
            </router-link>
          </div>
          
          <!-- 导航菜单 -->
          <div class="hidden md:flex items-center space-x-8">
            <router-link 
              to="/" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'Home' }"
            >
              首页
            </router-link>
            <router-link 
              to="/about" 
              class="nav-link"
              :class="{ 'nav-link-active': $route.name === 'About' }"
            >
              关于
            </router-link>
          </div>
          
          <!-- 移动端菜单按钮 -->
          <div class="md:hidden">
            <button 
              @click="toggleMobileMenu"
              class="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors"
            >
              <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path>
              </svg>
            </button>
          </div>
        </div>
        
        <!-- 移动端菜单 -->
        <div v-show="showMobileMenu" class="md:hidden py-4 border-t border-gray-200">
          <div class="flex flex-col space-y-2">
            <router-link 
              to="/" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              首页
            </router-link>
            <router-link 
              to="/about" 
              class="mobile-nav-link"
              @click="closeMobileMenu"
            >
              关于
            </router-link>
          </div>
        </div>
      </div>
    </nav>
    
    <!-- 主要内容区域 -->
    <main class="flex-1">
      <router-view v-slot="{ Component }">
        <transition name="page" mode="out-in">
          <component :is="Component" />
        </transition>
      </router-view>
    </main>
    
    <!-- 页脚 -->
    <footer class="bg-white border-t border-gray-200 mt-16">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="text-center">
          <p class="text-gray-600 text-sm">
            © 2025 轻玩 (Playmint). 一个由AI构建的Web App和Web Game平台.
          </p>
          <p class="text-gray-500 text-xs mt-2">
            使用 Vue.js + TailwindCSS 构建
          </p>
        </div>
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  data() {
    return {
      showMobileMenu: false
    }
  },
  methods: {
    /**
     * 切换移动端菜单
     */
    toggleMobileMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    
    /**
     * 关闭移动端菜单
     */
    closeMobileMenu() {
      this.showMobileMenu = false
    }
  },
  mounted() {
    // 轻玩应用组件已挂载
  }
}
</script>

<style scoped>
/* 导航链接样式 */
.nav-link {
  @apply text-gray-600 hover:text-gray-900 font-medium transition-colors duration-200 relative;
}

.nav-link-active {
  @apply text-primary-600;
}

.nav-link-active::after {
  content: '';
  @apply absolute -bottom-4 left-0 right-0 h-0.5 bg-primary-600;
}

.mobile-nav-link {
  @apply block px-3 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-md transition-colors duration-200;
}

/* 页面切换动画 */
.page-enter-active,
.page-leave-active {
  transition: all 0.3s ease;
}

.page-enter-from {
  opacity: 0;
  transform: translateY(10px);
}

.page-leave-to {
  opacity: 0;
  transform: translateY(-10px);
}
</style>