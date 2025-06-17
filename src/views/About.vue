<template>
  <div class="about-page">
    <!-- 英雄区域 -->
    <section class="hero-section gradient-bg text-white py-20">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 class="text-4xl md:text-6xl font-bold mb-6 animate-fade-in">
          欢迎来到 <span class="text-yellow-300">轻玩</span>
        </h1>
        <p class="text-xl md:text-2xl mb-8 text-blue-100 animate-slide-up">
          探索创意无限的Web App工具和Web Game世界
        </p>
        <div class="flex flex-col sm:flex-row gap-4 justify-center items-center animate-slide-up">
          <router-link 
            to="/"
            class="bg-white text-primary-600 hover:bg-gray-100 font-semibold py-3 px-8 rounded-full transition-all duration-300 hover:scale-105"
          >
            开始探索
          </router-link>
          <button 
            @click="scrollToTech"
            class="border-2 border-white text-white hover:bg-white hover:text-primary-600 font-semibold py-3 px-8 rounded-full transition-all duration-300"
          >
            了解技术
          </button>
        </div>
      </div>
    </section>
    
    <!-- 统计数据 -->
    <section class="py-16 bg-white">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          <div class="stat-item">
            <div class="text-3xl font-bold text-primary-600 mb-2">{{ totalApps }}</div>
            <div class="text-gray-600">应用总数</div>
          </div>
          <div class="stat-item">
            <div class="text-3xl font-bold text-secondary-600 mb-2">{{ activeApps }}</div>
            <div class="text-gray-600">可用应用</div>
          </div>
          <div class="stat-item">
            <div class="text-3xl font-bold text-green-600 mb-2">{{ toolApps }}</div>
            <div class="text-gray-600">实用工具</div>
          </div>
          <div class="stat-item">
            <div class="text-3xl font-bold text-orange-600 mb-2">{{ gameApps }}</div>
            <div class="text-gray-600">趣味游戏</div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 技术栈 -->
    <section ref="techSection" class="py-16 bg-gray-50">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">技术架构</h2>
          <p class="text-lg text-gray-600">
            基于现代Web技术构建，确保高性能、可扩展和用户友好的体验
          </p>
        </div>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div class="tech-card card p-6 text-center">
            <div class="text-3xl mb-3">⚡</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">前端框架</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div>Vue.js 3 - 渐进式框架</div>
              <div>Vue Router - 路由管理</div>
              <div>Vite - 构建工具</div>
            </div>
          </div>
          
          <div class="tech-card card p-6 text-center">
            <div class="text-3xl mb-3">🎨</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">样式系统</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div>TailwindCSS - 原子化CSS</div>
              <div>PostCSS - CSS处理</div>
              <div>响应式设计</div>
            </div>
          </div>
          
          <div class="tech-card card p-6 text-center">
            <div class="text-3xl mb-3">🤖</div>
            <h3 class="text-lg font-semibold text-gray-900 mb-2">AI集成</h3>
            <div class="space-y-2 text-sm text-gray-600">
              <div>Transformers.js</div>
              <div>Hugging Face模型</div>
              <div>客户端AI推理</div>
            </div>
          </div>
        </div>
      </div>
    </section>
    
    <!-- 特性介绍 -->
    <section class="py-16 bg-white">
      <div class="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div class="text-center mb-12">
          <h2 class="text-3xl font-bold text-gray-900 mb-6">平台特性</h2>
        </div>
        
        <div class="space-y-8">
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="md:w-1/2">
              <h3 class="text-2xl font-semibold text-gray-900 mb-4">🛠️ 实用工具集</h3>
              <p class="text-gray-600 mb-4">
                提供各种日常工作和生活中需要的实用工具，如调色板生成器、二维码生成器、
                Markdown编辑器等，让复杂的任务变得简单高效。
              </p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 无需安装，即开即用</li>
                <li>• 数据本地处理，保护隐私</li>
                <li>• 支持导出和分享</li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gradient-to-br from-blue-100 to-purple-100 rounded-xl p-8 text-center">
                <div class="text-6xl mb-4">🔧</div>
                <p class="text-gray-700">高效便捷的工具体验</p>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row-reverse items-center gap-8">
            <div class="md:w-1/2">
              <h3 class="text-2xl font-semibold text-gray-900 mb-4">🎮 趣味游戏</h3>
              <p class="text-gray-600 mb-4">
                经典游戏的现代化实现，包括贪吃蛇、俄罗斯方块等，
                在工作之余提供轻松愉快的娱乐体验。
              </p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 经典游戏玩法</li>
                <li>• 现代化界面设计</li>
                <li>• 多种难度选择</li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gradient-to-br from-green-100 to-blue-100 rounded-xl p-8 text-center">
                <div class="text-6xl mb-4">🎯</div>
                <p class="text-gray-700">寓教于乐的游戏体验</p>
              </div>
            </div>
          </div>
          
          <div class="flex flex-col md:flex-row items-center gap-8">
            <div class="md:w-1/2">
              <h3 class="text-2xl font-semibold text-gray-900 mb-4">🤖 AI应用</h3>
              <p class="text-gray-600 mb-4">
                集成Hugging Face的先进AI模型，提供文本生成、图像处理、
                语言翻译等智能功能，让AI技术触手可及。
              </p>
              <ul class="text-sm text-gray-600 space-y-1">
                <li>• 前沿AI模型集成</li>
                <li>• 客户端推理，保护隐私</li>
                <li>• 持续更新模型库</li>
              </ul>
            </div>
            <div class="md:w-1/2">
              <div class="bg-gradient-to-br from-purple-100 to-pink-100 rounded-xl p-8 text-center">
                <div class="text-6xl mb-4">🧠</div>
                <p class="text-gray-700">智能化的AI体验</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    

  </div>
</template>

<script>
import { APPS_DATA, APP_TYPES } from '@/data/apps.js'

export default {
  name: 'About',
  computed: {
    /**
     * 计算应用总数
     */
    totalApps() {
      return APPS_DATA.length
    },
    
    /**
     * 计算可用应用数量
     */
    activeApps() {
      return APPS_DATA.length
    },
    
    /**
     * 计算工具类应用数量
     */
    toolApps() {
      return APPS_DATA.filter(app => 
        app.type === APP_TYPES.TOOL || 
        app.type === APP_TYPES.AI || 
        app.type === APP_TYPES.CREATIVE
      ).length
    },
    
    /**
     * 计算游戏类应用数量
     */
    gameApps() {
      return APPS_DATA.filter(app => app.type === APP_TYPES.GAME).length
    }
  },
  methods: {
    /**
     * 滚动到技术栈部分
     */
    scrollToTech() {
      const techSection = this.$refs.techSection
      if (techSection) {
        techSection.scrollIntoView({ behavior: 'smooth' })
      }
    }
  },
  mounted() {
    // 关于页面已加载
  }
}
</script>

<style scoped>
.feature-card {
  @apply transform hover:scale-105 transition-all duration-300;
}

.tech-card {
  @apply transform hover:scale-105 transition-all duration-300;
}

.deployment-card {
  @apply transform hover:scale-105 transition-all duration-300;
}
</style>