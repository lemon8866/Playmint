<template>
  <div class="color-echo p-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🎵 色彩回声</h2>
      <p class="text-gray-600">点击一个颜色，它会"回应"一个颜色，一来一回构建调色板</p>
    </div>

    <!-- 游戏状态 -->    
    <div class="game-status bg-gray-50 rounded-lg p-4 mb-6">
      <div class="flex justify-between items-center">
        <div class="flex items-center gap-4">
          <span class="text-sm text-gray-600">回合: {{ currentRound }}/{{ maxRounds }}</span>
          <span class="text-sm text-gray-600">调色板: {{ palette.length }} 色</span>
        </div>
        <div class="flex gap-2">
          <button 
            @click="resetGame" 
            class="btn-outline text-sm"
          >
            🔄 重新开始
          </button>
          <button 
            v-if="gameMode === 'challenge'" 
            @click="switchToFreeMode" 
            class="btn-outline text-sm"
          >
            🎨 自由模式
          </button>
          <button 
            v-else 
            @click="startChallenge" 
            class="btn-primary text-sm"
          >
            🎯 挑战模式
          </button>
        </div>
      </div>
    </div>

    <!-- 挑战模式目标 -->
    <div v-if="gameMode === 'challenge'" class="challenge-target bg-blue-50 rounded-lg p-4 mb-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-3">🎯 挑战目标: {{ challengeTarget.name }}</h3>
      <div class="flex gap-2 mb-3">
        <div 
          v-for="(color, index) in challengeTarget.colors" 
          :key="index"
          class="w-8 h-8 rounded border-2 border-white shadow-sm"
          :style="{ backgroundColor: color }"
          :title="color"
        ></div>
      </div>
      <p class="text-sm text-blue-700">{{ challengeTarget.description }}</p>
      <div class="mt-2">
        <div class="text-xs text-blue-600">匹配度: {{ challengeScore }}%</div>
        <div class="w-full bg-blue-200 rounded-full h-2 mt-1">
          <div 
            class="bg-blue-600 h-2 rounded-full transition-all duration-300"
            :style="{ width: challengeScore + '%' }"
          ></div>
        </div>
      </div>
    </div>

    <!-- 颜色选择区域 -->
    <div class="color-selection mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">{{ getSelectionTitle() }}</h3>
      <div class="color-grid grid grid-cols-6 md:grid-cols-8 lg:grid-cols-10 gap-3">
        <div 
          v-for="(color, index) in availableColors" 
          :key="index"
          class="color-option w-12 h-12 rounded-lg cursor-pointer transform transition-all duration-200 hover:scale-110 hover:shadow-lg border-2 border-transparent"
          :class="{ 'border-gray-400 ring-2 ring-blue-500': selectedColor === color }"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
          :title="color"
        ></div>
      </div>
    </div>

    <!-- 当前对话 -->
    <div v-if="currentConversation.length > 0" class="conversation mb-6">
      <h3 class="text-lg font-medium text-gray-900 mb-4">🎵 色彩对话</h3>
      <div class="flex flex-wrap gap-4">
        <div 
          v-for="(exchange, index) in currentConversation" 
          :key="index"
          class="conversation-pair flex items-center gap-3 bg-white rounded-lg p-4 shadow-sm border"
        >
          <!-- 用户选择 -->
          <div class="user-choice text-center">
            <div class="text-xs text-gray-500 mb-1">你选择</div>
            <div 
              class="w-16 h-16 rounded-lg shadow-sm"
              :style="{ backgroundColor: exchange.userColor }"
            ></div>
            <div class="text-xs font-mono mt-1">{{ exchange.userColor }}</div>
          </div>
          
          <!-- 箭头 -->
          <div class="arrow text-2xl text-gray-400">→</div>
          
          <!-- 系统回应 -->
          <div class="system-response text-center">
            <div class="text-xs text-gray-500 mb-1">系统回应</div>
            <div 
              class="w-16 h-16 rounded-lg shadow-sm"
              :style="{ backgroundColor: exchange.systemColor }"
            ></div>
            <div class="text-xs font-mono mt-1">{{ exchange.systemColor }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 构建的调色板 -->
    <div v-if="palette.length > 0" class="built-palette mb-6">
      <div class="flex justify-between items-center mb-4">
        <h3 class="text-lg font-medium text-gray-900">🎨 你的调色板</h3>
        <div class="flex gap-2">
          <button 
            @click="exportPalette" 
            class="btn-secondary text-sm flex items-center gap-1"
          >
            💾 导出
          </button>
          <button 
            @click="generateGradient" 
            class="btn-outline text-sm flex items-center gap-1"
          >
            ✨ 生成渐变
          </button>
        </div>
      </div>
      
      <div class="palette-display">
        <!-- 颜色块展示 -->
        <div class="flex flex-wrap gap-3 mb-4">
          <div 
            v-for="(color, index) in palette" 
            :key="index"
            class="color-item group cursor-pointer"
            @click="copyColor(color)"
          >
            <div 
              class="w-20 h-20 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
              :style="{ backgroundColor: color }"
            >
              <div class="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <span class="text-white text-xs font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                  复制
                </span>
              </div>
            </div>
            <div class="text-xs font-mono text-center mt-1">{{ color }}</div>
          </div>
        </div>
        
        <!-- 渐变预览 -->
        <div v-if="gradientPreview" class="gradient-preview">
          <div class="text-sm font-medium text-gray-700 mb-2">渐变预览:</div>
          <div 
            class="w-full h-16 rounded-lg shadow-sm"
            :style="{ background: gradientPreview }"
          ></div>
          <div class="text-xs font-mono text-gray-500 mt-1">{{ gradientPreview }}</div>
        </div>
      </div>
    </div>

    <!-- 游戏结束 -->
    <div v-if="gameEnded" class="game-end bg-green-50 rounded-lg p-6 text-center">
      <h3 class="text-xl font-bold text-green-900 mb-2">🎉 游戏结束！</h3>
      <p class="text-green-700 mb-4">你创建了一个包含 {{ palette.length }} 种颜色的调色板</p>
      <div v-if="gameMode === 'challenge'" class="challenge-result mb-4">
        <div class="text-lg font-semibold text-green-800">挑战得分: {{ challengeScore }}%</div>
        <div class="text-sm text-green-600">{{ getChallengeResultText() }}</div>
      </div>
      <div class="flex justify-center gap-3">
        <button @click="resetGame" class="btn-primary">🔄 再玩一次</button>
        <button @click="exportPalette" class="btn-secondary">💾 保存调色板</button>
      </div>
    </div>

    <!-- 复制成功提示 -->
    <div 
      v-if="showCopySuccess" 
      class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up"
    >
      ✅ 颜色已复制到剪贴板
    </div>
  </div>
</template>

<script>
export default {
  name: 'ColorEcho',
  data() {
    return {
      // 游戏状态
      gameMode: 'free', // 'free' 或 'challenge'
      currentRound: 0,
      maxRounds: 8,
      gameEnded: false,
      
      // 颜色数据
      selectedColor: null,
      palette: [],
      currentConversation: [],
      gradientPreview: null,
      
      // 可选颜色池
      availableColors: [
        '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FFEAA7',
        '#DDA0DD', '#98D8C8', '#F7DC6F', '#BB8FCE', '#85C1E9',
        '#F8C471', '#82E0AA', '#F1948A', '#85C1E9', '#D7BDE2',
        '#A3E4D7', '#F9E79F', '#D5A6BD', '#AED6F1', '#A9DFBF',
        '#FAD7A0', '#D2B4DE', '#AED6F1', '#A9CCE3', '#F7DC6F',
        '#E8DAEF', '#D1F2EB', '#FCF3CF', '#FADBD8', '#D6EAF8',
        '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
        '#10AC84', '#EE5A24', '#0984E3', '#6C5CE7', '#A29BFE',
        '#FD79A8', '#FDCB6E', '#6C5CE7', '#74B9FF', '#00B894'
      ],
      
      // 挑战模式
      challengeTarget: null,
      challengeScore: 0,
      challengeTemplates: [
        {
          name: '春日花园',
          colors: ['#FFB6C1', '#98FB98', '#87CEEB', '#F0E68C', '#DDA0DD'],
          description: '温暖柔和的春天色彩，如花园中的花朵'
        },
        {
          name: '海洋深处',
          colors: ['#000080', '#4169E1', '#00CED1', '#20B2AA', '#48D1CC'],
          description: '从深海到浅海的蓝色渐变'
        },
        {
          name: '秋日暖阳',
          colors: ['#FF4500', '#FF8C00', '#FFD700', '#F4A460', '#CD853F'],
          description: '秋天的温暖色调，如落叶和夕阳'
        },
        {
          name: '森林漫步',
          colors: ['#228B22', '#32CD32', '#90EE90', '#8FBC8F', '#556B2F'],
          description: '森林中的各种绿色调'
        },
        {
          name: '紫色梦境',
          colors: ['#4B0082', '#8A2BE2', '#9370DB', '#BA55D3', '#DDA0DD'],
          description: '梦幻的紫色系列'
        }
      ],
      
      // UI状态
      showCopySuccess: false
    }
  },
  
  mounted() {
    this.initGame()
  },
  
  methods: {
    /**
     * 初始化游戏
     */
    initGame() {
      console.log('初始化ColorEcho游戏')
      this.resetGame()
    },
    
    /**
     * 重置游戏
     */
    resetGame() {
      console.log('重置游戏状态')
      this.currentRound = 0
      this.gameEnded = false
      this.selectedColor = null
      this.palette = []
      this.currentConversation = []
      this.gradientPreview = null
      this.challengeScore = 0
    },
    
    /**
     * 开始挑战模式
     */
    startChallenge() {
      console.log('开始挑战模式')
      this.gameMode = 'challenge'
      this.challengeTarget = this.challengeTemplates[Math.floor(Math.random() * this.challengeTemplates.length)]
      this.resetGame()
    },
    
    /**
     * 切换到自由模式
     */
    switchToFreeMode() {
      console.log('切换到自由模式')
      this.gameMode = 'free'
      this.challengeTarget = null
      this.resetGame()
    },
    
    /**
     * 获取选择区域标题
     */
    getSelectionTitle() {
      if (this.gameMode === 'challenge') {
        return `选择一个颜色 (尝试匹配目标调色板)`
      }
      return this.currentRound === 0 ? '选择一个起始颜色' : '选择下一个颜色'
    },
    
    /**
     * 选择颜色
     */
    selectColor(color) {
      console.log('用户选择颜色:', color)
      this.selectedColor = color
      
      // 生成系统回应
      const systemResponse = this.generateSystemResponse(color)
      
      // 记录对话
      this.currentConversation.push({
        userColor: color,
        systemColor: systemResponse
      })
      
      // 添加到调色板
      if (!this.palette.includes(color)) {
        this.palette.push(color)
      }
      if (!this.palette.includes(systemResponse)) {
        this.palette.push(systemResponse)
      }
      
      // 更新游戏状态
      this.currentRound++
      
      // 计算挑战得分
      if (this.gameMode === 'challenge') {
        this.calculateChallengeScore()
      }
      
      // 检查游戏是否结束
      if (this.currentRound >= this.maxRounds) {
        this.endGame()
      }
      
      // 清除选择
      this.selectedColor = null
    },
    
    /**
     * 生成系统回应颜色
     */
    generateSystemResponse(userColor) {
      console.log('生成系统回应颜色，基于:', userColor)
      
      const userHsl = this.hexToHsl(userColor)
      let responseHsl
      
      if (this.gameMode === 'challenge' && this.challengeTarget) {
        // 挑战模式：尝试引导向目标颜色
        responseHsl = this.generateChallengeResponse(userHsl)
      } else {
        // 自由模式：基于色彩理论生成和谐色彩
        responseHsl = this.generateHarmoniousResponse(userHsl)
      }
      
      return this.hslToHex(responseHsl.h, responseHsl.s, responseHsl.l)
    },
    
    /**
     * 生成挑战模式回应
     */
    generateChallengeResponse(userHsl) {
      // 从目标颜色中选择一个相近的颜色
      const targetColors = this.challengeTarget.colors.map(color => this.hexToHsl(color))
      
      // 找到与用户颜色最和谐的目标颜色
      let bestTarget = targetColors[0]
      let bestScore = this.calculateColorHarmony(userHsl, bestTarget)
      
      for (const targetColor of targetColors) {
        const harmony = this.calculateColorHarmony(userHsl, targetColor)
        if (harmony > bestScore) {
          bestScore = harmony
          bestTarget = targetColor
        }
      }
      
      // 在目标颜色基础上添加一些变化
      const variation = Math.random() * 20 - 10 // -10 到 +10 的变化
      return {
        h: (bestTarget.h + variation + 360) % 360,
        s: Math.max(20, Math.min(80, bestTarget.s + variation)),
        l: Math.max(20, Math.min(80, bestTarget.l + variation))
      }
    },
    
    /**
     * 生成和谐回应
     */
    generateHarmoniousResponse(userHsl) {
      const responseTypes = ['complementary', 'analogous', 'triadic', 'monochromatic']
      const responseType = responseTypes[Math.floor(Math.random() * responseTypes.length)]
      
      switch (responseType) {
        case 'complementary':
          return {
            h: (userHsl.h + 180) % 360,
            s: userHsl.s + (Math.random() * 20 - 10),
            l: userHsl.l + (Math.random() * 20 - 10)
          }
        case 'analogous':
          return {
            h: (userHsl.h + (Math.random() * 60 - 30) + 360) % 360,
            s: userHsl.s,
            l: userHsl.l + (Math.random() * 20 - 10)
          }
        case 'triadic':
          return {
            h: (userHsl.h + 120) % 360,
            s: userHsl.s + (Math.random() * 20 - 10),
            l: userHsl.l + (Math.random() * 20 - 10)
          }
        case 'monochromatic':
        default:
          return {
            h: userHsl.h,
            s: Math.max(20, Math.min(80, userHsl.s + (Math.random() * 30 - 15))),
            l: Math.max(20, Math.min(80, userHsl.l + (Math.random() * 30 - 15)))
          }
      }
    },
    
    /**
     * 计算颜色和谐度
     */
    calculateColorHarmony(color1, color2) {
      const hueDiff = Math.abs(color1.h - color2.h)
      const satDiff = Math.abs(color1.s - color2.s)
      const lightDiff = Math.abs(color1.l - color2.l)
      
      // 和谐度基于色相、饱和度和亮度的差异
      const hueHarmony = Math.min(hueDiff, 360 - hueDiff) / 180
      const satHarmony = satDiff / 100
      const lightHarmony = lightDiff / 100
      
      return 1 - (hueHarmony * 0.5 + satHarmony * 0.25 + lightHarmony * 0.25)
    },
    
    /**
     * 计算挑战得分
     */
    calculateChallengeScore() {
      if (!this.challengeTarget) return
      
      const targetColors = this.challengeTarget.colors.map(color => this.hexToHsl(color))
      const paletteColors = this.palette.map(color => this.hexToHsl(color))
      
      let totalScore = 0
      let matches = 0
      
      for (const paletteColor of paletteColors) {
        let bestMatch = 0
        for (const targetColor of targetColors) {
          const harmony = this.calculateColorHarmony(paletteColor, targetColor)
          bestMatch = Math.max(bestMatch, harmony)
        }
        totalScore += bestMatch
        matches++
      }
      
      this.challengeScore = matches > 0 ? Math.round((totalScore / matches) * 100) : 0
    },
    
    /**
     * 获取挑战结果文本
     */
    getChallengeResultText() {
      if (this.challengeScore >= 80) {
        return '完美匹配！你是色彩大师！'
      } else if (this.challengeScore >= 60) {
        return '很好的匹配！继续努力！'
      } else if (this.challengeScore >= 40) {
        return '不错的尝试，还有提升空间'
      } else {
        return '需要更多练习，但这是个好开始！'
      }
    },
    
    /**
     * 结束游戏
     */
    endGame() {
      console.log('游戏结束，最终调色板:', this.palette)
      this.gameEnded = true
      
      // 自动生成渐变
      this.generateGradient()
    },
    
    /**
     * 生成渐变
     */
    generateGradient() {
      if (this.palette.length < 2) return
      
      console.log('生成渐变效果')
      const colors = this.palette.slice(0, 5) // 最多使用5个颜色
      this.gradientPreview = `linear-gradient(45deg, ${colors.join(', ')})`
    },
    
    /**
     * 导出调色板
     */
    exportPalette() {
      console.log('导出调色板')
      const paletteData = {
        name: this.gameMode === 'challenge' ? `挑战-${this.challengeTarget.name}` : 'ColorEcho调色板',
        colors: this.palette,
        gradient: this.gradientPreview,
        score: this.challengeScore,
        rounds: this.currentRound,
        timestamp: new Date().toISOString()
      }
      
      const dataStr = JSON.stringify(paletteData, null, 2)
      const dataBlob = new Blob([dataStr], { type: 'application/json' })
      const url = URL.createObjectURL(dataBlob)
      
      const link = document.createElement('a')
      link.href = url
      link.download = `color-echo-palette-${Date.now()}.json`
      link.click()
      
      URL.revokeObjectURL(url)
    },
    
    /**
     * 复制颜色到剪贴板
     */
    async copyColor(color) {
      try {
        await navigator.clipboard.writeText(color)
        console.log('颜色已复制:', color)
        this.showCopySuccess = true
        setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (err) {
        console.error('复制失败:', err)
      }
    },
    
    /**
     * 十六进制转HSL
     */
    hexToHsl(hex) {
      const r = parseInt(hex.slice(1, 3), 16) / 255
      const g = parseInt(hex.slice(3, 5), 16) / 255
      const b = parseInt(hex.slice(5, 7), 16) / 255
      
      const max = Math.max(r, g, b)
      const min = Math.min(r, g, b)
      let h, s, l = (max + min) / 2
      
      if (max === min) {
        h = s = 0
      } else {
        const d = max - min
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min)
        switch (max) {
          case r: h = (g - b) / d + (g < b ? 6 : 0); break
          case g: h = (b - r) / d + 2; break
          case b: h = (r - g) / d + 4; break
        }
        h /= 6
      }
      
      return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100)
      }
    },
    
    /**
     * HSL转十六进制
     */
    hslToHex(h, s, l) {
      h = h % 360
      s = Math.max(0, Math.min(100, s)) / 100
      l = Math.max(0, Math.min(100, l)) / 100
      
      const c = (1 - Math.abs(2 * l - 1)) * s
      const x = c * (1 - Math.abs((h / 60) % 2 - 1))
      const m = l - c / 2
      let r = 0, g = 0, b = 0
      
      if (0 <= h && h < 60) {
        r = c; g = x; b = 0
      } else if (60 <= h && h < 120) {
        r = x; g = c; b = 0
      } else if (120 <= h && h < 180) {
        r = 0; g = c; b = x
      } else if (180 <= h && h < 240) {
        r = 0; g = x; b = c
      } else if (240 <= h && h < 300) {
        r = x; g = 0; b = c
      } else if (300 <= h && h < 360) {
        r = c; g = 0; b = x
      }
      
      r = Math.round((r + m) * 255)
      g = Math.round((g + m) * 255)
      b = Math.round((b + m) * 255)
      
      return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`
    }
  }
}
</script>

<style scoped>
.color-echo {
  max-width: 1200px;
  margin: 0 auto;
}

.color-selection {
  overflow: visible;
}

.color-grid {
  overflow: visible;
}

.color-option {
  position: relative;
  z-index: 1;
}

.color-option:hover::after {
  content: attr(title);
  position: absolute;
  top: -35px;
  left: 50%;
  transform: translateX(-50%);
  background: rgba(0, 0, 0, 0.9);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 11px;
  font-weight: 500;
  white-space: nowrap;
  z-index: 9999;
  pointer-events: none;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
}

.conversation-pair {
  animation: slideIn 0.3s ease-out;
}

@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.animate-slide-up {
  animation: slideUp 0.3s ease-out;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.btn-primary {
  @apply bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors duration-200;
}

.btn-secondary {
  @apply bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition-colors duration-200;
}

.btn-outline {
  @apply border border-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors duration-200;
}
</style>