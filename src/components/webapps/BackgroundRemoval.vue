<template>
  <div class="background-removal p-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🖼️ 智能背景移除</h2>
      <p class="text-gray-600">🔒 本地离线AI背景移除 - 无需上传图片，保护隐私安全，支持多种图片格式</p>
      
      <!-- 模型选择和信息显示 -->
      <div class="model-info mt-4 p-4 bg-gray-50 rounded-lg border">
        <div class="flex flex-col md:flex-row items-center justify-center gap-4 text-sm">
          <!-- 模型选择器 -->
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-700">选择模型:</span>
            <select 
              v-model="selectedModelIndex"
              @change="switchModel"
              :disabled="modelLoadingStatus === '加载中'"
              class="px-3 py-1 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <option v-for="(model, index) in availableModels" :key="index" :value="index">
                {{ model.displayName }}
              </option>
            </select>
          </div>
          
          <!-- 当前模型信息 -->
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-700">当前模型:</span>
            <span class="text-blue-600 font-mono">{{ currentModelName || '未选择' }}</span>
          </div>
          
          <!-- 模型状态 -->
          <div class="flex items-center gap-2">
            <span class="font-medium text-gray-700">状态:</span>
            <span 
              class="px-2 py-1 rounded-full text-xs font-medium"
              :class="{
                'bg-green-100 text-green-800': modelLoadingStatus === '已加载',
                'bg-yellow-100 text-yellow-800': modelLoadingStatus === '加载中',
                'bg-red-100 text-red-800': modelLoadingStatus === '加载失败',
                'bg-gray-100 text-gray-800': modelLoadingStatus === '未加载'
              }"
            >
              {{ modelLoadingStatus }}
            </span>
          </div>
          
          <!-- 手动重新加载按钮 -->
          <button 
            @click="reloadCurrentModel"
            :disabled="modelLoadingStatus === '加载中'"
            class="px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-xs rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {{ modelLoadingStatus === '加载中' ? '加载中...' : '重新加载' }}
          </button>
        </div>
      </div>
    </div>
    
    <!-- 上传区域 -->
    <div class="upload-section bg-gray-50 rounded-lg p-6 mb-6">
      <div 
        class="upload-area border-2 border-dashed border-gray-300 rounded-lg p-8 text-center transition-colors duration-200"
        :class="{ 'border-blue-400 bg-blue-50': isDragOver }"
        @dragover.prevent="isDragOver = true"
        @dragleave.prevent="isDragOver = false"
        @drop.prevent="handleDrop"
      >
        <div v-if="!selectedImage" class="space-y-4">
          <div class="text-6xl">📸</div>
          <div>
            <p class="text-lg font-medium text-gray-700 mb-2">拖拽图片到此处或点击选择</p>
            <p class="text-sm text-gray-500">支持 JPG、PNG、WebP 格式，最大 10MB</p>
          </div>
          <input 
            ref="fileInput"
            type="file" 
            accept="image/*" 
            @change="handleFileSelect"
            class="hidden"
          >
          <button 
            @click="$refs.fileInput.click()"
            class="btn-primary"
          >
            选择图片
          </button>
        </div>
        
        <div v-else class="space-y-4">
          <img 
            :src="selectedImage" 
            alt="选中的图片" 
            class="max-w-full max-h-64 mx-auto rounded-lg shadow-sm"
          >
          <div class="flex gap-3 justify-center">
            <button 
              @click="processImage"
              :disabled="isProcessing"
              class="btn-primary flex items-center gap-2"
            >
              <span v-if="isProcessing">⏳</span>
              <span v-else>✨</span>
              {{ isProcessing ? '处理中...' : '移除背景' }}
            </button>
            <button 
              @click="resetImage"
              class="btn-outline"
            >
              重新选择
            </button>
          </div>
        </div>
      </div>
      
      <!-- 处理进度 -->
      <div v-if="isProcessing" class="mt-4">
        <div class="bg-gray-200 rounded-full h-2">
          <div 
            class="bg-blue-500 h-2 rounded-full transition-all duration-300"
            :style="{ width: progress + '%' }"
          ></div>
        </div>
        <p class="text-sm text-gray-600 mt-2 text-center">{{ statusMessage }}</p>
      </div>
    </div>
    
    <!-- 结果展示 -->
    <div v-if="processedImage" class="result-section">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">处理结果</h3>
      
      <!-- 对比展示 -->
      <div class="comparison-view bg-white rounded-lg shadow-sm p-6 mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- 原图 -->
          <div class="original-image">
            <h4 class="text-sm font-medium text-gray-700 mb-3">原图</h4>
            <div class="image-container bg-gray-100 rounded-lg p-4">
              <img 
                :src="selectedImage" 
                alt="原图" 
                class="w-full h-auto rounded-lg"
              >
            </div>
          </div>
          
          <!-- 处理后 -->
          <div class="processed-image">
            <h4 class="text-sm font-medium text-gray-700 mb-3">背景移除后</h4>
            <div class="image-container bg-transparent-pattern rounded-lg p-4">
              <img 
                :src="processedImage" 
                alt="处理后" 
                class="w-full h-auto rounded-lg"
              >
            </div>
          </div>
        </div>
      </div>
      
      <!-- 操作按钮 -->
      <div class="actions flex flex-wrap gap-3 justify-center">
        <button 
          @click="downloadImage"
          class="btn-primary flex items-center gap-2"
        >
          <span>💾</span>
          下载图片
        </button>
        <button 
          @click="copyImageToClipboard"
          class="btn-secondary flex items-center gap-2"
        >
          <span>📋</span>
          复制到剪贴板
        </button>
        <button 
          @click="processAnotherImage"
          class="btn-outline flex items-center gap-2"
        >
          <span>🔄</span>
          处理新图片
        </button>
      </div>
    </div>
    
    <!-- 错误提示 -->
    <div v-if="errorMessage" class="error-message bg-red-50 border border-red-200 rounded-lg p-4 mt-4">
      <div class="flex items-center justify-between">
        <div class="flex items-center gap-2">
          <span class="text-red-500">❌</span>
          <p class="text-red-700">{{ errorMessage }}</p>
        </div>
        <div class="flex gap-2">
          <button 
            v-if="errorMessage.includes('模型')"
            @click="reinitializeModel"
            class="btn-outline text-sm"
          >
            重新加载模型
          </button>
          <button 
            @click="errorMessage = ''"
            class="text-gray-400 hover:text-gray-600"
          >
            ✕
          </button>
        </div>
      </div>
    </div>
    
    <!-- 模型状态提示 -->
    <div v-if="statusMessage" class="status-message bg-blue-50 border border-blue-200 rounded-lg p-4 mt-4">
      <div class="flex items-center gap-2">
        <span class="text-blue-500">ℹ️</span>
        <p class="text-blue-700">{{ statusMessage }}</p>
      </div>
    </div>
  </div>
