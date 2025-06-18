<template>
  <div class="typestorm-container p-6 bg-transparent">
    <!-- 游戏头部 -->
    <div class="game-header mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">⚡ Typestorm</h2>
          <p class="text-gray-600 mt-1">字能量场 - 让你的打字化为绚烂的视觉风暴</p>
        </div>
        <div class="text-right space-y-2">
          <div class="bg-gradient-to-r from-purple-500 to-pink-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">打字速度</div>
            <div class="text-lg font-bold">{{ typingSpeed.toFixed(1) }} 字/秒</div>
          </div>
          <div class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">粒子数量</div>
            <div class="text-lg font-bold">{{ particleCount }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 画布上方控制区域 -->
    <div class="flex gap-4 mb-6">
      <!-- 粒子效果选择 -->
      <div class="bg-white rounded-lg shadow-sm p-4 flex-1">
        <h3 class="text-lg font-semibold mb-3 text-gray-800">🎨 粒子效果</h3>
        <div class="grid grid-cols-2 gap-2">
          <label v-for="effect in particleEffects" :key="effect.id" class="flex items-center">
            <input
              type="checkbox"
              v-model="selectedEffects"
              :value="effect.id"
              class="mr-2 text-purple-600 focus:ring-purple-500"
            >
            <span class="text-sm">{{ effect.icon }} {{ effect.name }}</span>
          </label>
        </div>
      </div>

      <!-- 画布背景设置 -->
      <div class="bg-white rounded-lg shadow-sm p-4 flex-1">
        <h3 class="text-lg font-semibold mb-3 text-gray-800">🖼️ 画布背景</h3>
        <div class="grid grid-cols-2 gap-2">
          <button
            v-for="bg in backgroundModes"
            :key="bg.id"
            @click="setBackground(bg.id)"
            :class="[
              'p-2 text-left rounded-lg transition-colors border text-sm',
              currentBackground === bg.id ? 'bg-purple-100 text-purple-800 border-purple-300' : 'hover:bg-gray-100 border-gray-200'
            ]"
          >
            <span class="text-base mr-1">{{ bg.icon }}</span>
            <span class="font-medium">{{ bg.name }}</span>
          </button>
          
          <!-- 自定义背景上传 -->
          <div>
            <input
              type="file"
              ref="fileInput"
              @change="handleImageUpload"
              accept="image/*"
              class="hidden"
            >
            <button
              @click="$refs.fileInput.click()"
              :class="[
                'w-full p-2 text-left rounded-lg transition-colors border text-sm',
                currentBackground === 'custom' ? 'bg-purple-100 text-purple-800 border-purple-300' : 'hover:bg-gray-100 border-gray-200'
              ]"
            >
              <span class="text-base mr-1">📁</span>
              <span class="font-medium">自定义</span>
            </button>
          </div>
        </div>
        <p class="text-xs text-gray-500 mt-2">支持 JPG、PNG、GIF 格式</p>
      </div>

      <!-- 控制按钮 -->
      <div class="bg-white rounded-lg shadow-sm p-4">
        <h3 class="text-lg font-semibold mb-3 text-gray-800">🎮 控制</h3>
        <div class="space-y-2">
          <button
            @click="clearCanvas"
            class="w-full bg-red-500 hover:bg-red-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            🗑️ 清空画布
          </button>
          <button
            @click="exportCanvas"
            class="w-full bg-green-500 hover:bg-green-600 text-white py-2 px-3 rounded-lg transition-colors text-sm"
          >
            💾 导出作品
          </button>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 -->
    <div class="flex gap-6 h-[600px]">
      <!-- 左侧画布区域 -->
      <div class="flex-1 bg-white rounded-lg shadow-sm overflow-hidden">
        <div ref="canvasContainer" class="w-full h-full relative">
          <!-- PIXI.js 画布将在这里渲染 -->
        </div>
      </div>

      <!-- 右侧文字输入区域 -->
      <div class="w-80">
        <!-- 文字输入区域 -->
        <div class="bg-white rounded-lg shadow-sm p-4 h-full">
          <h3 class="text-lg font-semibold mb-3 text-gray-800">✍️ 文字输入</h3>
          <textarea
            ref="textInput"
            v-model="inputText"
            @input="handleTextInput"
            @keydown="handleKeyDown"
            @keyup="handleKeyUp"
            @compositionstart="handleCompositionStart"
            @compositionend="handleCompositionEnd"
            placeholder="在这里输入文字，感受字能量场的魅力..."
            class="w-full h-[calc(100%-80px)] p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
          ></textarea>
          <div class="mt-2 text-sm text-gray-500">
            字符数: {{ inputText.length }} | 当前情绪: {{ currentEmotion }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import * as PIXI from 'pixi.js'

export default {
  name: 'Typestorm',
  data() {
    return {
      // PIXI 相关
      app: null,
      particleContainer: null,
      backgroundSprite: null,
      
      // 输入相关
      inputText: '',
      isComposing: false, // 处理中文输入法
      lastInputTime: 0,
      typingSpeed: 0,
      currentEmotion: '平静',
      
      // 粒子系统
      particles: [],
      particleCount: 0,
      maxParticles: 500, // 最大粒子数量限制
      
      // 性能优化相关
      inputDebounceTimer: null,
      lastParticleTime: 0,
      particleThrottle: 16, // 粒子生成节流时间（毫秒）
      performanceMode: false, // 性能模式
      
      // 效果配置
      selectedEffects: ['explosion', 'trail'],
      particleEffects: [
        { id: 'explosion', name: '爆发粒子', icon: '💥' },
        { id: 'trail', name: '轨迹流线', icon: '🌊' },
        { id: 'lightning', name: '闪电碎片', icon: '⚡' },
        { id: 'breath', name: '呼吸流线', icon: '🌬️' },
        { id: 'sparkle', name: '星光闪烁', icon: '✨' },
        { id: 'wave', name: '能量波纹', icon: '〰️' },
        { id: 'rainbow', name: '彩虹粒子', icon: '🌈' },
        { id: 'snowflake', name: '雪花飘落', icon: '❄️' },
        { id: 'heart', name: '心形粒子', icon: '💖' },
        { id: 'flame', name: '火焰燃烧', icon: '🔥' },
        { id: 'butterfly', name: '蝴蝶飞舞', icon: '🦋' },
        { id: 'star', name: '星星闪耀', icon: '⭐' },
        { id: 'flower', name: '花瓣飞舞', icon: '🌸' },
        { id: 'bubble', name: '泡泡浮动', icon: '🫧' }
      ],
      
      // 背景设置
      currentBackground: 'dark',
      backgroundModes: [
        { id: 'dark', name: '深邃夜空', icon: '🌌' },
        { id: 'gradient', name: '渐变星云', icon: '🌈' },
        { id: 'pure', name: '纯净白色', icon: '⚪' },
        { id: 'cosmic', name: '宇宙深空', icon: '🌠' }
      ],
      
      // 情绪词汇映射
      emotionWords: {
        '开心': ['开心', '快乐', '高兴', '愉快', 'happy', 'joy', 'glad'],
        '愤怒': ['愤怒', '生气', '恼火', 'angry', 'mad', 'furious'],
        '悲伤': ['悲伤', '难过', '伤心', 'sad', 'sorrow', 'grief'],
        '兴奋': ['兴奋', '激动', '刺激', 'excited', 'thrilled'],
        '平静': ['平静', '安静', '宁静', 'calm', 'peaceful', 'quiet']
      },
      
      // 颜色配置 - 增强多样性
      emotionColors: {
        '开心': [
          0xFFD700, 0xFFA500, 0xFF6347, 0xFFFF00, 0xFFC0CB, 
          0xFF69B4, 0xFFB6C1, 0xF0E68C, 0xFFE4B5, 0xFFDAB9
        ],
        '愤怒': [
          0xFF4500, 0xDC143C, 0x8B0000, 0xFF0000, 0xB22222,
          0xCD5C5C, 0xF08080, 0xFF6347, 0xFA8072, 0xE9967A
        ],
        '悲伤': [
          0x4169E1, 0x1E90FF, 0x87CEEB, 0x0000FF, 0x6495ED,
          0x4682B4, 0x5F9EA0, 0x708090, 0x778899, 0xB0C4DE
        ],
        '兴奋': [
          0xFF1493, 0xFF69B4, 0xDA70D6, 0xFF00FF, 0xBA55D3,
          0x9370DB, 0x8A2BE2, 0x9400D3, 0x8B008B, 0xDDA0DD
        ],
        '平静': [
          0x98FB98, 0x90EE90, 0x00FA9A, 0x00FF7F, 0x32CD32,
          0x7CFC00, 0x9AFF9A, 0x66CDAA, 0x20B2AA, 0x48D1CC
        ]
      }
    }
  },
  
  mounted() {
    this.initPixi()
    this.setupEventListeners()
  },
  
  beforeUnmount() {
    this.cleanup()
  },
  
  methods: {
    /**
     * 初始化 PIXI.js 应用
     */
    async initPixi() {
      try {
        console.log('初始化 PIXI.js 应用...')
        
        // 获取容器尺寸
        const container = this.$refs.canvasContainer
        const containerWidth = container.clientWidth || 800
        const containerHeight = container.clientHeight || 600
        
        console.log('容器尺寸:', containerWidth, 'x', containerHeight)
        
        // 创建 PIXI 应用
        this.app = new PIXI.Application()
        await this.app.init({
          width: containerWidth,
          height: containerHeight,
          backgroundColor: 0x000011,
          antialias: true,
          resolution: window.devicePixelRatio || 1
        })
        
        // 设置画布样式以完全填充容器
        this.app.canvas.style.width = '100%'
        this.app.canvas.style.height = '100%'
        this.app.canvas.style.display = 'block'
        
        // 将画布添加到容器
        this.$refs.canvasContainer.appendChild(this.app.canvas)
        
        // 创建背景容器
        this.backgroundContainer = new PIXI.Container()
        this.app.stage.addChild(this.backgroundContainer)
        
        // 创建粒子容器
        this.particleContainer = new PIXI.Container()
        this.app.stage.addChild(this.particleContainer)
        
        // 设置初始背景
        this.setBackground('dark')
        
        // 启动动画循环
        this.app.ticker.add(this.updateParticles)
        
        console.log('PIXI.js 应用初始化完成')
      } catch (error) {
        console.error('PIXI.js 初始化失败:', error)
      }
    },
    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
      // 监听窗口大小变化
      window.addEventListener('resize', this.handleResize)
    },
    
    /**
     * 处理文字输入（优化版本）
     */
    handleTextInput(event) {
      if (this.isComposing) return // 中文输入法组合中，不处理
      
      const currentTime = performance.now()
      const timeDiff = currentTime - this.lastInputTime
      
      if (this.lastInputTime > 0 && timeDiff > 0) {
        // 计算打字速度 (字符/秒)
        this.typingSpeed = 1000 / timeDiff
        
        // 根据打字速度自动调整性能模式
        this.performanceMode = this.typingSpeed > 15 // 超过15字/秒启用性能模式
      }
      
      this.lastInputTime = currentTime
      
      // 使用防抖处理情绪检测
      this.debounceEmotionDetection()
      
      // 节流粒子生成
      this.throttleParticleGeneration(event, currentTime)
    },
    
    /**
     * 防抖情绪检测
     */
    debounceEmotionDetection() {
      clearTimeout(this.inputDebounceTimer)
      this.inputDebounceTimer = setTimeout(() => {
        this.detectEmotion()
      }, 100) // 100ms 防抖
    },
    
    /**
     * 节流粒子生成
     */
    throttleParticleGeneration(event, currentTime) {
      // 检查是否超过粒子生成节流时间
      if (currentTime - this.lastParticleTime < this.particleThrottle) {
        return
      }
      
      // 检查粒子数量限制
      if (this.particles.length >= this.maxParticles) {
        // 清理一些旧粒子
        this.cleanupOldParticles()
      }
      
      this.lastParticleTime = currentTime
      this.generateParticles(event)
    },
    
    /**
     * 清理旧粒子
     */
    cleanupOldParticles() {
      const removeCount = Math.floor(this.maxParticles * 0.2) // 清理20%的粒子
      for (let i = 0; i < removeCount && this.particles.length > 0; i++) {
        const particle = this.particles.shift()
        if (particle && particle.parent) {
          particle.parent.removeChild(particle)
          if (particle.destroy) {
            particle.destroy()
          }
        }
      }
    },
    
    /**
     * 处理按键按下
     */
    handleKeyDown(event) {
      if (this.isComposing) return
      
      // 特殊按键处理
      const specialKeys = {
        'Backspace': () => this.createSpecialEffect('delete'),
        'Delete': () => this.createSpecialEffect('delete'),
        'Enter': () => this.createSpecialEffect('enter'),
        ' ': () => this.createSpecialEffect('space')
      }
      
      if (specialKeys[event.key]) {
        specialKeys[event.key]()
      }
    },
    
    /**
     * 处理按键释放
     */
    handleKeyUp(event) {
      // 可以在这里添加按键释放的特效
    },
    
    /**
     * 处理中文输入法开始
     */
    handleCompositionStart() {
      this.isComposing = true
    },
    
    /**
     * 处理中文输入法结束
     */
    handleCompositionEnd(event) {
      this.isComposing = false
      // 处理组合完成的文字
      this.handleTextInput(event)
    },
    
    /**
     * 检测文本情绪
     */
    detectEmotion() {
      const text = this.inputText.toLowerCase()
      
      // 首先检查预定义的情绪词汇
      for (const [emotion, words] of Object.entries(this.emotionWords)) {
        for (const word of words) {
          if (text.includes(word)) {
            this.currentEmotion = emotion
            return
          }
        }
      }
      
      // 如果没有匹配到预定义词汇，使用智能情绪分析
      this.currentEmotion = this.analyzeTextEmotion(text)
    },
    
    /**
     * 智能文本情绪分析
     */
    analyzeTextEmotion(text) {
      const emotions = ['开心', '愤怒', '悲伤', '兴奋', '平静']
      
      // 基于文本特征的情绪权重
      const emotionWeights = {
        '开心': 0,
        '愤怒': 0,
        '悲伤': 0,
        '兴奋': 0,
        '平静': 0
      }
      
      // 1. 标点符号分析
      const exclamationCount = (text.match(/[!！]/g) || []).length
      const questionCount = (text.match(/[?？]/g) || []).length
      const ellipsisCount = (text.match(/[.。…]/g) || []).length
      
      if (exclamationCount > 0) {
        emotionWeights['兴奋'] += exclamationCount * 2
        emotionWeights['开心'] += exclamationCount
      }
      
      if (questionCount > 0) {
        emotionWeights['平静'] += questionCount
      }
      
      if (ellipsisCount > 2) {
        emotionWeights['悲伤'] += ellipsisCount
      }
      
      // 2. 文本长度分析
      const textLength = text.length
      if (textLength > 50) {
        emotionWeights['兴奋'] += 1
      } else if (textLength < 10) {
        emotionWeights['平静'] += 1
      }
      
      // 3. 大写字母分析（表示强烈情绪）
      const upperCaseCount = (text.match(/[A-Z]/g) || []).length
      if (upperCaseCount > textLength * 0.3) {
        emotionWeights['愤怒'] += 2
        emotionWeights['兴奋'] += 1
      }
      
      // 4. 重复字符分析
      const repeatedChars = text.match(/(.)\1{2,}/g)
      if (repeatedChars && repeatedChars.length > 0) {
        emotionWeights['兴奋'] += repeatedChars.length
      }
      
      // 5. 时间因素（增加随机性）
      const timeBasedEmotion = emotions[Date.now() % emotions.length]
      emotionWeights[timeBasedEmotion] += 0.5
      
      // 6. 文本哈希值（基于内容的伪随机）
      let hash = 0
      for (let i = 0; i < text.length; i++) {
        const char = text.charCodeAt(i)
        hash = ((hash << 5) - hash) + char
        hash = hash & hash // 转换为32位整数
      }
      const hashBasedEmotion = emotions[Math.abs(hash) % emotions.length]
      emotionWeights[hashBasedEmotion] += 1
      
      // 7. 添加基础随机权重（确保所有情绪都有机会被选中）
      emotions.forEach(emotion => {
        emotionWeights[emotion] += Math.random() * 0.8
      })
      
      // 找出权重最高的情绪
      let maxWeight = -1
      let selectedEmotion = '平静'
      
      for (const [emotion, weight] of Object.entries(emotionWeights)) {
        if (weight > maxWeight) {
          maxWeight = weight
          selectedEmotion = emotion
        }
      }
      
      console.log('情绪分析结果:', {
        文本: text.substring(0, 20) + (text.length > 20 ? '...' : ''),
        权重分布: emotionWeights,
        选中情绪: selectedEmotion
      })
      
      return selectedEmotion
    },
    
    /**
     * 生成粒子效果（优化版本）
     */
    generateParticles(event) {
      if (!this.app || this.selectedEffects.length === 0) return
      
      // 随机选择画布位置
      const x = Math.random() * this.app.screen.width
      const y = Math.random() * this.app.screen.height
      
      // 性能模式下减少效果数量
      const effectsToGenerate = this.performanceMode 
        ? this.selectedEffects.slice(0, Math.max(1, Math.floor(this.selectedEffects.length / 2)))
        : this.selectedEffects
      
      // 根据选中的效果生成粒子
      effectsToGenerate.forEach(effectId => {
        this.createParticleEffect(effectId, x, y)
      })
    },
    
    /**
     * 创建粒子效果
     */
    createParticleEffect(effectId, x, y) {
      const colors = this.emotionColors[this.currentEmotion] || this.emotionColors['平静']
      const intensity = Math.min(this.typingSpeed / 10, 2) // 强度基于打字速度
      
      switch (effectId) {
        case 'explosion':
          this.createExplosionEffect(x, y, colors, intensity)
          break
        case 'trail':
          this.createTrailEffect(x, y, colors, intensity)
          break
        case 'lightning':
          this.createLightningEffect(x, y, colors, intensity)
          break
        case 'breath':
          this.createBreathEffect(x, y, colors, intensity)
          break
        case 'sparkle':
          this.createSparkleEffect(x, y, colors, intensity)
          break
        case 'wave':
          this.createWaveEffect(x, y, colors, intensity)
          break
        case 'rainbow':
          this.createRainbowEffect(x, y, colors, intensity)
          break
        case 'snowflake':
          this.createSnowflakeEffect(x, y, colors, intensity)
          break
        case 'heart':
          this.createHeartEffect(x, y, colors, intensity)
          break
        case 'flame':
          this.createFlameEffect(x, y, colors, intensity)
          break
        case 'butterfly':
          this.createButterflyEffect(x, y, colors, intensity)
          break
        case 'star':
          this.createStarEffect(x, y, colors, intensity)
          break
        case 'flower':
          this.createFlowerEffect(x, y, colors, intensity)
          break
        case 'bubble':
          this.createBubbleEffect(x, y, colors, intensity)
          break
      }
    },
    
    /**
     * 创建爆发粒子效果（优化版本）
     */
    createExplosionEffect(x, y, colors, intensity) {
      // 性能模式下减少粒子数量
      const baseCount = this.performanceMode ? 5 : 10
      const maxCount = this.performanceMode ? 15 : 30
      const particleCount = Math.floor(baseCount + intensity * (maxCount - baseCount))
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Graphics()
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = this.performanceMode 
          ? 1 + Math.random() * 2 * intensity
          : 2 + Math.random() * 4 * intensity
        
        particle.circle(0, 0, size)
        particle.fill(color)
        
        particle.x = x
        particle.y = y
        
        // 随机速度和方向
        const angle = Math.random() * Math.PI * 2
        const speed = 2 + Math.random() * 8 * intensity
        particle.vx = Math.cos(angle) * speed
        particle.vy = Math.sin(angle) * speed
        particle.life = 1.0
        particle.decay = this.performanceMode 
          ? 0.04 + Math.random() * 0.04 // 性能模式下粒子消失更快
          : 0.02 + Math.random() * 0.02
        
        this.particleContainer.addChild(particle)
        this.particles.push(particle)
      }
    },
    
    /**
     * 创建轨迹流线效果
     */
    createTrailEffect(x, y, colors, intensity) {
      const trail = new PIXI.Graphics()
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      trail.moveTo(x, y)
      
      // 创建曲线轨迹
      const points = []
      for (let i = 0; i < 20; i++) {
        const px = x + (Math.random() - 0.5) * 200 * intensity
        const py = y + (Math.random() - 0.5) * 200 * intensity
        points.push({ x: px, y: py })
      }
      
      // 绘制平滑曲线
      trail.moveTo(points[0].x, points[0].y)
      for (let i = 1; i < points.length - 1; i++) {
        const cp1x = (points[i].x + points[i + 1].x) / 2
        const cp1y = (points[i].y + points[i + 1].y) / 2
        trail.quadraticCurveTo(points[i].x, points[i].y, cp1x, cp1y)
      }
      
      trail.stroke({ width: 2 + intensity, color: color, alpha: 0.8 })
      
      trail.life = 1.0
      trail.decay = 0.01
      
      this.particleContainer.addChild(trail)
      this.particles.push(trail)
    },
    
    /**
     * 创建闪电效果
     */
    createLightningEffect(x, y, colors, intensity) {
      const lightning = new PIXI.Graphics()
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      // 创建锯齿状闪电
      const segments = 8 + Math.floor(intensity * 5)
      const endX = x + (Math.random() - 0.5) * 300
      const endY = y + (Math.random() - 0.5) * 300
      
      lightning.moveTo(x, y)
      
      for (let i = 1; i <= segments; i++) {
        const progress = i / segments
        const segX = x + (endX - x) * progress + (Math.random() - 0.5) * 50
        const segY = y + (endY - y) * progress + (Math.random() - 0.5) * 50
        lightning.lineTo(segX, segY)
      }
      
      lightning.stroke({ width: 3 + intensity, color: color, alpha: 0.9 })
      
      lightning.life = 1.0
      lightning.decay = 0.05
      
      this.particleContainer.addChild(lightning)
      this.particles.push(lightning)
    },
    
    /**
     * 创建呼吸流线效果
     */
    createBreathEffect(x, y, colors, intensity) {
      const breath = new PIXI.Graphics()
      const color = colors[Math.floor(Math.random() * colors.length)]
      
      const radius = 20 + intensity * 30
      breath.circle(x, y, radius)
      breath.stroke({ width: 2, color: color, alpha: 0.3 })
      
      breath.life = 1.0
      breath.decay = 0.005
      breath.scale.set(0.1)
      breath.maxScale = 1 + intensity * 0.5
      
      this.particleContainer.addChild(breath)
      this.particles.push(breath)
    },
    
    /**
     * 创建星光闪烁效果
     */
    createSparkleEffect(x, y, colors, intensity) {
      const sparkleCount = Math.floor(5 + intensity * 10)
      
      for (let i = 0; i < sparkleCount; i++) {
        const sparkle = new PIXI.Graphics()
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = 1 + Math.random() * 3 * intensity
        
        // 创建星形
        const spikes = 4
        const outerRadius = size * 2
        const innerRadius = size
        
        sparkle.star(0, 0, spikes, outerRadius, innerRadius)
        sparkle.fill(color)
        
        sparkle.x = x + (Math.random() - 0.5) * 100
        sparkle.y = y + (Math.random() - 0.5) * 100
        sparkle.life = 1.0
        sparkle.decay = 0.03
        sparkle.rotation = Math.random() * Math.PI * 2
        sparkle.rotationSpeed = (Math.random() - 0.5) * 0.2
        
        this.particleContainer.addChild(sparkle)
        this.particles.push(sparkle)
      }
    },
    
    /**
     * 创建能量波纹效果
     */
    createWaveEffect(x, y, colors, intensity) {
      const waveCount = Math.floor(3 + intensity * 2)
      
      for (let i = 0; i < waveCount; i++) {
        const wave = new PIXI.Graphics()
        const color = colors[Math.floor(Math.random() * colors.length)]
        const radius = 10 + i * 20
        
        wave.circle(x, y, radius)
        wave.stroke({ width: 2, color: color, alpha: 0.6 })
        
        wave.life = 1.0
        wave.decay = 0.02
        wave.scale.set(0.1)
        wave.maxScale = 2 + intensity
        wave.delay = i * 0.1 // 延迟扩散
        
        this.particleContainer.addChild(wave)
        this.particles.push(wave)
      }
    },
    
    /**
     * 创建彩虹粒子效果
     */
    createRainbowEffect(x, y, colors, intensity) {
      const particleCount = Math.floor(10 + intensity * 15)
      const rainbowColors = [0xFF0000, 0xFF7F00, 0xFFFF00, 0x00FF00, 0x0000FF, 0x4B0082, 0x9400D3]
      
      for (let i = 0; i < particleCount; i++) {
        const particle = new PIXI.Graphics()
        const color = rainbowColors[i % rainbowColors.length]
        const size = 2 + Math.random() * 4 * intensity
        
        particle.circle(0, 0, size)
        particle.fill(color)
        
        const angle = (i / particleCount) * Math.PI * 2
        const speed = 2 + Math.random() * 3 * intensity
        
        particle.x = x
        particle.y = y
        particle.vx = Math.cos(angle) * speed
        particle.vy = Math.sin(angle) * speed
        particle.life = 1.0
        particle.decay = 0.02
        
        this.particleContainer.addChild(particle)
        this.particles.push(particle)
      }
    },
    
    /**
     * 创建雪花飘落效果
     */
    createSnowflakeEffect(x, y, colors, intensity) {
      const snowflakeCount = Math.floor(5 + intensity * 8)
      
      for (let i = 0; i < snowflakeCount; i++) {
        const snowflake = new PIXI.Graphics()
        const color = 0xFFFFFF
        const size = 1 + Math.random() * 3 * intensity
        
        // 创建六角雪花
        for (let j = 0; j < 6; j++) {
          const angle = (j / 6) * Math.PI * 2
          const lineLength = size * 3
          snowflake.moveTo(0, 0)
          snowflake.lineTo(Math.cos(angle) * lineLength, Math.sin(angle) * lineLength)
        }
        snowflake.stroke({ width: 1, color: color, alpha: 0.8 })
        
        snowflake.x = x + (Math.random() - 0.5) * 100
        snowflake.y = y - Math.random() * 50
        snowflake.vx = (Math.random() - 0.5) * 0.5
        snowflake.vy = 1 + Math.random() * 2
        snowflake.life = 1.0
        snowflake.decay = 0.005
        snowflake.rotationSpeed = (Math.random() - 0.5) * 0.1
        
        this.particleContainer.addChild(snowflake)
        this.particles.push(snowflake)
      }
    },
    
    /**
     * 创建心形粒子效果
     */
    createHeartEffect(x, y, colors, intensity) {
      const heartCount = Math.floor(3 + intensity * 5)
      
      for (let i = 0; i < heartCount; i++) {
        const heart = new PIXI.Graphics()
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = 5 + Math.random() * 10 * intensity
        
        // 创建心形路径
        const heartPath = []
        for (let t = 0; t <= Math.PI * 2; t += 0.1) {
          const heartX = 16 * Math.pow(Math.sin(t), 3)
          const heartY = -(13 * Math.cos(t) - 5 * Math.cos(2*t) - 2 * Math.cos(3*t) - Math.cos(4*t))
          heartPath.push([heartX * size / 16, heartY * size / 16])
        }
        
        if (heartPath.length > 0) {
          heart.moveTo(heartPath[0][0], heartPath[0][1])
          for (let j = 1; j < heartPath.length; j++) {
            heart.lineTo(heartPath[j][0], heartPath[j][1])
          }
          heart.fill(color)
        }
        
        heart.x = x + (Math.random() - 0.5) * 80
        heart.y = y + (Math.random() - 0.5) * 80
        heart.vx = (Math.random() - 0.5) * 2
        heart.vy = -Math.random() * 3 - 1
        heart.life = 1.0
        heart.decay = 0.015
        heart.rotationSpeed = (Math.random() - 0.5) * 0.1
        
        this.particleContainer.addChild(heart)
        this.particles.push(heart)
      }
    },
    
    /**
     * 创建火焰燃烧效果
     */
    createFlameEffect(x, y, colors, intensity) {
      const flameCount = Math.floor(8 + intensity * 12)
      const flameColors = [0xFF4500, 0xFF6347, 0xFFD700, 0xFF8C00]
      
      for (let i = 0; i < flameCount; i++) {
        const flame = new PIXI.Graphics()
        const color = flameColors[Math.floor(Math.random() * flameColors.length)]
        const size = 3 + Math.random() * 6 * intensity
        
        // 创建火焰形状
        flame.circle(0, 0, size)
        flame.fill(color)
        
        flame.x = x + (Math.random() - 0.5) * 30
        flame.y = y + Math.random() * 20
        flame.vx = (Math.random() - 0.5) * 1
        flame.vy = -Math.random() * 4 - 2
        flame.life = 1.0
        flame.decay = 0.03
        flame.scale.set(0.5 + Math.random() * 0.5)
        
        this.particleContainer.addChild(flame)
        this.particles.push(flame)
      }
    },
    
    /**
     * 创建蝴蝶飞舞效果
     */
    createButterflyEffect(x, y, colors, intensity) {
      const butterflyCount = Math.floor(2 + intensity * 3)
      
      for (let i = 0; i < butterflyCount; i++) {
        const butterfly = new PIXI.Graphics()
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = 4 + Math.random() * 6 * intensity
        
        // 创建蝴蝶翅膀
        butterfly.ellipse(-size/2, -size/4, size/2, size/3)
        butterfly.ellipse(size/2, -size/4, size/2, size/3)
        butterfly.ellipse(-size/3, size/4, size/3, size/4)
        butterfly.ellipse(size/3, size/4, size/3, size/4)
        butterfly.fill(color)
        
        // 蝴蝶身体
        butterfly.rect(-1, -size/2, 2, size)
        butterfly.fill(0x000000)
        
        butterfly.x = x + (Math.random() - 0.5) * 100
        butterfly.y = y + (Math.random() - 0.5) * 100
        butterfly.vx = (Math.random() - 0.5) * 3
        butterfly.vy = (Math.random() - 0.5) * 3
        butterfly.life = 1.0
        butterfly.decay = 0.01
        butterfly.rotationSpeed = (Math.random() - 0.5) * 0.05
        
        this.particleContainer.addChild(butterfly)
        this.particles.push(butterfly)
      }
    },
    
    /**
     * 创建星星闪耀效果
     */
    createStarEffect(x, y, colors, intensity) {
      const starCount = Math.floor(6 + intensity * 10)
      
      for (let i = 0; i < starCount; i++) {
        const star = new PIXI.Graphics()
        const color = colors[Math.floor(Math.random() * colors.length)]
        const size = 2 + Math.random() * 4 * intensity
        
        // 创建五角星
        const spikes = 5
        const outerRadius = size * 2
        const innerRadius = size
        
        star.star(0, 0, spikes, outerRadius, innerRadius)
        star.fill(color)
        
        star.x = x + (Math.random() - 0.5) * 120
        star.y = y + (Math.random() - 0.5) * 120
        star.vx = (Math.random() - 0.5) * 2
        star.vy = (Math.random() - 0.5) * 2
        star.life = 1.0
        star.decay = 0.02
        star.rotationSpeed = (Math.random() - 0.5) * 0.15
        
        this.particleContainer.addChild(star)
        this.particles.push(star)
      }
    },
    
    /**
     * 创建花瓣飞舞效果
     */
    createFlowerEffect(x, y, colors, intensity) {
      const petalCount = Math.floor(8 + intensity * 12)
      const flowerColors = [0xFFB6C1, 0xFF69B4, 0xFF1493, 0xDC143C, 0xFFFFE0]
      
      for (let i = 0; i < petalCount; i++) {
        const petal = new PIXI.Graphics()
        const color = flowerColors[Math.floor(Math.random() * flowerColors.length)]
        const size = 3 + Math.random() * 5 * intensity
        
        // 创建花瓣形状（椭圆）
        petal.ellipse(0, 0, size, size * 1.5)
        petal.fill(color)
        
        petal.x = x + (Math.random() - 0.5) * 80
        petal.y = y + (Math.random() - 0.5) * 80
        petal.vx = (Math.random() - 0.5) * 2
        petal.vy = Math.random() * 2 + 1
        petal.life = 1.0
        petal.decay = 0.008
        petal.rotationSpeed = (Math.random() - 0.5) * 0.2
        
        this.particleContainer.addChild(petal)
        this.particles.push(petal)
      }
    },
    
    /**
     * 创建泡泡浮动效果
     */
    createBubbleEffect(x, y, colors, intensity) {
      const bubbleCount = Math.floor(6 + intensity * 10)
      
      for (let i = 0; i < bubbleCount; i++) {
        const bubble = new PIXI.Graphics()
        const size = 5 + Math.random() * 15 * intensity
        
        // 创建泡泡（空心圆）
        bubble.circle(0, 0, size)
        bubble.stroke({ width: 2, color: 0x87CEEB, alpha: 0.6 })
        
        // 添加高光效果
        const highlight = new PIXI.Graphics()
        highlight.circle(size * 0.3, -size * 0.3, size * 0.2)
        highlight.fill({ color: 0xFFFFFF, alpha: 0.8 })
        bubble.addChild(highlight)
        
        bubble.x = x + (Math.random() - 0.5) * 100
        bubble.y = y + Math.random() * 50
        bubble.vx = (Math.random() - 0.5) * 1
        bubble.vy = -Math.random() * 3 - 1
        bubble.life = 1.0
        bubble.decay = 0.01
        bubble.scale.set(0.3 + Math.random() * 0.7)
        
        this.particleContainer.addChild(bubble)
        this.particles.push(bubble)
      }
    },
    
    /**
     * 创建特殊按键效果
     */
    createSpecialEffect(type) {
      const x = Math.random() * this.app.screen.width
      const y = Math.random() * this.app.screen.height
      
      switch (type) {
        case 'delete':
          this.createExplosionEffect(x, y, [0xFF0000, 0xFF4500], 2)
          break
        case 'enter':
          this.createWaveEffect(x, y, [0x00FF00, 0x32CD32], 1.5)
          break
        case 'space':
          this.createBreathEffect(x, y, [0x87CEEB, 0x4169E1], 1)
          break
      }
    },
    
    /**
     * 更新粒子动画（优化版本）
     */
    updateParticles() {
      this.particleCount = this.particles.length
      
      // 批量处理粒子更新，提高性能
      const particlesToRemove = []
      
      for (let i = 0; i < this.particles.length; i++) {
        const particle = this.particles[i]
        
        if (!particle || !particle.parent) {
          particlesToRemove.push(i)
          continue
        }
        
        // 更新生命周期
        particle.life -= particle.decay
        
        // 更新透明度
        particle.alpha = particle.life
        
        // 更新位置（如果有速度）
        if (particle.vx !== undefined) {
          particle.x += particle.vx
          particle.y += particle.vy
          particle.vy += 0.1 // 重力效果
          
          // 添加阻力
          particle.vx *= 0.99
          particle.vy *= 0.99
        }
        
        // 更新旋转（如果有旋转速度）
        if (particle.rotationSpeed !== undefined) {
          particle.rotation += particle.rotationSpeed
        }
        
        // 更新缩放（呼吸和波纹效果）
        if (particle.maxScale !== undefined) {
          const progress = 1 - particle.life
          if (particle.delay && progress < particle.delay) {
            // 延迟效果
            continue
          }
          particle.scale.set(progress * particle.maxScale)
        }
        
        // 移除死亡的粒子
        if (particle.life <= 0) {
          particlesToRemove.push(i)
          continue
        }
        
        // 边界检查
        if (particle.x < -50 || particle.x > this.app.screen.width + 50 ||
            particle.y < -50 || particle.y > this.app.screen.height + 50) {
          particlesToRemove.push(i)
        }
      }
      
      // 批量移除粒子
      this.batchRemoveParticles(particlesToRemove)
    },
    
    /**
     * 批量移除粒子
     */
    batchRemoveParticles(indices) {
      // 从后往前移除，避免索引错乱
      for (let i = indices.length - 1; i >= 0; i--) {
        const index = indices[i]
        const particle = this.particles[index]
        
        if (particle) {
          if (particle.parent) {
            particle.parent.removeChild(particle)
          }
          if (particle.destroy) {
            particle.destroy()
          }
        }
        
        this.particles.splice(index, 1)
      }
    },
    
    /**
     * 设置背景
     */
    setBackground(backgroundId) {
      console.log('设置背景:', backgroundId)
      this.currentBackground = backgroundId
      
      // 清除现有背景
      if (!this.backgroundContainer) {
        this.backgroundContainer = new PIXI.Container()
        this.app.stage.addChildAt(this.backgroundContainer, 0)
      }
      this.backgroundContainer.removeChildren()
      
      switch (backgroundId) {
        case 'dark':
          this.app.renderer.background.color = 0x000011
          break
        case 'gradient':
          this.createGradientBackground()
          break
        case 'pure':
          this.app.renderer.background.color = 0xFFFFFF
          break
        case 'cosmic':
          this.createCosmicBackground()
          break
      }
    },
    
    /**
     * 创建渐变背景
     */
    createGradientBackground() {
      const graphics = new PIXI.Graphics()
      
      // 创建渐变矩形
      graphics.rect(0, 0, this.app.screen.width, this.app.screen.height)
      graphics.fill({
        color: 0x667eea
      })
      
      // 添加渐变效果
      const gradient = new PIXI.Graphics()
      gradient.rect(0, 0, this.app.screen.width, this.app.screen.height)
      gradient.fill({
        color: 0x764ba2,
        alpha: 0.7
      })
      
      this.backgroundContainer.addChild(graphics)
      this.backgroundContainer.addChild(gradient)
      this.app.renderer.background.color = 0x667eea
    },
    
    /**
     * 创建宇宙背景
     */
    createCosmicBackground() {
      const graphics = new PIXI.Graphics()
      
      // 深色背景
      graphics.rect(0, 0, this.app.screen.width, this.app.screen.height)
      graphics.fill(0x0A0A0A)
      
      // 添加星星
      for (let i = 0; i < 100; i++) {
        const x = Math.random() * this.app.screen.width
        const y = Math.random() * this.app.screen.height
        const size = Math.random() * 2 + 0.5
        
        graphics.circle(x, y, size)
        graphics.fill(0xFFFFFF)
      }
      
      this.backgroundContainer.addChild(graphics)
      this.app.renderer.background.color = 0x0A0A0A
    },
    
    /**
     * 处理图片上传
     */
    async handleImageUpload(event) {
      const file = event.target.files[0]
      if (!file) return
      
      try {
        // 创建图片元素
        const img = new Image()
        const url = URL.createObjectURL(file)
        
        // 等待图片加载完成
        await new Promise((resolve, reject) => {
          img.onload = resolve
          img.onerror = reject
          img.src = url
        })
        
        // 使用 PIXI.Texture.from 创建纹理
        const texture = PIXI.Texture.from(img)
        
        // 确保背景容器存在
        if (!this.backgroundContainer) {
          this.backgroundContainer = new PIXI.Container()
          this.app.stage.addChildAt(this.backgroundContainer, 0)
        }
        
        // 清除现有背景
        this.backgroundContainer.removeChildren()
        
        const sprite = new PIXI.Sprite(texture)
        
        // 调整图片大小以适应画布
        const scaleX = this.app.screen.width / texture.width
        const scaleY = this.app.screen.height / texture.height
        const scale = Math.min(scaleX, scaleY)
        
        sprite.scale.set(scale)
        sprite.x = (this.app.screen.width - sprite.width) / 2
        sprite.y = (this.app.screen.height - sprite.height) / 2
        
        this.backgroundContainer.addChild(sprite)
        
        // 设置当前背景为自定义
        this.currentBackground = 'custom'
        
        // 清理资源
        URL.revokeObjectURL(url)
        
        console.log('自定义背景设置成功')
      } catch (error) {
        console.error('图片上传失败:', error)
        alert('图片上传失败，请检查文件格式是否正确')
      }
      
      // 清空文件输入，允许重复选择同一文件
      event.target.value = ''
    },
    
    /**
     * 清空画布
     */
    clearCanvas() {
      // 清除所有粒子
      this.particles.forEach(particle => {
        this.particleContainer.removeChild(particle)
      })
      this.particles = []
      this.particleCount = 0
      
      console.log('画布已清空')
    },
    
    /**
     * 导出画布
     */
    exportCanvas() {
      try {
        // 使用 PIXI 的 extract 插件导出画布
        const canvas = this.app.renderer.extract.canvas(this.app.stage)
        
        // 创建下载链接
        const link = document.createElement('a')
        link.download = `typestorm-${Date.now()}.png`
        link.href = canvas.toDataURL()
        link.click()
        
        console.log('作品导出成功')
      } catch (error) {
        console.error('导出失败:', error)
      }
    },
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
      if (!this.app) return
      
      const container = this.$refs.canvasContainer
      if (container) {
        const newWidth = container.clientWidth
        const newHeight = container.clientHeight
        
        console.log('调整画布尺寸:', newWidth, 'x', newHeight)
        
        // 调整渲染器尺寸
        this.app.renderer.resize(newWidth, newHeight)
        
        // 重新设置当前背景以适应新尺寸
        if (this.currentBackground) {
          this.setBackground(this.currentBackground)
        }
      }
    },
    
    /**
     * 清理资源
     */
    cleanup() {
      // 清理定时器
      if (this.inputDebounceTimer) {
        clearTimeout(this.inputDebounceTimer)
        this.inputDebounceTimer = null
      }
      
      // 清理粒子
      this.particles.forEach(particle => {
        if (particle && particle.parent) {
          particle.parent.removeChild(particle)
        }
        if (particle && particle.destroy) {
          particle.destroy()
        }
      })
      
      if (this.app) {
        this.app.destroy(true, true)
        this.app = null
      }
      
      this.particles = []
      this.particleCount = 0
      
      window.removeEventListener('resize', this.handleResize)
      
      console.log('Typestorm 组件已清理')
    }
  }
}
</script>

<style scoped>
.typestorm-container {
  min-height: 100vh;
  /* background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%); */
}

.game-header {
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border-radius: 12px;
  padding: 1.5rem;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

/* 自定义滚动条 */
::-webkit-scrollbar {
  width: 6px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 3px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a8a8a8;
}

/* 输入框焦点效果 */
textarea:focus {
  box-shadow: 0 0 0 3px rgba(147, 51, 234, 0.1);
}

/* 按钮悬停效果 */
button {
  transition: all 0.2s ease;
}

button:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

/* 画布容器样式 */
.canvas-container {
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}
</style>