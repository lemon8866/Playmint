<template>
  <div class="color-palette-generator p-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🎨 调色板生成器</h2>
      <p class="text-gray-600">智能生成和谐的颜色搭配方案</p>
    </div>
    
    <!-- 控制面板 -->
    <div class="control-panel bg-gray-50 rounded-lg p-6 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <!-- 基础颜色选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">基础颜色</label>
          <div class="flex items-center gap-2">
            <input 
              v-model="baseColor" 
              type="color" 
              class="w-12 h-10 rounded border border-gray-300 cursor-pointer"
              @change="generatePalette"
            >
            <input 
              v-model="baseColor" 
              type="text" 
              class="flex-1 px-3 py-2 border border-gray-300 rounded-md text-sm"
              placeholder="#FF5733"
              @input="onColorInput"
            >
          </div>
        </div>
        
        <!-- 配色方案选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">配色方案</label>
          <select 
            v-model="colorScheme" 
            @change="generatePalette"
            class="w-full px-3 py-2 border border-gray-300 rounded-md text-sm"
          >
            <option value="monochromatic">单色调</option>
            <option value="analogous">类似色</option>
            <option value="complementary">互补色</option>
            <option value="triadic">三角色</option>
            <option value="tetradic">四角色</option>
          </select>
        </div>
        
        <!-- 颜色数量 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">颜色数量: {{ colorCount }}</label>
          <input 
            v-model="colorCount" 
            type="range" 
            min="3" 
            max="8" 
            @input="generatePalette"
            class="w-full"
          >
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="flex gap-3 mt-4">
        <button 
          @click="generateRandomPalette"
          class="btn-primary flex items-center gap-2"
        >
          <span>🎲</span>
          随机生成
        </button>
        <button 
          @click="exportPalette"
          class="btn-secondary flex items-center gap-2"
        >
          <span>💾</span>
          导出调色板
        </button>
        <button 
          @click="copyAllColors"
          class="btn-outline flex items-center gap-2"
        >
          <span>📋</span>
          复制所有颜色
        </button>
      </div>
    </div>
    
    <!-- 调色板展示 -->
    <div class="palette-display">
      <div class="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4">
        <div 
          v-for="(color, index) in palette" 
          :key="index"
          class="color-card group cursor-pointer"
          @click="copyColor(color)"
        >
          <!-- 颜色块 -->
          <div 
            class="color-block w-full h-24 rounded-lg shadow-sm group-hover:shadow-md transition-shadow duration-200"
            :style="{ backgroundColor: color.hex }"
          >
            <div class="w-full h-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <span class="text-white text-sm font-medium bg-black bg-opacity-50 px-2 py-1 rounded">
                点击复制
              </span>
            </div>
          </div>
          
          <!-- 颜色信息 -->
          <div class="color-info mt-3 text-center">
            <div class="font-mono text-sm font-medium text-gray-900">{{ color.hex }}</div>
            <div class="text-xs text-gray-500 mt-1">
              RGB({{ color.rgb.r }}, {{ color.rgb.g }}, {{ color.rgb.b }})
            </div>
            <div class="text-xs text-gray-500">
              HSL({{ color.hsl.h }}°, {{ color.hsl.s }}%, {{ color.hsl.l }}%)
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <!-- 使用建议 -->
    <div class="usage-tips mt-8 bg-blue-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-3">💡 使用建议</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
        <div>
          <h4 class="font-medium mb-2">{{ getSchemeTitle(colorScheme) }}</h4>
          <p>{{ getSchemeDescription(colorScheme) }}</p>
        </div>
        <div>
          <h4 class="font-medium mb-2">应用场景</h4>
          <p>{{ getSchemeUsage(colorScheme) }}</p>
        </div>
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
  name: 'ColorPaletteGenerator',
  data() {
    return {
      baseColor: '#3B82F6',
      colorScheme: 'analogous',
      colorCount: 5,
      palette: [],
      showCopySuccess: false
    }
  },
  methods: {
    /**
     * 生成调色板
     */
    generatePalette() {
      if (!this.isValidHex(this.baseColor)) {
        return
      }
      
      const baseHsl = this.hexToHsl(this.baseColor)
      let colors = []
      
      switch (this.colorScheme) {
        case 'monochromatic':
          colors = this.generateMonochromatic(baseHsl)
          break
        case 'analogous':
          colors = this.generateAnalogous(baseHsl)
          break
        case 'complementary':
          colors = this.generateComplementary(baseHsl)
          break
        case 'triadic':
          colors = this.generateTriadic(baseHsl)
          break
        case 'tetradic':
          colors = this.generateTetradic(baseHsl)
          break
        default:
          colors = [baseHsl]
      }
      
      // 转换为十六进制并添加额外信息
      this.palette = colors.slice(0, this.colorCount).map((hsl, index) => {
        const hex = this.hslToHex(hsl.h, hsl.s, hsl.l)
        const rgb = this.hexToRgb(hex)
        return {
          hex,
          rgb: {
            r: rgb.r,
            g: rgb.g,
            b: rgb.b,
            string: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`
          },
          hsl: {
            h: Math.round(hsl.h),
            s: Math.round(hsl.s),
            l: Math.round(hsl.l),
            string: `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)`
          },
          name: `颜色 ${index + 1}`
        }
      })
    },
    
    /**
     * 生成单色调配色
     */
    generateMonochromatic(baseHsl) {
      const colors = []
      const { h, s } = baseHsl
      
      for (let i = 0; i < this.colorCount; i++) {
        const lightness = 20 + (i * 60 / (this.colorCount - 1))
        colors.push({ h, s, l: Math.round(lightness) })
      }
      
      return colors
    },
    
    /**
     * 生成类似色配色
     */
    generateAnalogous(baseHsl) {
      const colors = []
      const { h, s, l } = baseHsl
      
      for (let i = 0; i < this.colorCount; i++) {
        const hueOffset = (i - Math.floor(this.colorCount / 2)) * 30
        const newHue = (h + hueOffset + 360) % 360
        colors.push({ h: newHue, s, l })
      }
      
      return colors
    },
    
    /**
     * 生成互补色配色
     */
    generateComplementary(baseHsl) {
      const colors = []
      const { h, s, l } = baseHsl
      
      colors.push({ h, s, l })
      colors.push({ h: (h + 180) % 360, s, l })
      
      // 添加变化
      for (let i = 2; i < this.colorCount; i++) {
        const baseH = i % 2 === 0 ? h : (h + 180) % 360
        const newL = l + (i - 1) * 15 * (i % 2 === 0 ? 1 : -1)
        colors.push({ h: baseH, s, l: Math.max(10, Math.min(90, newL)) })
      }
      
      return colors
    },
    
    /**
     * 生成三角色配色
     */
    generateTriadic(baseHsl) {
      const colors = []
      const { h, s, l } = baseHsl
      
      colors.push({ h, s, l })
      colors.push({ h: (h + 120) % 360, s, l })
      colors.push({ h: (h + 240) % 360, s, l })
      
      // 添加变化
      for (let i = 3; i < this.colorCount; i++) {
        const baseH = [h, (h + 120) % 360, (h + 240) % 360][i % 3]
        const newL = l + (i - 2) * 10
        colors.push({ h: baseH, s, l: Math.max(10, Math.min(90, newL)) })
      }
      
      return colors
    },
    
    /**
     * 生成四角色配色
     */
    generateTetradic(baseHsl) {
      const colors = []
      const { h, s, l } = baseHsl
      
      colors.push({ h, s, l })
      colors.push({ h: (h + 90) % 360, s, l })
      colors.push({ h: (h + 180) % 360, s, l })
      colors.push({ h: (h + 270) % 360, s, l })
      
      // 添加变化
      for (let i = 4; i < this.colorCount; i++) {
        const baseH = [h, (h + 90) % 360, (h + 180) % 360, (h + 270) % 360][i % 4]
        const newL = l + (i - 3) * 8
        colors.push({ h: baseH, s, l: Math.max(10, Math.min(90, newL)) })
      }
      
      return colors
    },
    
    /**
     * 生成随机调色板
     */
    generateRandomPalette() {
      const randomHue = Math.floor(Math.random() * 360)
      this.baseColor = this.hslToHex(randomHue, 70, 50)
      this.generatePalette()
    },
    
    /**
     * 复制颜色到剪贴板
     */
    async copyColor(color) {
      try {
        await navigator.clipboard.writeText(color.hex)
        this.showCopySuccess = true
        setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (error) {
        // 静默处理复制失败，用户可以手动复制
      }
    },
    
    /**
     * 复制所有颜色
     */
    async copyAllColors() {
      const colorList = this.palette.map(color => color.hex).join(', ')
      try {
        await navigator.clipboard.writeText(colorList)
        this.showCopySuccess = true
        setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (error) {
        // 静默处理复制失败，用户可以手动复制
      }
    },
    
    /**
     * 导出调色板
     */
    exportPalette() {
      try {
        const paletteData = {
          scheme: this.colorScheme,
          baseColor: this.baseColor,
          colors: this.palette
        }
        
        const dataStr = JSON.stringify(paletteData, null, 2)
        const dataBlob = new Blob([dataStr], { type: 'application/json' })
        const url = URL.createObjectURL(dataBlob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `调色板_${this.colorScheme}_${Date.now()}.json`
        link.click()
        
        URL.revokeObjectURL(url)
      } catch (error) {
        // 静默处理导出失败
      }
    },
    
    /**
     * 颜色输入处理
     */
    onColorInput() {
      if (this.isValidHex(this.baseColor)) {
        this.generatePalette()
      }
    },
    
    /**
     * 验证十六进制颜色
     */
    isValidHex(hex) {
      return /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(hex)
    },
    
    /**
     * 获取配色方案标题
     */
    getSchemeTitle(scheme) {
      const titles = {
        monochromatic: '单色调配色',
        analogous: '类似色配色',
        complementary: '互补色配色',
        triadic: '三角色配色',
        tetradic: '四角色配色'
      }
      return titles[scheme] || '未知配色'
    },
    
    /**
     * 获取配色方案描述
     */
    getSchemeDescription(scheme) {
      const descriptions = {
        monochromatic: '使用同一色相的不同明度和饱和度，营造统一和谐的视觉效果。',
        analogous: '使用色轮上相邻的颜色，创造温和舒适的色彩搭配。',
        complementary: '使用色轮上相对的颜色，产生强烈的对比和视觉冲击。',
        triadic: '使用色轮上等距的三个颜色，平衡而充满活力。',
        tetradic: '使用两对互补色，提供丰富的色彩变化和层次。'
      }
      return descriptions[scheme] || '暂无描述'
    },
    
    /**
     * 获取配色方案使用场景
     */
    getSchemeUsage(scheme) {
      const usages = {
        monochromatic: '适用于简约设计、品牌标识、文档排版等需要统一性的场景。',
        analogous: '适用于自然主题、温馨界面、渐变背景等需要和谐感的设计。',
        complementary: '适用于按钮设计、重点突出、广告海报等需要吸引注意的场景。',
        triadic: '适用于插画设计、游戏界面、儿童产品等需要活泼感的设计。',
        tetradic: '适用于复杂界面、数据可视化、艺术作品等需要丰富色彩的场景。'
      }
      return usages[scheme] || '暂无建议'
    },
    
    // 颜色转换工具函数
    hexToRgb(hex) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
      return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
      } : null
    },
    
    hexToHsl(hex) {
      const rgb = this.hexToRgb(hex)
      if (!rgb) return { h: 0, s: 0, l: 0 }
      
      const r = rgb.r / 255
      const g = rgb.g / 255
      const b = rgb.b / 255
      
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
    
    hslToHex(h, s, l) {
      l /= 100
      const a = s * Math.min(l, 1 - l) / 100
      const f = n => {
        const k = (n + h / 30) % 12
        const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1)
        return Math.round(255 * color).toString(16).padStart(2, '0')
      }
      return `#${f(0)}${f(8)}${f(4)}`
    }
  },
  mounted() {
    this.generatePalette()
  }
}
</script>

<style scoped>
.color-card {
  @apply transform transition-all duration-200 hover:scale-105;
}

.color-block {
  @apply border border-gray-200;
}
</style>