</template>

<script>
import { pipeline } from '@huggingface/transformers'

export default {
  name: 'BackgroundRemoval',
  data() {
    return {
      selectedImage: null,
      processedImage: null,
      isProcessing: false,
      progress: 0,
      statusMessage: '',
      errorMessage: '',
      isDragOver: false,
      pipeline: null,
      originalFile: null,
      modelLoaded: false,
      retryCount: 0,
      maxRetries: 2,
      currentModelName: '',
      modelLoadingStatus: '未加载',
      selectedModelIndex: 0,
      availableModels: [
        { 
          name: 'briaai/RMBG-1.4', 
          options: { quantized: true },
          displayName: 'RMBG-1.4'
        },
        { 
          name: 'Xenova/modnet', 
          options: { quantized: false },
          displayName: 'MODNet (高精度)'
        },
        { 
          name: 'Xenova/modnet', 
          options: { quantized: true },
          displayName: 'MODNet (量化)'
        }
      ]
    }
  },
  async mounted() {
    await this.initializePipeline()
  },
  methods: {
    /**
     * 初始化AI模型管道
     */
    async initializePipeline() {
      await this.loadModel(this.selectedModelIndex)
    },
    
    /**
     * 加载指定的模型
     * @param {number} modelIndex - 模型索引
     */
    async loadModel(modelIndex) {
      if (modelIndex < 0 || modelIndex >= this.availableModels.length) {
        console.error('无效的模型索引:', modelIndex)
        return
      }
      
      const model = this.availableModels[modelIndex]
      this.modelLoadingStatus = '加载中'
      this.errorMessage = ''
      
      try {
        console.log(`正在加载模型 ${model.name}...`)
        this.currentModelName = model.name
        this.statusMessage = `正在加载AI模型 ${model.displayName}...`
        
        // 清除之前的pipeline
        this.pipeline = null
        this.modelLoaded = false
        
        // 尝试从默认源加载模型
        this.pipeline = await this.loadModelWithFallback(model)
        
        console.log(`模型 ${model.name} 加载成功`)
        this.modelLoaded = true
        this.modelLoadingStatus = '已加载'
        this.statusMessage = ''
        
      } catch (error) {
        console.error(`模型 ${model.name} 加载失败:`, error)
        this.errorMessage = `模型 ${model.displayName} 加载失败，请检查网络连接后重试`
        this.modelLoadingStatus = '加载失败'
        this.currentModelName = ''
        this.statusMessage = ''
        this.pipeline = null
        this.modelLoaded = false
      }
    },
    
    /**
     * 使用回退机制加载模型（支持镜像站点）
     * @param {Object} model - 模型配置
     */
    async loadModelWithFallback(model) {
      // 首先尝试从默认源加载
      try {
        console.log(`尝试从默认源加载模型: ${model.name}`)
        return await pipeline('image-segmentation', model.name, model.options)
      } catch (error) {
        console.warn(`默认源加载失败，尝试使用镜像站点: ${error.message}`)
        
        // 如果默认源失败，尝试使用镜像站点
        try {
          console.log(`正在从镜像站点 hf-mirror.com 加载模型: ${model.name}`)
          this.statusMessage = `正在从镜像站点加载AI模型 ${model.displayName}...`
          
          // 设置镜像站点URL
          const originalEnv = window.HF_HUB_URL
          window.HF_HUB_URL = 'https://hf-mirror.com'
          
          try {
            const pipelineResult = await pipeline('image-segmentation', model.name, model.options)
            console.log(`从镜像站点加载模型成功: ${model.name}`)
            return pipelineResult
          } finally {
            // 恢复原始环境设置
            if (originalEnv) {
              window.HF_HUB_URL = originalEnv
            } else {
              delete window.HF_HUB_URL
            }
          }
        } catch (mirrorError) {
          console.error(`镜像站点加载也失败: ${mirrorError.message}`)
          
          // 如果镜像站点也失败，抛出更详细的错误信息
          throw new Error(`模型加载失败：无法从默认源和镜像站点加载模型。原始错误: ${error.message}，镜像错误: ${mirrorError.message}`)
        }
      }
    },
    
    /**
     * 切换模型
     */
    async switchModel() {
      if (this.isProcessing) {
        this.errorMessage = '正在处理图片，请稍后再切换模型'
        return
      }
      
      console.log(`切换到模型索引: ${this.selectedModelIndex}`)
      await this.loadModel(this.selectedModelIndex)
    },
    
    /**
     * 重新加载当前模型
     */
    async reloadCurrentModel() {
      if (this.isProcessing) {
        this.errorMessage = '正在处理图片，请稍后再重新加载模型'
        return
      }
      
      console.log('重新加载当前模型')
      await this.loadModel(this.selectedModelIndex)
    },
    
    /**
     * 重新初始化模型
     */
    async reinitializeModel() {
      this.modelLoaded = false
      this.pipeline = null
      this.errorMessage = ''
      this.currentModelName = ''
      this.modelLoadingStatus = '未加载'
      await this.initializePipeline()
    },
    
    /**
     * 处理文件选择
     */
    handleFileSelect(event) {
      const file = event.target.files[0]
      if (file) {
        this.loadImage(file)
      }
    },
    
    /**
     * 处理拖拽上传
     */
    handleDrop(event) {
      this.isDragOver = false
      const files = event.dataTransfer.files
      if (files.length > 0) {
        this.loadImage(files[0])
      }
    },
    
    /**
     * 加载图片文件
     */
    loadImage(file) {
      // 验证文件类型
      if (!file.type.startsWith('image/')) {
        this.errorMessage = '请选择有效的图片文件'
        return
      }
      
      // 验证文件大小 (10MB)
      if (file.size > 10 * 1024 * 1024) {
        this.errorMessage = '图片文件不能超过10MB'
        return
      }
      
      this.originalFile = file
      this.errorMessage = ''
      
      const reader = new FileReader()
      reader.onload = (e) => {
        this.selectedImage = e.target.result
        this.processedImage = null
      }
      reader.readAsDataURL(file)
    },
    
    /**
     * 处理图片移除背景
     */
    async processImage() {
      if (!this.selectedImage) {
        this.errorMessage = '请先选择图片'
        return
      }
      
      if (!this.pipeline || !this.modelLoaded) {
        this.errorMessage = `模型尚未加载完成，当前状态: ${this.modelLoadingStatus}，请稍等片刻后重试`
        return
      }
      
      this.isProcessing = true
      this.progress = 0
      this.errorMessage = ''
      
      try {
        this.statusMessage = '正在分析图片...'
        this.progress = 20
        
        // 创建图片元素并转换为Canvas
        const img = new Image()
        img.crossOrigin = 'anonymous'
        
        const canvas = await new Promise((resolve, reject) => {
          img.onload = () => {
            console.log(`图片加载成功: ${img.width}x${img.height}`)
            
            // 创建canvas并绘制图片
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')
            canvas.width = img.width
            canvas.height = img.height
            ctx.drawImage(img, 0, 0)
            
            resolve(canvas)
          }
          img.onerror = (error) => {
            console.error('图片加载失败:', error)
            reject(new Error('图片加载失败'))
          }
          img.src = this.selectedImage
        })
        
        this.statusMessage = `正在使用 ${this.currentModelName} 模型移除背景...`
        this.progress = 50
        
        console.log('开始调用AI模型处理图片...')
        
        // 使用pipeline处理图片 - 传递canvas而不是img元素
        const result = await this.pipeline(canvas)
        
        console.log('AI模型处理完成，结果:', result)
        
        this.statusMessage = '正在生成结果...'
        this.progress = 80
        
        // 处理结果
        if (!result || result.length === 0) {
          throw new Error('模型未返回有效结果')
        }
        
        // 获取mask数据
        const maskData = result[0].mask
        if (!maskData) {
          throw new Error('未获取到有效的遮罩数据')
        }
        
        console.log('开始应用遮罩到原图...')
        const processedImageUrl = await this.applyMask(canvas, maskData)
        this.processedImage = processedImageUrl
        
        this.progress = 100
        this.statusMessage = '处理完成！'
        
        setTimeout(() => {
          this.isProcessing = false
          this.statusMessage = ''
        }, 1000)
        
      } catch (error) {
        console.error('图片处理失败:', error)
        
        // 提供更具体的错误信息
        let errorMsg = '图片处理失败，请重试'
        if (error.message.includes('模型')) {
          errorMsg = '模型处理失败，可能是图片格式不支持或模型加载异常'
        } else if (error.message.includes('网络')) {
          errorMsg = '网络连接问题，请检查网络后重试'
        } else if (error.message.includes('内存')) {
          errorMsg = '图片过大导致内存不足，请尝试较小的图片'
        } else if (error.message.includes('遮罩')) {
          errorMsg = '图像处理失败，可能是遮罩数据格式问题'
        }
        
        this.errorMessage = errorMsg
        this.isProcessing = false
        this.statusMessage = ''
      }
    },
    
    /**
     * 应用遮罩到原图
     * @param {HTMLCanvasElement} originalImage - 原图的canvas元素
     * @param {*} maskData - 遮罩数据
     */
    async applyMask(originalImage, maskData) {
      try {
        const canvas = document.createElement('canvas')
        const ctx = canvas.getContext('2d')
        
        canvas.width = originalImage.width
        canvas.height = originalImage.height
        
        // 绘制原图
        ctx.drawImage(originalImage, 0, 0)
        
        // 获取图像数据
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        const data = imageData.data
        
        // 处理mask数据
        let maskArray
        if (maskData instanceof HTMLCanvasElement) {
          // 如果mask是canvas元素
          const maskCtx = maskData.getContext('2d')
          const maskImageData = maskCtx.getImageData(0, 0, maskData.width, maskData.height)
          maskArray = maskImageData.data
        } else if (maskData instanceof ImageData) {
          // 如果mask是ImageData
          maskArray = maskData.data
        } else if (Array.isArray(maskData) || maskData instanceof Uint8Array) {
          // 如果mask是数组
          maskArray = maskData
        } else if (maskData && typeof maskData === 'object' && maskData.data) {
          // 如果mask是RawImage类型（Transformers.js返回的格式）
          console.log('检测到RawImage格式的mask数据:', maskData)
          maskArray = maskData.data
        } else {
          console.error('未知的mask数据格式:', maskData)
          throw new Error('不支持的mask数据格式')
        }
        
        // 应用遮罩到原图
        for (let i = 0; i < data.length; i += 4) {
          const pixelIndex = i / 4
          let alpha = 255
          
          if (maskArray) {
            if (maskArray.length === data.length) {
              // RGBA格式的mask，使用R通道作为alpha
              alpha = maskArray[i]
            } else if (maskArray.length === data.length / 4) {
              // 灰度格式的mask
              alpha = maskArray[pixelIndex]
            } else {
              // 尝试按比例缩放
              const scaledIndex = Math.floor(pixelIndex * maskArray.length / (data.length / 4))
              alpha = maskArray[scaledIndex] || 0
            }
          }
          
          // 设置透明度
          data[i + 3] = alpha
        }
        
        // 将处理后的数据放回canvas
        ctx.putImageData(imageData, 0, 0)
        
        return canvas.toDataURL('image/png')
      } catch (error) {
        console.error('应用遮罩失败:', error)
        throw new Error('图像处理失败：' + error.message)
      }
    },
    
    /**
     * 下载处理后的图片
     */
    downloadImage() {
      if (!this.processedImage) return
      
      const link = document.createElement('a')
      link.download = `background-removed-${Date.now()}.png`
      link.href = this.processedImage
      link.click()
    },
    
    /**
     * 复制图片到剪贴板
     */
    async copyImageToClipboard() {
      try {
        const response = await fetch(this.processedImage)
        const blob = await response.blob()
        
        await navigator.clipboard.write([
          new ClipboardItem({ 'image/png': blob })
        ])
        
        // 临时显示成功提示
        const originalText = event.target.textContent
        event.target.textContent = '已复制！'
        setTimeout(() => {
          event.target.textContent = originalText
        }, 2000)
        
      } catch (error) {
        console.error('复制失败:', error)
        this.errorMessage = '复制到剪贴板失败'
      }
    },
    
    /**
     * 重置图片选择
     */
    resetImage() {
      this.selectedImage = null
      this.processedImage = null
      this.originalFile = null
      this.errorMessage = ''
      
      // 等待DOM更新后再清空文件输入框
      this.$nextTick(() => {
        if (this.$refs.fileInput) {
          this.$refs.fileInput.value = ''
        }
      })
    },
    
    /**
     * 处理新图片
     */
    processAnotherImage() {
      this.resetImage()
    }
  }
}
</script>

<style scoped>
.background-removal {
  max-width: 1200px;
  margin: 0 auto;
}

.btn-primary {
  @apply bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed;
}

.btn-secondary {
  @apply bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.btn-outline {
  @apply border border-gray-300 hover:border-gray-400 text-gray-700 hover:text-gray-900 px-4 py-2 rounded-lg font-medium transition-colors duration-200;
}

.bg-transparent-pattern {
  background-image: 
    linear-gradient(45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(-45deg, #f0f0f0 25%, transparent 25%), 
    linear-gradient(45deg, transparent 75%, #f0f0f0 75%), 
    linear-gradient(-45deg, transparent 75%, #f0f0f0 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
}

.upload-area {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.image-container {
  min-height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.error-message {
  animation: fadeIn 0.3s ease-in;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
}
</style>