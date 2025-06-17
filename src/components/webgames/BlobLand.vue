<template>
  <div class="blob-land-container">
    <!-- 游戏头部 -->
    <div class="game-header mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-pink-600 to-purple-600 bg-clip-text text-transparent">🧬 果冻星球</h2>
          <p class="text-gray-600 mt-1">创造可爱的果冻生命体，观察它们的互动与演化！</p>
        </div>
        <div class="text-right space-y-2">
          <div class="bg-gradient-to-r from-pink-500 to-purple-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">活跃Blob数</div>
            <div class="text-2xl font-bold">{{ blobs.length }}</div>
          </div>
          <div class="bg-gradient-to-r from-blue-500 to-cyan-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">互动次数</div>
            <div class="text-lg font-bold">{{ interactionCount }}</div>
          </div>
          <div v-if="evolutionEnabled" class="bg-gradient-to-r from-purple-500 to-indigo-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">当前世代</div>
            <div class="text-lg font-bold">第{{ currentGeneration }}代</div>
          </div>
          <div v-if="evolutionEnabled" class="bg-gradient-to-r from-green-500 to-teal-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">突变次数</div>
            <div class="text-lg font-bold">{{ totalMutations }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 模式切换 -->
    <div class="mode-selector mb-6">
      <div class="flex justify-center gap-4">
        <button
          @click="currentMode = 'create'"
          :class="['px-6 py-3 font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200', 
                   currentMode === 'create' ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
        >
          <span class="text-lg mr-2">🧬</span>
          创造模式
        </button>
        <button
          @click="currentMode = 'observe'"
          :class="['px-6 py-3 font-semibold rounded-xl shadow-lg transform hover:scale-105 transition-all duration-200',
                   currentMode === 'observe' ? 'bg-gradient-to-r from-blue-500 to-cyan-600 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300']"
        >
          <span class="text-lg mr-2">🔬</span>
          观察模式
        </button>

      </div>
    </div>

    <!-- 创造模式面板 -->
    <div v-if="currentMode === 'create'" class="creator-panel mb-6">
      <div class="bg-white rounded-2xl p-6 shadow-lg border">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span class="text-2xl mr-2">🎨</span>
          果冻生命体编辑器
        </h3>
        
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <!-- 外观设置 -->
          <div class="appearance-settings">
            <h4 class="font-semibold text-gray-700 mb-3">🌈 外观设置</h4>
            <div class="space-y-4">
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">主色调</label>
                <input 
                  v-model="newBlob.color" 
                  type="color" 
                  class="w-full h-10 rounded-lg border-2 border-gray-300 cursor-pointer"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">透明度: {{ newBlob.opacity }}%</label>
                <input 
                  v-model="newBlob.opacity" 
                  type="range" 
                  min="30" 
                  max="100" 
                  class="w-full"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">大小: {{ newBlob.size }}px</label>
                <input 
                  v-model="newBlob.size" 
                  type="range" 
                  min="20" 
                  max="80" 
                  class="w-full"
                >
              </div>
              <div>
                <label class="block text-sm font-medium text-gray-600 mb-2">弹性: {{ newBlob.elasticity }}%</label>
                <input 
                  v-model="newBlob.elasticity" 
                  type="range" 
                  min="10" 
                  max="100" 
                  class="w-full"
                >
              </div>
            </div>
          </div>

          <!-- 性格设置 -->
          <div class="personality-settings">
            <h4 class="font-semibold text-gray-700 mb-3">🧠 性格类型</h4>
            <div class="space-y-3">
              <div 
                v-for="personality in personalityTypes" 
                :key="personality.type"
                @click="newBlob.personality = personality.type"
                :class="['p-3 rounded-lg border-2 cursor-pointer transition-all duration-200',
                         newBlob.personality === personality.type ? 'border-purple-500 bg-purple-50' : 'border-gray-200 hover:border-gray-300']"
              >
                <div class="flex items-center">
                  <span class="text-xl mr-2">{{ personality.emoji }}</span>
                  <div>
                    <div class="font-medium text-gray-800">{{ personality.name }}</div>
                    <div class="text-xs text-gray-600">{{ personality.description }}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- 预览和创建 -->
          <div class="preview-section">
            <h4 class="font-semibold text-gray-700 mb-3">👀 实时预览</h4>
            <div class="preview-container bg-gray-100 rounded-lg p-6 mb-4 flex items-center justify-center" style="height: 200px;">
              <div 
                class="blob-preview transition-all duration-300 rounded-full flex items-center justify-center text-white font-bold shadow-lg"
                :style="{
                  backgroundColor: newBlob.color,
                  opacity: newBlob.opacity / 100,
                  width: newBlob.size + 'px',
                  height: newBlob.size + 'px',
                  transform: `scale(${1 + (newBlob.elasticity - 50) / 100})`
                }"
              >
                {{ getPersonalityEmoji(newBlob.personality) }}
              </div>
            </div>
            <div class="space-y-3">
              <input 
                v-model="newBlob.name" 
                type="text" 
                placeholder="给你的Blob起个名字..." 
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
              <button
                @click="createBlob"
                class="w-full px-4 py-3 bg-gradient-to-r from-purple-500 to-pink-600 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200"
              >
                <span class="text-lg mr-2">🚀</span>
                放入星球
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 观察模式面板 -->
    <div v-if="currentMode === 'observe'" class="observe-panel mb-6">
      <div class="bg-gradient-to-r from-blue-100 to-cyan-100 rounded-2xl p-6 border">
        <h3 class="text-xl font-bold text-gray-800 mb-4 flex items-center">
          <span class="text-2xl mr-2">🔬</span>
          科学实验室
        </h3>
        <p class="text-gray-700 mb-4">选择预设实验场景，观察不同性格Blob的互动行为</p>
        
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div 
            v-for="scenario in observeScenarios" 
            :key="scenario.id"
            @click="loadScenario(scenario)"
            class="p-4 bg-white rounded-lg border-2 border-gray-200 hover:border-blue-500 cursor-pointer transition-all duration-200 hover:shadow-md"
          >
            <div class="text-2xl mb-2">{{ scenario.emoji }}</div>
            <div class="font-semibold text-gray-800">{{ scenario.name }}</div>
            <div class="text-sm text-gray-600 mt-1">{{ scenario.description }}</div>
            <div class="text-xs text-blue-600 mt-2">{{ scenario.blobCount }} 个Blob</div>
          </div>
        </div>
        
        <div class="flex gap-2">
          <button
            @click="addRandomBlob"
            class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
          >
            🎲 随机添加
          </button>
          <button
            @click="clearAllBlobs"
            class="px-4 py-2 bg-gray-500 text-white rounded-lg font-medium hover:bg-gray-600 transition-all duration-200"
          >
            🗑️ 清空实验
          </button>
        </div>
      </div>
    </div>



    <!-- 沙盒观察区 -->
    <div class="sandbox-area">
      <div class="bg-white rounded-2xl p-6 shadow-lg border">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-xl font-bold text-gray-800 flex items-center">
            <span class="text-2xl mr-2">🌍</span>
            果冻星球沙盒
          </h3>
          <div class="flex gap-2">
            <button
              @click="togglePhysics"
              :class="['px-4 py-2 rounded-lg font-medium transition-all duration-200',
                       physicsEnabled ? 'bg-green-500 text-white' : 'bg-gray-200 text-gray-700']"
            >
              {{ physicsEnabled ? '🌊 物理开' : '❄️ 物理关' }}
            </button>
            <button
              @click="toggleEvolution"
              :class="['px-4 py-2 rounded-lg font-medium transition-all duration-200',
                       evolutionEnabled ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700']"
            >
              {{ evolutionEnabled ? '🧬 进化开' : '🧬 进化关' }}
            </button>
            <button
              @click="clearAllBlobs"
              class="px-4 py-2 bg-red-500 text-white rounded-lg font-medium hover:bg-red-600 transition-all duration-200"
            >
              🗑️ 清空
            </button>
            <button
              @click="exportSnapshot"
              class="px-4 py-2 bg-blue-500 text-white rounded-lg font-medium hover:bg-blue-600 transition-all duration-200"
            >
              📸 导出
            </button>
          </div>
        </div>
        
        <!-- 环境控制面板 -->
        <div class="environment-controls mb-4 p-4 bg-gray-50 rounded-lg">
          <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
            <!-- 背景主题选择 -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">🎨 背景主题</label>
              <select 
                v-model="environmentSettings.background" 
                @change="updateBackground"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="day">🌅 白天</option>
                <option value="night">🌙 夜晚</option>
                <option value="nature">🌿 自然</option>
                <option value="pixel">🎮 像素风</option>
              </select>
            </div>
            
            <!-- 重力调节 -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">⚡ 重力: {{ environmentSettings.gravity }}%</label>
              <input 
                v-model="environmentSettings.gravity" 
                @input="updateGravity"
                type="range" 
                min="0" 
                max="200" 
                class="w-full"
              >
            </div>
            
            <!-- 天气效果 -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">🌤️ 天气效果</label>
              <select 
                v-model="environmentSettings.weather" 
                @change="updateWeather"
                class="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="clear">☀️ 晴朗</option>
                <option value="rain">🌧️ 下雨</option>
                <option value="snow">❄️ 下雪</option>
                <option value="wind">💨 大风</option>
                <option value="storm">⛈️ 暴风雨</option>
              </select>
            </div>
            
            <!-- 轨迹可视化 -->
            <div>
              <label class="block text-sm font-medium text-gray-600 mb-2">📍 轨迹显示</label>
              <button
                @click="toggleTrajectory"
                :class="['w-full px-3 py-2 rounded-lg font-medium transition-all duration-200',
                         showTrajectory ? 'bg-purple-500 text-white' : 'bg-gray-200 text-gray-700']"
              >
                {{ showTrajectory ? '🔍 轨迹开' : '👁️ 轨迹关' }}
              </button>
            </div>
          </div>
        </div>
        
        <!-- 画布容器 -->
        <div 
          class="canvas-container relative rounded-xl overflow-hidden transition-all duration-500"
          :class="getBackgroundClass()"
          style="height: 500px;"
          @drop="handleDrop"
          @dragover="handleDragOver"
        >
          <!-- 天气效果层 -->
          <div class="absolute inset-0 pointer-events-none z-5">
            <div v-if="environmentSettings.weather === 'rain'" class="rain-effect"></div>
            <div v-if="environmentSettings.weather === 'snow'" class="snow-effect"></div>
            <div v-if="environmentSettings.weather === 'storm'" class="storm-effect"></div>
          </div>
          
          <canvas
            ref="sandboxCanvas"
            :width="canvasWidth"
            :height="canvasHeight"
            class="absolute inset-0 cursor-pointer z-10"
            @click="handleCanvasClick"
            @mousemove="handleMouseMove"
            @mousedown="handleMouseDown"
            @mouseup="handleMouseUp"
          ></canvas>
          
          <!-- 增强的Blob信息悬浮提示 -->
          <div
            v-if="hoveredBlob"
            class="absolute bg-black bg-opacity-90 text-white px-4 py-3 rounded-lg text-sm pointer-events-none z-20 shadow-lg border border-gray-600"
            :style="getTooltipPosition()"
          >
            <div class="font-bold text-lg mb-1">{{ hoveredBlob.name || '未命名Blob' }}</div>
            <div class="text-xs opacity-90 mb-1">
              <span class="inline-block w-2 h-2 rounded-full mr-2" :style="{ backgroundColor: hoveredBlob.color }"></span>
              性格: {{ getPersonalityName(hoveredBlob.personality) }} {{ getPersonalityEmoji(hoveredBlob.personality) }}
            </div>
            <div class="text-xs opacity-90 mb-1">状态: {{ hoveredBlob.state }}</div>
            <div class="text-xs opacity-90 mb-1">能量: {{ hoveredBlob.energy.toFixed(1) }}%</div>
            <div class="text-xs opacity-90 mb-1">位置: ({{ Math.round(hoveredBlob.x) }}, {{ Math.round(hoveredBlob.y) }})</div>
            <div class="text-xs opacity-90 mb-1">速度: {{ Math.round(Math.sqrt(hoveredBlob.vx * hoveredBlob.vx + hoveredBlob.vy * hoveredBlob.vy) * 10) / 10 }}</div>
            <div v-if="evolutionEnabled && hoveredBlob.genetics" class="text-xs opacity-90 mt-2 pt-2 border-t border-gray-600">
              <div class="text-yellow-300 font-semibold mb-1">🧬 基因信息</div>
              <div>世代: 第{{ hoveredBlob.generation }}代</div>
              <div>年龄: {{ Math.round(hoveredBlob.age / 1000) }}秒</div>
              <div>繁殖状态: {{ getReproductionStatus(hoveredBlob) }}</div>
              <div v-if="hoveredBlob.parentIds && hoveredBlob.parentIds.length > 0">父母: {{ hoveredBlob.parentIds.length }}个</div>
              <div v-if="hoveredBlob.childrenIds && hoveredBlob.childrenIds.length > 0">子女: {{ hoveredBlob.childrenIds.length }}个</div>
            </div>
          </div>
          
          <!-- 拖拽指示器 -->
          <div 
            v-if="isDragging"
            class="absolute pointer-events-none z-15 transition-all duration-200"
            :style="{ left: dragPosition.x - 20 + 'px', top: dragPosition.y - 20 + 'px' }"
          >
            <div 
              class="w-10 h-10 rounded-full border-2 border-dashed border-white bg-black bg-opacity-50 flex items-center justify-center"
            >
              🎯
            </div>
          </div>
        </div>
        
        <!-- 活跃Blob列表 -->
        <div v-if="blobs.length > 0" class="mt-4">
          <h4 class="font-semibold text-gray-700 mb-2">🧬 活跃的Blob ({{ blobs.length }})</h4>
          <div class="flex flex-wrap gap-2">
            <div 
              v-for="blob in blobs" 
              :key="blob.id"
              class="flex items-center bg-gray-100 rounded-lg px-3 py-2 text-sm"
            >
              <div 
                class="w-4 h-4 rounded-full mr-2"
                :style="{ backgroundColor: blob.color, opacity: blob.opacity / 100 }"
              ></div>
              <span class="font-medium">{{ blob.name || '未命名' }}</span>
              <span class="ml-2 text-xs text-gray-600">{{ getPersonalityEmoji(blob.personality) }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'BlobLand',
  data() {
    return {
      // 当前模式
      currentMode: 'create', // 'create', 'observe'
      
      // 画布设置
      canvasWidth: 800,
      canvasHeight: 500,
      
      // 新Blob配置
      newBlob: {
        name: '',
        color: '#ff6b9d',
        opacity: 80,
        size: 40,
        elasticity: 70,
        personality: 'social'
      },
      
      // 性格类型配置
      personalityTypes: [
        {
          type: 'social',
          name: '社交型',
          emoji: '😊',
          description: '喜欢靠近其他Blob，活跃互动'
        },
        {
          type: 'aggressive',
          name: '攻击型', 
          emoji: '😤',
          description: '会推挤其他Blob，占据领地'
        },
        {
          type: 'shy',
          name: '慢热型',
          emoji: '😳',
          description: '倾向于躲避，需要时间适应'
        },
        {
          type: 'leader',
          name: '领袖型',
          emoji: '👑',
          description: '吸引其他Blob跟随，具有魅力'
        },
        {
          type: 'explorer',
          name: '探索型',
          emoji: '🔍',
          description: '喜欢到处游荡，寻找新区域'
        },
        {
          type: 'lazy',
          name: '懒散型',
          emoji: '😴',
          description: '移动缓慢，喜欢静止不动'
        }
      ],
      
      // Blob数组
      blobs: [],
      
      // 物理引擎状态
      physicsEnabled: true,
      
      // 鼠标交互
      mouseX: 0,
      mouseY: 0,
      hoveredBlob: null,
      
      // 拖拽功能
      isDragging: false,
      draggedBlob: null,
      dragPosition: { x: 0, y: 0 },
      
      // 环境设置
      environmentSettings: {
        background: 'day',
        gravity: 100,
        weather: 'clear'
      },
      
      // 轨迹可视化
      showTrajectory: false,
      trajectoryPoints: new Map(), // 存储每个Blob的轨迹点
      trajectoryDirty: true, // 轨迹缓存标志
      
      // 统计数据
      interactionCount: 0,
      lastInteractionTime: new Map(), // 用于节流互动计数
      
      // 性能监控变量
      frameCount: 0,
      lastFpsTime: 0,
      fpsCounter: 0,
      
      // 进化系统
      evolutionEnabled: false,
      currentGeneration: 1,
      totalMutations: 0,
      reproductionCooldown: new Map(), // 繁殖冷却时间
      evolutionTree: {
        nodes: new Map(),
        edges: new Map(),
        generations: new Map(),
        statistics: {
          totalGenerations: 1,
          totalMutations: 0,
          dominantTraits: {},
          extinctLineages: []
        }
      },
      showEvolution: false,
      
      // 观察模式场景
      observeScenarios: [
        {
          id: 'harmony',
          name: '生态平衡',
          emoji: '🌿',
          description: '观察不同性格Blob的自然平衡状态',
          blobCount: 6,
          blobs: [
            { personality: 'social', color: '#ff6b9d', name: '社交小粉' },
            { personality: 'leader', color: '#ffd43b', name: '领袖小黄' },
            { personality: 'shy', color: '#74c0fc', name: '慢热小蓝' },
            { personality: 'explorer', color: '#51cf66', name: '探索小绿' },
            { personality: 'aggressive', color: '#ff8787', name: '攻击小红' },
            { personality: 'lazy', color: '#d0bfff', name: '懒散小紫' }
          ]
        },
        {
          id: 'conflict',
          name: '性格冲突',
          emoji: '⚡',
          description: '观察对立性格间的互动与竞争',
          blobCount: 4,
          blobs: [
            { personality: 'aggressive', color: '#ff4757', name: '暴躁红' },
            { personality: 'aggressive', color: '#ff3838', name: '愤怒红' },
            { personality: 'shy', color: '#70a1ff', name: '胆小蓝' },
            { personality: 'shy', color: '#5352ed', name: '害羞蓝' }
          ]
        },
        {
          id: 'social',
          name: '群体行为',
          emoji: '👥',
          description: '观察大量相似Blob的集体行为模式',
          blobCount: 8,
          blobs: [
            { personality: 'social', color: '#ff6b9d', name: '社交1号' },
            { personality: 'social', color: '#ff6b9d', name: '社交2号' },
            { personality: 'social', color: '#ff6b9d', name: '社交3号' },
            { personality: 'social', color: '#ff6b9d', name: '社交4号' },
            { personality: 'leader', color: '#ffd43b', name: '领袖' },
            { personality: 'explorer', color: '#51cf66', name: '探索者1' },
            { personality: 'explorer', color: '#51cf66', name: '探索者2' },
            { personality: 'lazy', color: '#d0bfff', name: '观察者' }
          ]
        }
      ],
      

      
      // 动画循环
      animationId: null,
      lastTime: 0
    }
  },
  
  mounted() {
    this.initCanvas()
    this.startAnimation()
    this.setupEventListeners()
  },
  
  beforeUnmount() {
    this.stopAnimation()
    this.removeEventListeners()
  },
  
  methods: {
    /**
     * 初始化画布
     */
    initCanvas() {
      const canvas = this.$refs.sandboxCanvas
      if (!canvas) return
      
      this.ctx = canvas.getContext('2d')
      
      // 设置画布尺寸
      const container = canvas.parentElement
      this.canvasWidth = container.clientWidth
      this.canvasHeight = container.clientHeight
      
      canvas.width = this.canvasWidth
      canvas.height = this.canvasHeight
      
      // 画布初始化完成
    },
    
    /**
     * 创建新的Blob
     */
    createBlob(genetics = null, parentIds = null) {
      if (!this.newBlob.name.trim()) {
        this.newBlob.name = `Blob${this.blobs.length + 1}`
      }
      
      // 生成或使用传入的基因
      let blobGenetics = genetics || this.generateRandomGenetics()
      
      // 安全检查：确保基因对象完整
      if (this.evolutionEnabled && (!blobGenetics || !blobGenetics.dominant)) {
        blobGenetics = this.generateRandomGenetics()
      }
      
      const blob = {
        id: Date.now() + Math.random(),
        name: this.newBlob.name,
        
        // 基因决定的属性（添加安全检查）
        color: this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? this.getColorFromHue(blobGenetics.dominant.colorHue) : this.newBlob.color,
        opacity: this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.opacity : this.newBlob.opacity,
        size: this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.size : this.newBlob.size,
        elasticity: this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.elasticity : this.newBlob.elasticity,
        personality: this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.personality : this.newBlob.personality,
        
        // 物理属性
        x: Math.random() * (this.canvasWidth - (this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.size : this.newBlob.size)) + (this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.size : this.newBlob.size) / 2,
        y: Math.random() * (this.canvasHeight - (this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.size : this.newBlob.size)) + (this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.size : this.newBlob.size) / 2,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        
        // AI属性
        state: 'idle', // 'idle', 'moving', 'following', 'avoiding'
        energy: this.evolutionEnabled && blobGenetics && blobGenetics.dominant ? blobGenetics.dominant.energy : 100,
        targetX: null,
        targetY: null,
        lastInteraction: 0,
        
        // 动画属性
        scale: 1,
        rotation: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        
        // 进化系统属性
        genetics: blobGenetics,
        age: 0,
        reproductionReady: undefined,
        lastReproduction: 0,
        reproductionInterval: 60000 + Math.random() * 60000, // 随机繁殖间隔（60-120秒）
        generation: parentIds ? Math.max(...parentIds.map(id => this.getGenerationById(id))) + 1 : 1,
        parentIds: parentIds || [],
        childrenIds: []
      }
      
      // 添加到进化树
      if (this.evolutionEnabled) {
        this.addToEvolutionTree(blob)
      }
      
      this.blobs.push(blob)
      // 新Blob创建完成
      
      // 重置表单（仅在非繁殖模式下重置）
      if (!parentIds) {
        this.newBlob.name = ''
      }
      

      
      return blob
    },
    
    /**
     * 获取性格表情符号
     */
    getPersonalityEmoji(type) {
      const personality = this.personalityTypes.find(p => p.type === type)
      return personality ? personality.emoji : '😊'
    },
    
    /**
     * 获取性格名称
     */
    getPersonalityName(type) {
      const personality = this.personalityTypes.find(p => p.type === type)
      return personality ? personality.name : '未知'
    },

    /**
     * 获取繁殖状态显示
     */
    getReproductionStatus(blob) {
      if (!this.evolutionEnabled) return '🚫 进化已关闭'
      
      const now = Date.now()
      const age = blob.age
      const energy = blob.energy
      const reproductionInterval = blob.reproductionInterval || 90000
      const timeSinceLastReproduction = now - blob.lastReproduction
      
      // 年龄不足
      if (age <= 15000) {
        const remainingTime = Math.ceil((15000 - age) / 1000)
        return `🐣 幼体 (${remainingTime}秒后成熟)`
      }
      
      // 检查是否为不可繁殖的成熟个体
      if (!blob.reproductionReady) {
        return '🚫 不可繁殖 (成熟个体)'
      }
      
      // 能量不足
      if (energy <= 90) {
        return `⚡ 能量不足 (${energy.toFixed(1)}/90)`
      }
      
      // 冷却期中
      if (timeSinceLastReproduction < reproductionInterval) {
        const remainingCooldown = Math.ceil((reproductionInterval - timeSinceLastReproduction) / 1000)
        return `⏳ 冷却中 (${remainingCooldown}秒)`
      }
      
      // 计算繁殖成功率
      const baseSuccessRate = 0.7
      const energyBonus = Math.min(0.2, (energy - 90) / 100)
      const ageBonus = Math.min(0.1, (age - 15000) / 100000)
      const finalSuccessRate = Math.max(0.3, Math.min(0.95, baseSuccessRate + energyBonus + ageBonus))
      const successPercentage = Math.round(finalSuccessRate * 100)
      
      // 寻找附近的兼容伙伴
      const nearbyPartners = this.blobs.filter(otherBlob => {
        if (otherBlob.id === blob.id) return false
        if (!otherBlob.reproductionReady) return false
        if (now - otherBlob.lastReproduction < (otherBlob.reproductionInterval || 90000)) return false
        
        const distance = Math.sqrt((blob.x - otherBlob.x) ** 2 + (blob.y - otherBlob.y) ** 2)
        if (distance >= 60) return false
        
        return this.areCompatible(blob, otherBlob)
      })
      
      if (nearbyPartners.length > 0) {
        return `💕 可繁殖 (成功率${successPercentage}%, ${nearbyPartners.length}个伙伴)`
      } else {
        return `✅ 就绪 (成功率${successPercentage}%, 等待伙伴)`
      }
    },

    /**
     * 从颜色值提取色调
     */
    getHueFromColor(color) {
      // 简单的颜色到色调映射
      const colorMap = {
        '#ff6b9d': 330, // 粉红
        '#74c0fc': 210, // 蓝色
        '#51cf66': 120, // 绿色
        '#ffd43b': 50,  // 黄色
        '#ff8787': 0,   // 红色
        '#d0bfff': 270  // 紫色
      }
      return colorMap[color] || Math.random() * 360
    },
    

    
    /**
     * 获取背景样式类
     */
    getBackgroundClass() {
      const backgrounds = {
        day: 'bg-gradient-to-br from-blue-100 via-white to-yellow-100',
        night: 'bg-gradient-to-br from-indigo-900 via-purple-900 to-black',
        nature: 'bg-gradient-to-br from-green-200 via-emerald-100 to-lime-200',
        pixel: 'bg-gray-800 pixel-background'
      }
      return backgrounds[this.environmentSettings.background] || backgrounds.day
    },
    
    /**
     * 更新背景主题
     */
    updateBackground() {
      // 背景切换动画会通过CSS类自动处理
    },
    
    /**
     * 更新重力设置
     */
    updateGravity() {
      // 重力会在物理更新中应用
    },
    
    /**
     * 更新天气效果
     */
    updateWeather() {
      // 天气效果已更新
      // 天气效果会影响Blob的行为和视觉效果
    },
    
    /**
     * 切换轨迹可视化
     */
    toggleTrajectory() {
      this.showTrajectory = !this.showTrajectory
      // 轨迹可视化状态已更新
      
      if (!this.showTrajectory) {
        // 清空轨迹数据
        this.trajectoryPoints.clear()
      }
    },
    
    /**
     * 处理鼠标按下事件（拖拽开始）
     */
    handleMouseDown(event) {
      const rect = this.$refs.sandboxCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // 查找被点击的Blob
      const clickedBlob = this.blobs.find(blob => {
        const distance = Math.sqrt((x - blob.x) ** 2 + (y - blob.y) ** 2)
        return distance <= blob.size / 2
      })
      
      if (clickedBlob) {
        this.isDragging = true
        this.draggedBlob = clickedBlob
        this.dragPosition = { x, y }
        // 开始拖拽Blob
      }
    },
    
    /**
     * 处理鼠标释放事件（拖拽结束）
     */
    handleMouseUp(event) {
      if (this.isDragging && this.draggedBlob) {
        const rect = this.$refs.sandboxCanvas.getBoundingClientRect()
        const x = event.clientX - rect.left
        const y = event.clientY - rect.top
        
        // 更新Blob位置
        this.draggedBlob.x = x
        this.draggedBlob.y = y
        
        // 重置速度
        this.draggedBlob.vx = 0
        this.draggedBlob.vy = 0
        
        // 拖拽结束
      }
      
      this.isDragging = false
      this.draggedBlob = null
    },
    
    /**
     * 处理拖放事件
     */
    handleDrop(event) {
      event.preventDefault()
      // 检测到拖放事件
    },
    
    /**
     * 处理拖拽悬停事件
     */
    handleDragOver(event) {
      event.preventDefault()
      if (this.isDragging) {
        const rect = event.currentTarget.getBoundingClientRect()
        this.dragPosition.x = event.clientX - rect.left
        this.dragPosition.y = event.clientY - rect.top
      }
    },
    
    /**
     * 加载观察模式场景
     */
    loadScenario(scenario) {
      // 加载实验场景
      
      // 清空现有Blob
      this.blobs = []
      
      // 添加场景中的Blob
      scenario.blobs.forEach((blobConfig, index) => {
        setTimeout(() => {
          this.addScenarioBlob(blobConfig)
        }, index * 200) // 延迟添加，创造动画效果
      })
    },
    
    /**
     * 添加场景专用Blob
     */
    addScenarioBlob(config) {
      // 为场景Blob生成基础genetics属性
      const genetics = this.evolutionEnabled ? this.generateRandomGenetics() : {
        dominant: {
          personality: config.personality,
          colorHue: this.getHueFromColor(config.color),
          opacity: 80,
          size: 30 + Math.random() * 20,
          elasticity: 50 + Math.random() * 30,
          energy: 100
        }
      }
      
      const blob = {
        id: Date.now() + Math.random(),
        name: config.name,
        color: config.color,
        opacity: 80,
        size: 30 + Math.random() * 20, // 随机大小
        elasticity: 50 + Math.random() * 30,
        personality: config.personality,
        x: Math.random() * (this.canvasWidth - 60) + 30,
        y: Math.random() * (this.canvasHeight - 60) + 30,
        vx: (Math.random() - 0.5) * 2,
        vy: (Math.random() - 0.5) * 2,
        energy: 100,
        state: 'exploring',
        lastInteraction: 0,
        scale: 1,
        rotation: 0,
        pulsePhase: Math.random() * Math.PI * 2,
        
        // 进化系统属性
        genetics: genetics,
        age: 0,
        reproductionReady: undefined,
        lastReproduction: 0,
        reproductionInterval: 60000 + Math.random() * 60000,
        generation: 1,
        parentIds: [],
        childrenIds: []
      }
      
      this.blobs.push(blob)
      // 添加场景Blob
    },
    
    /**
     * 添加随机Blob（观察模式）
     */
    addRandomBlob() {
      const randomPersonality = this.personalityTypes[Math.floor(Math.random() * this.personalityTypes.length)]
      const randomColors = ['#ff6b9d', '#74c0fc', '#51cf66', '#ffd43b', '#ff8787', '#d0bfff']
      const randomColor = randomColors[Math.floor(Math.random() * randomColors.length)]
      
      const config = {
        name: `随机${randomPersonality.name}`,
        color: randomColor,
        personality: randomPersonality.type
      }
      
      this.addScenarioBlob(config)
    },
    

     
     /**
     * 开始动画循环（优化版本）
     */
    startAnimation() {
      this.frameCount = 0
      this.lastFpsTime = performance.now()
      this.fpsCounter = 0
      
      // 目标帧率限制（60fps -> 30fps以减少CPU负载）
      const targetFPS = 30
      const frameInterval = 1000 / targetFPS
      let lastFrameTime = 0
      
      const animate = (currentTime) => {
        // 帧率限制
        if (currentTime - lastFrameTime < frameInterval) {
          this.animationId = requestAnimationFrame(animate)
          return
        }
        
        const deltaTime = currentTime - this.lastTime
        this.lastTime = currentTime
        lastFrameTime = currentTime
        this.frameCount++
        
        // 性能监控 - 每秒更新一次FPS计数
        this.fpsCounter++
        if (currentTime - this.lastFpsTime >= 1000) {
          // 可以在这里添加性能监控逻辑
          this.fpsCounter = 0
          this.lastFpsTime = currentTime
        }
        
        // 只有在物理引擎开启时才更新
        if (this.physicsEnabled) {
          this.updateBlobs(deltaTime)
        }
        
        this.renderCanvas()
        
        this.animationId = requestAnimationFrame(animate)
      }
      
      this.animationId = requestAnimationFrame(animate)
    },
    
    /**
     * 停止动画循环
     */
    stopAnimation() {
      if (this.animationId) {
        cancelAnimationFrame(this.animationId)
        this.animationId = null
      }
    },
    
    /**
     * 更新Blob状态
     */
    updateBlobs(deltaTime) {
      if (!this.physicsEnabled) return
      
      this.blobs.forEach(blob => {
        // 每4帧更新一次AI行为（进一步降低CPU使用）
        if (this.frameCount % 4 === 0) {
          this.updateBlobAI(blob, deltaTime)
        }
        
        // 每帧更新物理位置
        this.updateBlobPhysics(blob, deltaTime)
        
        // 每2帧更新动画属性（优化性能）
        if (this.frameCount % 2 === 0) {
          this.updateBlobAnimation(blob, deltaTime)
        }
        
        // 每3帧记录一次轨迹（减少内存使用）
        if (this.frameCount % 3 === 0 && this.showTrajectory) {
          this.recordTrajectoryPoint(blob)
        }
        
        // 进化系统：更新年龄
        if (this.evolutionEnabled && blob.genetics) {
          blob.age += deltaTime
        }
        
        // 每帧检查边界碰撞
        this.checkBoundaryCollision(blob)
      })
      
      // 每2帧检查Blob间碰撞（优化性能）
      if (this.frameCount % 2 === 0) {
        this.checkBlobCollisions()
      }
      
      // 进化系统：每60帧检查一次繁殖条件（进一步降低CPU使用）
      if (this.evolutionEnabled && this.frameCount % 60 === 0) {
        this.checkReproduction()
      }
    },
    
    /**
     * 更新Blob AI行为
     */
    updateBlobAI(blob, deltaTime) {
      // 确保Blob有基本的活跃度
      if (blob.energy > 10) {
        // 根据性格类型决定行为
        switch (blob.personality) {
          case 'social':
            this.updateSocialBehavior(blob)
            break
          case 'aggressive':
            this.updateAggressiveBehavior(blob)
            break
          case 'shy':
            this.updateShyBehavior(blob)
            break
          case 'leader':
            this.updateLeaderBehavior(blob)
            break
          case 'explorer':
            this.updateExplorerBehavior(blob)
            break
          case 'lazy':
            this.updateLazyBehavior(blob)
            break
          default:
            // 默认行为：轻微随机移动
            this.randomWander(blob)
            break
        }
      } else {
        // 能量低时的缓慢移动
        this.slowWander(blob)
      }
      
      // 能量衰减（减慢衰减速度）
      blob.energy = Math.max(0, blob.energy - 0.05)
      
      // 状态转换
      if (blob.energy < 20) {
        blob.state = 'idle'
      }
      
      // 定期恢复一些能量，保持活跃
      if (Math.random() < 0.01) {
        blob.energy = Math.min(100, blob.energy + 5)
      }
    },
    
    /**
     * 社交型行为（减少聚集性）
     */
    updateSocialBehavior(blob) {
      const nearbyBlobs = this.findNearbyBlobs(blob, 80)
      
      // 只有30%的概率跟随其他Blob，增加独立性
      if (nearbyBlobs.length > 0 && Math.random() < 0.3) {
        const target = nearbyBlobs[Math.floor(Math.random() * nearbyBlobs.length)]
        this.moveTowards(blob, target.x, target.y, 0.3)
        blob.state = 'following'
      } else if (nearbyBlobs.length > 3) {
        // 如果周围Blob太多，主动分散
        const target = nearbyBlobs[0]
        this.moveAway(blob, target.x, target.y, 0.4)
        blob.state = 'dispersing'
      } else {
        this.randomWander(blob)
        blob.state = 'moving'
      }
    },
    
    /**
     * 攻击型行为（减少聚集）
     */
    updateAggressiveBehavior(blob) {
      const nearbyBlobs = this.findNearbyBlobs(blob, 60)
      
      // 攻击型更倾向于独立行动
      if (nearbyBlobs.length > 0 && Math.random() < 0.4) {
        const target = nearbyBlobs[0]
        this.moveTowards(blob, target.x, target.y, 0.8)
        blob.state = 'attacking'
      } else if (nearbyBlobs.length > 2) {
        // 避免过度聚集
        const target = nearbyBlobs[0]
        this.moveAway(blob, target.x, target.y, 0.6)
        blob.state = 'territorial'
      } else {
        this.randomWander(blob)
        blob.state = 'patrolling'
      }
    },
    
    /**
     * 慢热型行为
     */
    updateShyBehavior(blob) {
      const nearbyBlobs = this.findNearbyBlobs(blob, 120)
      if (nearbyBlobs.length > 0) {
        const target = nearbyBlobs[0]
        this.moveAway(blob, target.x, target.y, 0.8)
        blob.state = 'avoiding'
      } else {
        this.slowWander(blob)
        blob.state = 'idle'
      }
    },
    
    /**
     * 领袖型行为
     */
    updateLeaderBehavior(blob) {
      // 领袖型会吸引其他Blob
      this.randomWander(blob)
      blob.state = 'leading'
      blob.scale = 1.1 // 稍微大一点
    },
    
    /**
     * 探索型行为
     */
    updateExplorerBehavior(blob) {
      if (!blob.targetX || Math.abs(blob.x - blob.targetX) < 20) {
        blob.targetX = Math.random() * this.canvasWidth
        blob.targetY = Math.random() * this.canvasHeight
      }
      this.moveTowards(blob, blob.targetX, blob.targetY, 0.7)
      blob.state = 'exploring'
    },
    
    /**
     * 懒散型行为
     */
    updateLazyBehavior(blob) {
      // 很少移动
      if (Math.random() < 0.01) {
        this.slowWander(blob)
      }
      blob.state = 'resting'
      blob.vx *= 0.95
      blob.vy *= 0.95
    },
    
    /**
     * 寻找附近的Blob
     */
    findNearbyBlobs(blob, radius) {
      return this.blobs.filter(other => {
        if (other.id === blob.id) return false
        const dx = other.x - blob.x
        const dy = other.y - blob.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < radius
      }).sort((a, b) => {
        const distA = Math.sqrt((a.x - blob.x) ** 2 + (a.y - blob.y) ** 2)
        const distB = Math.sqrt((b.x - blob.x) ** 2 + (b.y - blob.y) ** 2)
        return distA - distB
      })
    },
    
    /**
     * 向目标移动
     */
    moveTowards(blob, targetX, targetY, speed) {
      const dx = targetX - blob.x
      const dy = targetY - blob.y
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 0) {
        blob.vx += (dx / distance) * speed * 0.1
        blob.vy += (dy / distance) * speed * 0.1
      }
    },
    
    /**
     * 远离目标
     */
    moveAway(blob, targetX, targetY, speed) {
      const dx = blob.x - targetX
      const dy = blob.y - targetY
      const distance = Math.sqrt(dx * dx + dy * dy)
      
      if (distance > 0) {
        blob.vx += (dx / distance) * speed * 0.1
        blob.vy += (dy / distance) * speed * 0.1
      }
    },
    
    /**
     * 随机游荡（增加多样性）
     */
    randomWander(blob) {
      if (Math.random() < 0.05) {
        // 增加随机性和方向变化
        const angle = Math.random() * Math.PI * 2
        const force = 0.3 + Math.random() * 0.7
        blob.vx += Math.cos(angle) * force
        blob.vy += Math.sin(angle) * force
      }
      
      // 偶尔完全改变方向
      if (Math.random() < 0.01) {
        blob.vx *= -0.5
        blob.vy *= -0.5
      }
    },
    
    /**
     * 缓慢游荡
     */
    slowWander(blob) {
      if (Math.random() < 0.005) {
        blob.vx += (Math.random() - 0.5) * 0.2
        blob.vy += (Math.random() - 0.5) * 0.2
      }
    },
    
    /**
     * 更新物理位置
     */
    updateBlobPhysics(blob, deltaTime) {
      // 应用环境重力设置（只有当重力大于0时才应用）
      const gravityMultiplier = this.environmentSettings.gravity / 100
      if (gravityMultiplier > 0) {
        blob.vy += 0.3 * gravityMultiplier
      }
      
      // 天气效果对物理的影响
      this.applyWeatherEffects(blob)
      
      // 根据性格调整速度限制（添加安全检查）
      let maxSpeed = 3
      const personality = blob.genetics?.dominant?.personality || blob.personality
      switch(personality) {
        case 'aggressive': maxSpeed = 5; break
        case 'explorer': maxSpeed = 4.5; break
        case 'social': maxSpeed = 3.5; break
        case 'shy': maxSpeed = 2; break
        case 'lazy': maxSpeed = 1.5; break
        default: maxSpeed = 3
      }
      
      const speed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy)
      if (speed > maxSpeed) {
        blob.vx = (blob.vx / speed) * maxSpeed
        blob.vy = (blob.vy / speed) * maxSpeed
      }
      
      // 更新位置
      blob.x += blob.vx
      blob.y += blob.vy
      
      // 立即进行边界检查，防止Blob移动到边界外
      const radius = blob.size / 2
      blob.x = Math.max(radius, Math.min(this.canvasWidth - radius, blob.x))
      blob.y = Math.max(radius, Math.min(this.canvasHeight - radius, blob.y))
      
      // 记录轨迹点
      if (this.showTrajectory) {
        this.recordTrajectoryPoint(blob)
      }
      
      // 根据性格调整摩擦力（添加安全检查）
      let friction = 0.995
      switch(personality) {
        case 'aggressive': friction = 0.98; break
        case 'explorer': friction = 0.99; break
        case 'social': friction = 0.992; break
        case 'shy': friction = 0.985; break
        case 'lazy': friction = 0.97; break
        default: friction = 0.995
      }
      
      blob.vx *= friction
      blob.vy *= friction
      
      // 最终速度安全检查，防止异常大的速度值
      const finalSpeed = Math.sqrt(blob.vx * blob.vx + blob.vy * blob.vy)
      if (finalSpeed > 10) {
        // Blob速度异常大，进行限制
        blob.vx = (blob.vx / finalSpeed) * 10
        blob.vy = (blob.vy / finalSpeed) * 10
      }
      
      // 检查位置是否为有效数值
      if (isNaN(blob.x) || isNaN(blob.y) || isNaN(blob.vx) || isNaN(blob.vy)) {
        // Blob位置或速度包含NaN值，重置为安全值
        blob.x = Math.max(blob.size/2, Math.min(this.canvasWidth - blob.size/2, blob.x || this.canvasWidth/2))
        blob.y = Math.max(blob.size/2, Math.min(this.canvasHeight - blob.size/2, blob.y || this.canvasHeight/2))
        blob.vx = 0
        blob.vy = 0
      }
    },
    
    /**
     * 应用天气效果到Blob物理
     */
    applyWeatherEffects(blob) {
      switch (this.environmentSettings.weather) {
        case 'wind':
          blob.vx += (Math.random() - 0.5) * 0.3
          break
        case 'storm':
          blob.vx += (Math.random() - 0.5) * 0.8
          blob.vy += (Math.random() - 0.5) * 0.5
          break
        case 'rain':
          blob.vy += 0.1 // 轻微向下的力
          break
        case 'snow':
          blob.vy += 0.05 // 更轻微的向下力
          blob.vx *= 0.98 // 增加阻力
          break
      }
    },
    
    /**
     * 记录Blob轨迹点（优化版本）
     */
    recordTrajectoryPoint(blob) {
      if (!this.trajectoryPoints.has(blob.id)) {
        this.trajectoryPoints.set(blob.id, [])
      }
      
      const points = this.trajectoryPoints.get(blob.id)
      const lastPoint = points[points.length - 1]
      
      // 只在位置变化足够大时记录（减少冗余数据）
      if (lastPoint) {
        const dx = blob.x - lastPoint.x
        const dy = blob.y - lastPoint.y
        const distanceSquared = dx * dx + dy * dy
        if (distanceSquared < 25) return // 移动距离小于5像素，跳过
      }
      
      points.push({ x: blob.x, y: blob.y, time: Date.now() })
      
      // 减少存储点数并使用更高效的数组管理
      if (points.length > 30) {
        points.splice(0, points.length - 30)
      }
      
      // 每10帧清理一次过期轨迹点（减少频繁过滤）
      if (this.frameCount % 10 === 0) {
        const now = Date.now()
        const validPoints = points.filter(point => now - point.time < 3000) // 减少到3秒
        this.trajectoryPoints.set(blob.id, validPoints)
      } else {
        this.trajectoryPoints.set(blob.id, points)
      }
    },
    
    /**
     * 更新动画属性
     */
    updateBlobAnimation(blob, deltaTime) {
      // 脉冲动画
      blob.pulsePhase += 0.05
      const pulse = Math.sin(blob.pulsePhase) * 0.1 + 1
      blob.scale = pulse * (1 + (blob.elasticity - 50) / 200)
      
      // 旋转
      blob.rotation += blob.vx * 0.01
    },
    
    /**
     * 检查边界碰撞（增强版本）
     */
    checkBoundaryCollision(blob) {
      const radius = blob.size / 2
      let bounced = false
      
      // 左边界碰撞
      if (blob.x - radius <= 0) {
        blob.x = radius
        if (blob.vx < 0) {
          blob.vx = Math.abs(blob.vx) * (blob.elasticity / 100)
          bounced = true
        }
      }
      
      // 右边界碰撞
      if (blob.x + radius >= this.canvasWidth) {
        blob.x = this.canvasWidth - radius
        if (blob.vx > 0) {
          blob.vx = -Math.abs(blob.vx) * (blob.elasticity / 100)
          bounced = true
        }
      }
      
      // 上边界碰撞
      if (blob.y - radius <= 0) {
        blob.y = radius
        if (blob.vy < 0) {
          blob.vy = Math.abs(blob.vy) * (blob.elasticity / 100)
          bounced = true
        }
      }
      
      // 下边界碰撞
      if (blob.y + radius >= this.canvasHeight) {
        blob.y = this.canvasHeight - radius
        if (blob.vy > 0) {
          blob.vy = -Math.abs(blob.vy) * (blob.elasticity / 100)
          bounced = true
        }
      }
      
      // 如果发生反弹，记录日志
      if (bounced) {
        // Blob边界反弹
      }
    },
    
    /**
     * 检查Blob间碰撞（优化版本）
     */
    checkBlobCollisions() {
      const maxPreCheckDistance = 150 // 预筛选最大距离
      
      for (let i = 0; i < this.blobs.length; i++) {
        for (let j = i + 1; j < this.blobs.length; j++) {
          const blob1 = this.blobs[i]
          const blob2 = this.blobs[j]
          
          // 快速距离预筛选（避免昂贵的sqrt计算）
          const dx = blob2.x - blob1.x
          const dy = blob2.y - blob1.y
          
          if (Math.abs(dx) > maxPreCheckDistance || Math.abs(dy) > maxPreCheckDistance) {
            continue // 距离太远，跳过
          }
          
          const distance = Math.sqrt(dx * dx + dy * dy)
          const minDistance = (blob1.size + blob2.size) / 2
          
          if (distance < minDistance) {
            // 碰撞处理
            this.handleBlobCollision(blob1, blob2, dx, dy, distance, minDistance)
            
            // 节流互动计数（避免同一对Blob频繁计数）
            this.handleInteractionCount(blob1, blob2)
          }
        }
      }
    },
    
    /**
     * 处理Blob碰撞
     */
    handleBlobCollision(blob1, blob2, dx, dy, distance, minDistance) {
      // 分离重叠
      const overlap = minDistance - distance
      const separationX = (dx / distance) * overlap * 0.5
      const separationY = (dy / distance) * overlap * 0.5
      
      blob1.x -= separationX
      blob1.y -= separationY
      blob2.x += separationX
      blob2.y += separationY
      
      // 弹性碰撞
      const elasticity = (blob1.elasticity + blob2.elasticity) / 200
      const vx1 = blob1.vx
      const vy1 = blob1.vy
      const vx2 = blob2.vx
      const vy2 = blob2.vy
      
      blob1.vx = vx2 * elasticity
      blob1.vy = vy2 * elasticity
      blob2.vx = vx1 * elasticity
      blob2.vy = vy1 * elasticity
      
      // 性格互动效果
      this.handlePersonalityInteraction(blob1, blob2)
    },
    
    /**
     * 处理互动计数（节流版本）
     */
    handleInteractionCount(blob1, blob2) {
      const pairKey = `${Math.min(blob1.id, blob2.id)}-${Math.max(blob1.id, blob2.id)}`
      const now = Date.now()
      
      // 1秒内同一对Blob只计数一次
      if (!this.lastInteractionTime.has(pairKey) || 
          now - this.lastInteractionTime.get(pairKey) > 1000) {
        this.interactionCount++
        this.lastInteractionTime.set(pairKey, now)
        // 互动计数更新
      }
    },
    
    /**
     * 处理性格互动
     */
    handlePersonalityInteraction(blob1, blob2) {
      // 社交型 + 任何类型 = 增加能量
      if (blob1.personality === 'social' || blob2.personality === 'social') {
        blob1.energy = Math.min(100, blob1.energy + 5)
        blob2.energy = Math.min(100, blob2.energy + 5)
      }
      
      // 攻击型 + 慢热型 = 慢热型失去能量
      if ((blob1.personality === 'aggressive' && blob2.personality === 'shy') ||
          (blob1.personality === 'shy' && blob2.personality === 'aggressive')) {
        const shyBlob = blob1.personality === 'shy' ? blob1 : blob2
        shyBlob.energy = Math.max(0, shyBlob.energy - 10)
      }
      
      // 领袖型会吸引其他Blob
      if (blob1.personality === 'leader') {
        blob2.targetX = blob1.x
        blob2.targetY = blob1.y
      }
      if (blob2.personality === 'leader') {
        blob1.targetX = blob2.x
        blob1.targetY = blob2.y
      }
    },
    
    /**
     * 渲染画布（优化版本）
     */
    renderCanvas() {
      if (!this.ctx) return
      
      // 清空画布
      this.ctx.clearRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      // 绘制背景网格（降低频率）
      this.drawGrid()
      
      // 绘制轨迹（在Blob之前绘制）
      if (this.showTrajectory) {
        this.drawTrajectories()
      }
      
      // 批量绘制所有Blob（减少状态切换）
      this.blobs.forEach(blob => {
        this.drawBlob(blob)
      })
      
      // 绘制连接线（社交关系）
      this.drawConnections()
    },
    
    /**
     * 绘制轨迹线（优化版本）
     */
    drawTrajectories() {
      // 每8帧重新绘制轨迹缓存（进一步减少绘制频率）
      if (this.frameCount % 8 === 0) {
        this.trajectoryDirty = true
      }
      
      this.trajectoryPoints.forEach((points, blobId) => {
        if (points.length < 2) return
        
        // 找到对应的Blob以获取颜色
        const blob = this.blobs.find(b => b.id === blobId)
        if (!blob) return
        
        this.ctx.strokeStyle = blob.color
        this.ctx.lineWidth = 1.5 // 稍微减少线宽
        this.ctx.globalAlpha = 0.5
        
        this.ctx.beginPath()
        this.ctx.moveTo(points[0].x, points[0].y)
        
        // 使用更简单的绘制方式（不改变透明度）
        for (let i = 1; i < points.length; i++) {
          this.ctx.lineTo(points[i].x, points[i].y)
        }
        
        this.ctx.stroke()
        this.ctx.globalAlpha = 1
      })
    },
    
    /**
     * 绘制网格背景（优化版本）
     */
    drawGrid() {
      // 只在每10帧绘制一次网格（静态背景不需要频繁重绘）
      if (this.frameCount % 10 !== 0) return
      
      this.ctx.strokeStyle = 'rgba(200, 200, 200, 0.2)'
      this.ctx.lineWidth = 0.5
      
      const gridSize = 50
      
      this.ctx.beginPath()
      for (let x = 0; x <= this.canvasWidth; x += gridSize) {
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.canvasHeight)
      }
      
      for (let y = 0; y <= this.canvasHeight; y += gridSize) {
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.canvasWidth, y)
      }
      this.ctx.stroke()
    },
    
    /**
     * 绘制单个Blob（优化版本）
     */
    drawBlob(blob) {
      const radius = blob.size / 2
      const x = blob.x
      const y = blob.y
      
      // 绘制阴影（简化版本）
      this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)'
      this.ctx.beginPath()
      this.ctx.arc(x + 1, y + 1, radius, 0, Math.PI * 2)
      this.ctx.fill()
      
      // 绘制主体
      this.ctx.fillStyle = blob.color
      this.ctx.globalAlpha = blob.opacity / 100
      this.ctx.beginPath()
      this.ctx.arc(x, y, radius * blob.scale, 0, Math.PI * 2)
      this.ctx.fill()
      
      // 绘制高光（简化版本）
      this.ctx.fillStyle = 'rgba(255, 255, 255, 0.3)'
      this.ctx.beginPath()
      this.ctx.arc(x - radius / 3, y - radius / 3, radius / 4, 0, Math.PI * 2)
      this.ctx.fill()
      
      // 绘制表情
      this.ctx.globalAlpha = 1
      this.ctx.fillStyle = 'white'
      this.ctx.font = `${Math.floor(blob.size / 3)}px Arial`
      this.ctx.textAlign = 'center'
      this.ctx.textBaseline = 'middle'
      this.ctx.fillText(this.getPersonalityEmoji(blob.personality), x, y)
      
      // 绘制状态指示器（简化版本）
      if (blob.state !== 'idle') {
        this.ctx.fillStyle = this.getStateColor(blob.state)
        this.ctx.beginPath()
        this.ctx.arc(x + radius / 2, y - radius / 2, 2, 0, Math.PI * 2)
        this.ctx.fill()
      }
    },
    
    /**
     * 获取状态颜色
     */
    getStateColor(state) {
      const colors = {
        moving: '#4ade80',
        following: '#3b82f6',
        avoiding: '#ef4444',
        attacking: '#dc2626',
        leading: '#f59e0b',
        exploring: '#8b5cf6',
        resting: '#6b7280'
      }
      return colors[state] || '#6b7280'
    },
    
    /**
     * 绘制连接线（优化版本）
     */
    drawConnections() {
      // 只在每4帧绘制一次连接线（减少计算量）
      if (this.frameCount % 4 !== 0) return
      
      this.ctx.strokeStyle = 'rgba(100, 100, 100, 0.15)'
      this.ctx.lineWidth = 0.8
      
      this.ctx.beginPath()
      this.blobs.forEach(blob => {
        if (blob.personality === 'social' || blob.state === 'following') {
          const nearbyBlobs = this.findNearbyBlobs(blob, 80)
          nearbyBlobs.forEach(target => {
            this.ctx.moveTo(blob.x, blob.y)
            this.ctx.lineTo(target.x, target.y)
          })
        }
      })
      this.ctx.stroke()
    },
    
    /**
     * 处理画布点击
     */
    handleCanvasClick(event) {
      const rect = this.$refs.sandboxCanvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top
      
      // 检查是否点击了某个Blob
      const clickedBlob = this.blobs.find(blob => {
        const dx = x - blob.x
        const dy = y - blob.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < blob.size / 2
      })
      
      if (clickedBlob) {
        // 给Blob增加能量和随机推力
        clickedBlob.energy = Math.min(100, clickedBlob.energy + 20)
        clickedBlob.vx += (Math.random() - 0.5) * 4
        clickedBlob.vy += (Math.random() - 0.5) * 4
        // 点击Blob增加能量
      }
    },
    
    /**
     * 处理鼠标移动
     */
    handleMouseMove(event) {
      const rect = this.$refs.sandboxCanvas.getBoundingClientRect()
      this.mouseX = event.clientX - rect.left
      this.mouseY = event.clientY - rect.top
      
      // 检查悬浮的Blob
      this.hoveredBlob = this.blobs.find(blob => {
        const dx = this.mouseX - blob.x
        const dy = this.mouseY - blob.y
        const distance = Math.sqrt(dx * dx + dy * dy)
        return distance < blob.size / 2
      })
    },
    
    /**
     * 获取智能定位的tooltip位置
     */
    getTooltipPosition() {
      if (!this.hoveredBlob) return {}
      
      // 假设tooltip的大小（可以根据实际内容动态计算）
      const tooltipWidth = 200
      const tooltipHeight = this.evolutionEnabled ? 180 : 120
      
      // 获取画布尺寸
      const canvasWidth = this.canvasWidth
      const canvasHeight = this.canvasHeight
      
      // 默认偏移量
      let offsetX = 15
      let offsetY = -15
      
      // 计算tooltip的位置
      let left = this.mouseX + offsetX
      let top = this.mouseY + offsetY
      
      // 右边界检测
      if (left + tooltipWidth > canvasWidth) {
        left = this.mouseX - tooltipWidth - 15
      }
      
      // 下边界检测
      if (top + tooltipHeight > canvasHeight) {
        top = this.mouseY - tooltipHeight + 15
      }
      
      // 左边界检测
      if (left < 0) {
        left = 10
      }
      
      // 上边界检测
      if (top < 0) {
        top = 10
      }
      
      return {
        left: left + 'px',
        top: top + 'px'
      }
    },
    
    /**
     * 切换物理引擎
     */
    togglePhysics() {
      this.physicsEnabled = !this.physicsEnabled
      // 物理引擎状态已切换
    },
    
    /**
     * 清空所有Blob
     */
    clearAllBlobs() {
      this.blobs = []
      this.interactionCount = 0
      // 清空所有Blob
    },
    
    /**
     * 导出快照
     */
    exportSnapshot() {
      const canvas = this.$refs.sandboxCanvas
      if (!canvas) return
      
      // 创建下载链接
      const link = document.createElement('a')
      link.download = `blob-land-${Date.now()}.png`
      link.href = canvas.toDataURL()
      link.click()
      
      // 导出快照完成
    },
    

    
    /**
     * 设置事件监听器
     */
    setupEventListeners() {
      window.addEventListener('resize', this.handleResize)
    },
    
    /**
     * 移除事件监听器
     */
    removeEventListeners() {
      window.removeEventListener('resize', this.handleResize)
    },
    
    /**
     * 处理窗口大小变化
     */
    handleResize() {
      this.$nextTick(() => {
        this.initCanvas()
      })
    },
    
    // ==================== 基因系统方法 ====================
    
    /**
     * 生成随机基因
     */
    generateRandomGenetics() {
      try {
        const personalities = ['social', 'aggressive', 'shy', 'leader', 'explorer', 'lazy']
        
        const genetics = {
          dominant: {
            size: 15 + Math.random() * 30,
            colorHue: Math.random() * 360,
            personality: personalities[Math.floor(Math.random() * personalities.length)],
            energy: 60 + Math.random() * 80,
            elasticity: 20 + Math.random() * 80,
            opacity: 70 + Math.random() * 30,
            speed: 0.5 + Math.random() * 2,
            socialTendency: Math.random(),
            aggressiveness: Math.random()
          },
          recessive: {
            size: 15 + Math.random() * 30,
            colorHue: Math.random() * 360,
            personality: personalities[Math.floor(Math.random() * personalities.length)],
            energy: 60 + Math.random() * 80,
            elasticity: 20 + Math.random() * 80,
            opacity: 70 + Math.random() * 30,
            speed: 0.5 + Math.random() * 2,
            socialTendency: Math.random(),
            aggressiveness: Math.random()
          },
        mutationRate: 0.1 + Math.random() * 0.2
       }
       
       // 验证基因对象完整性
       if (!genetics.dominant || !genetics.recessive || 
           typeof genetics.dominant.colorHue === 'undefined' ||
           typeof genetics.recessive.colorHue === 'undefined') {
         // 基因生成失败：对象不完整
         return null
       }
       
       return genetics
     } catch (error) {
       // 生成基因时发生错误
       return null
     }
   },
    
    /**
     * 根据色调获取颜色
     */
    getColorFromHue(hue) {
      return `hsl(${hue}, 70%, 60%)`
    },
    
    /**
     * 基因交叉繁殖
     */
    crossoverGenetics(parent1Genetics, parent2Genetics) {
      // 安全检查：确保父母基因对象存在且完整
      if (!parent1Genetics || !parent1Genetics.dominant || !parent1Genetics.recessive) {
        // 父母1基因对象不完整
        return this.generateRandomGenetics()
      }
      
      if (!parent2Genetics || !parent2Genetics.dominant || !parent2Genetics.recessive) {
        // 父母2基因对象不完整
        return this.generateRandomGenetics()
      }
      
      const offspring = {
        dominant: {},
        recessive: {},
        mutationRate: (parent1Genetics.mutationRate + parent2Genetics.mutationRate) / 2
      }
      
      // 随机选择显性基因来源
      const traits = ['size', 'colorHue', 'personality', 'energy', 'elasticity', 'opacity', 'speed', 'socialTendency', 'aggressiveness']
      
      traits.forEach(trait => {
        // 确保特定基因存在
        const parent1Trait = parent1Genetics.dominant[trait]
        const parent2Trait = parent2Genetics.dominant[trait]
        const parent1Recessive = parent1Genetics.recessive[trait]
        const parent2Recessive = parent2Genetics.recessive[trait]
        
        if (parent1Trait !== undefined && parent2Trait !== undefined && 
            parent1Recessive !== undefined && parent2Recessive !== undefined) {
          if (Math.random() < 0.5) {
            offspring.dominant[trait] = parent1Trait
            offspring.recessive[trait] = parent2Recessive
          } else {
            offspring.dominant[trait] = parent2Trait
            offspring.recessive[trait] = parent1Recessive
          }
        } else {
          // 基因特征缺失，使用默认值
          // 使用默认值
          const defaultValues = {
            size: 25,
            colorHue: Math.random() * 360,
            personality: 'social',
            energy: 100,
            elasticity: 50,
            opacity: 85,
            speed: 1,
            socialTendency: 0.5,
            aggressiveness: 0.3
          }
          offspring.dominant[trait] = defaultValues[trait]
          offspring.recessive[trait] = defaultValues[trait]
        }
      })
      
      return offspring
    },
    
    /**
     * 基因突变
     */
    mutateGenetics(genetics) {
      const mutated = JSON.parse(JSON.stringify(genetics))
      const personalities = ['social', 'aggressive', 'shy', 'leader', 'explorer', 'lazy']
      
      if (Math.random() < genetics.mutationRate) {
        const trait = ['size', 'colorHue', 'energy', 'elasticity', 'opacity', 'speed', 'socialTendency', 'aggressiveness'][Math.floor(Math.random() * 8)]
        
        switch (trait) {
          case 'size':
            mutated.dominant.size = Math.max(10, Math.min(50, mutated.dominant.size + (Math.random() - 0.5) * 10))
            break
          case 'colorHue':
            mutated.dominant.colorHue = (mutated.dominant.colorHue + (Math.random() - 0.5) * 60) % 360
            if (mutated.dominant.colorHue < 0) mutated.dominant.colorHue += 360
            break
          case 'energy':
            mutated.dominant.energy = Math.max(40, Math.min(150, mutated.dominant.energy + (Math.random() - 0.5) * 20))
            break
          case 'elasticity':
            mutated.dominant.elasticity = Math.max(10, Math.min(100, mutated.dominant.elasticity + (Math.random() - 0.5) * 20))
            break
          case 'opacity':
            mutated.dominant.opacity = Math.max(50, Math.min(100, mutated.dominant.opacity + (Math.random() - 0.5) * 20))
            break
          case 'speed':
            mutated.dominant.speed = Math.max(0.2, Math.min(3, mutated.dominant.speed + (Math.random() - 0.5) * 0.5))
            break
          case 'socialTendency':
            mutated.dominant.socialTendency = Math.max(0, Math.min(1, mutated.dominant.socialTendency + (Math.random() - 0.5) * 0.3))
            break
          case 'aggressiveness':
            mutated.dominant.aggressiveness = Math.max(0, Math.min(1, mutated.dominant.aggressiveness + (Math.random() - 0.5) * 0.3))
            break
        }
        
        // 性格突变
        if (Math.random() < 0.1) {
          mutated.dominant.personality = personalities[Math.floor(Math.random() * personalities.length)]
        }
        
        this.totalMutations++
        // 基因突变发生
      }
      
      return mutated
     },
     
     // ==================== 繁殖系统方法 ====================
     
     /**
      * 检查繁殖条件
      */
     checkReproduction() {
       if (!this.evolutionEnabled) return
       
       const now = Date.now()
       
       for (let i = 0; i < this.blobs.length; i++) {
         const blob1 = this.blobs[i]
         
         // 检查繁殖准备状态（提高年龄和能量要求）
        if (blob1.age > 15000 && blob1.energy > 90 && blob1.reproductionReady === undefined) {
          // 70%概率可繁殖，30%概率不可繁殖
          blob1.reproductionReady = Math.random() < 0.7
          if (blob1.reproductionReady) {
            // 为每个Blob设置随机的繁殖间隔时间（60-120秒）
            blob1.reproductionInterval = 60000 + Math.random() * 60000
            // Blob已准备繁殖
          }
        }
         
         // 使用随机繁殖间隔时间
         const reproductionInterval = blob1.reproductionInterval || 90000 // 默认90秒
         if (!blob1.reproductionReady || now - blob1.lastReproduction < reproductionInterval) continue
         
         // 寻找繁殖伙伴
         for (let j = i + 1; j < this.blobs.length; j++) {
           const blob2 = this.blobs[j]
           
           // 使用随机繁殖间隔时间
           const reproductionInterval2 = blob2.reproductionInterval || 90000 // 默认90秒
           if (!blob2.reproductionReady || now - blob2.lastReproduction < reproductionInterval2) continue
           
           const distance = Math.sqrt((blob1.x - blob2.x) ** 2 + (blob1.y - blob2.y) ** 2)
           
           // 繁殖条件：距离足够近，能量充足，性格兼容
           if (distance < 60 && this.areCompatible(blob1, blob2)) {
             // 繁殖成功率检查（基础成功率70%）
             const baseSuccessRate = 0.7
             
             // 根据能量状态调整成功率
             const energyBonus = Math.min(0.2, (blob1.energy + blob2.energy - 180) / 100)
             
             // 根据年龄调整成功率（年龄越大成功率越高，但有上限）
             const ageBonus = Math.min(0.1, (blob1.age + blob2.age - 30000) / 100000)
             
             const finalSuccessRate = Math.max(0.3, Math.min(0.95, baseSuccessRate + energyBonus + ageBonus))
             
             if (Math.random() < finalSuccessRate) {
               this.reproduce(blob1, blob2)
               // 繁殖成功
             } else {
               // 繁殖失败
               // 繁殖失败也要更新最后繁殖时间，避免频繁尝试
               blob1.lastReproduction = Date.now()
               blob2.lastReproduction = Date.now()
             }
             return // 每帧只处理一次繁殖
           }
         }
       }
     },
     
     /**
      * 检查性格兼容性
      */
     areCompatible(blob1, blob2) {
       const compatibility = {
         social: ['social', 'leader', 'explorer'],
         aggressive: ['aggressive', 'leader'],
         shy: ['shy', 'social'],
         leader: ['social', 'aggressive', 'explorer'],
         explorer: ['social', 'leader', 'explorer'],
         lazy: ['lazy', 'shy']
       }
       
       return compatibility[blob1.personality]?.includes(blob2.personality) || Math.random() < 0.3
     },
     
     /**
      * 执行繁殖
      */
     reproduce(parent1, parent2) {
       // 开始繁殖过程
       
       // 基因交叉
       let offspringGenetics = this.crossoverGenetics(parent1.genetics, parent2.genetics)
       
       // 突变
       offspringGenetics = this.mutateGenetics(offspringGenetics)
       
       // 创建后代
       const childName = this.generateOffspringName(parent1.name, parent2.name)
       const childX = (parent1.x + parent2.x) / 2 + (Math.random() - 0.5) * 50
       const childY = (parent1.y + parent2.y) / 2 + (Math.random() - 0.5) * 50
       
       // 临时保存表单数据
       const originalName = this.newBlob.name
       this.newBlob.name = childName
       
       // 创建后代
       let offspring = this.createBlob(offspringGenetics, [parent1.id, parent2.id])
       offspring.x = childX
       offspring.y = childY
       
       // 为后代设置随机繁殖间隔时间（60-120秒）
       offspring.reproductionInterval = 60000 + Math.random() * 60000
       
       // 恢复表单数据
       this.newBlob.name = originalName
       
       // 更新父母状态
       parent1.lastReproduction = Date.now()
       parent2.lastReproduction = Date.now()
       parent1.energy -= 30
       parent2.energy -= 30
       // 注意：不修改reproductionReady状态，保持原有的可繁殖/不可繁殖属性
       // 通过lastReproduction时间来控制繁殖冷却
       
       // 更新父母的子女列表
       parent1.childrenIds.push(offspring.id)
       parent2.childrenIds.push(offspring.id)
       
       // 更新世代统计
       this.currentGeneration = Math.max(this.currentGeneration, offspring.generation)
       
       // 新生命诞生
     },
     
     /**
      * 生成后代名称
      */
     generateOffspringName(parent1Name, parent2Name) {
       const prefixes = ['小', '新', '幼']
       const suffixes = ['Jr', '二代', '宝宝']
       
       if (Math.random() < 0.5) {
         return prefixes[Math.floor(Math.random() * prefixes.length)] + parent1Name.slice(0, 2)
       } else {
         return parent2Name.slice(0, 2) + suffixes[Math.floor(Math.random() * suffixes.length)]
       }
     },
     
     // ==================== 进化树方法 ====================
     
     /**
      * 添加到进化树
      */
     addToEvolutionTree(blob) {
       this.evolutionTree.nodes.set(blob.id, {
         id: blob.id,
         name: blob.name,
         generation: blob.generation,
         genetics: blob.genetics,
         parentIds: blob.parentIds,
         childrenIds: blob.childrenIds,
         birthTime: Date.now(),
         isAlive: true
       })
       
       // 添加到世代映射
       if (!this.evolutionTree.generations.has(blob.generation)) {
         this.evolutionTree.generations.set(blob.generation, [])
       }
       this.evolutionTree.generations.get(blob.generation).push(blob.id)
       
       // 添加边（亲子关系）
       blob.parentIds.forEach(parentId => {
         const edgeId = `${parentId}-${blob.id}`
         this.evolutionTree.edges.set(edgeId, {
           from: parentId,
           to: blob.id,
           type: 'reproduction'
         })
       })
     },
     
     /**
      * 根据ID获取世代
      */
     getGenerationById(id) {
       const node = this.evolutionTree.nodes.get(id)
       return node ? node.generation : 1
     },
     
     /**
      * 切换进化模式
      */
     toggleEvolution() {
       this.evolutionEnabled = !this.evolutionEnabled
       
       if (this.evolutionEnabled) {
         // 进化模式已启用
         // 为现有Blob添加基因
         this.blobs.forEach(blob => {
           if (!blob.genetics) {
             const newGenetics = this.generateRandomGenetics()
             // 安全检查：确保基因对象完整
             if (newGenetics && newGenetics.dominant) {
               blob.genetics = newGenetics
               blob.age = 0
               blob.reproductionReady = undefined
               blob.lastReproduction = 0
               blob.generation = 1
               blob.parentIds = []
               blob.childrenIds = []
               this.addToEvolutionTree(blob)
               // 为Blob添加基因成功
             } else {
               // 为Blob生成基因失败
             }
           }
         })
       } else {
         // 进化模式已关闭
       }
     }
  }
}
</script>

<style scoped>
.blob-land-container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 20px;
}

.blob-preview {
  animation: gentle-pulse 2s ease-in-out infinite;
}

@keyframes gentle-pulse {
  0%, 100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.05);
  }
}

.canvas-container {
  position: relative;
  border: 2px solid #e5e7eb;
  border-radius: 12px;
  overflow: hidden;
}

.canvas-container::before {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%), 
              linear-gradient(-45deg, rgba(255, 255, 255, 0.1) 25%, transparent 25%), 
              linear-gradient(45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%), 
              linear-gradient(-45deg, transparent 75%, rgba(255, 255, 255, 0.1) 75%);
  background-size: 20px 20px;
  background-position: 0 0, 0 10px, 10px -10px, -10px 0px;
  pointer-events: none;
  opacity: 0.3;
}

/* 响应式设计 */
@media (max-width: 768px) {
  .blob-land-container {
    padding: 10px;
  }
  
  .game-header .flex {
    flex-direction: column;
    gap: 1rem;
  }
  
  .mode-selector .flex {
    flex-direction: column;
    gap: 0.5rem;
  }
  
  .creator-panel .grid {
    grid-template-columns: 1fr;
  }
}

/* 像素风背景 */
.pixel-background {
  background-image: 
    radial-gradient(circle at 25% 25%, #333 2px, transparent 2px),
    radial-gradient(circle at 75% 75%, #555 2px, transparent 2px);
  background-size: 20px 20px;
  background-position: 0 0, 10px 10px;
}

/* 天气效果 */
.rain-effect {
  background-image: 
    linear-gradient(transparent 0%, transparent 40%, rgba(255,255,255,0.6) 40%, rgba(255,255,255,0.6) 60%, transparent 60%);
  background-size: 2px 15px;
  animation: rain 0.5s linear infinite;
}

@keyframes rain {
  0% {
    background-position: 0% 0%;
  }
  100% {
    background-position: 0% 100%;
  }
}

.snow-effect {
  background-image: 
    radial-gradient(circle at 20% 20%, rgba(255,255,255,0.8) 2px, transparent 2px),
    radial-gradient(circle at 80% 80%, rgba(255,255,255,0.6) 1px, transparent 1px),
    radial-gradient(circle at 40% 40%, rgba(255,255,255,0.4) 1px, transparent 1px);
  background-size: 50px 50px, 30px 30px, 70px 70px;
  animation: snow 3s linear infinite;
}

@keyframes snow {
  0% {
    background-position: 0% 0%, 0% 0%, 0% 0%;
  }
  100% {
    background-position: 0% 100%, 0% 100%, 0% 100%;
  }
}

.storm-effect {
  background: 
    linear-gradient(45deg, transparent 40%, rgba(255,255,255,0.8) 50%, transparent 60%),
    radial-gradient(circle at 30% 30%, rgba(200,200,255,0.3) 3px, transparent 3px);
  background-size: 10px 10px, 40px 40px;
  animation: storm 0.3s linear infinite;
}

@keyframes storm {
  0% {
    background-position: 0% 0%, 0% 0%;
    opacity: 0.8;
  }
  50% {
    opacity: 1;
  }
  100% {
    background-position: 100% 100%, 100% 100%;
    opacity: 0.8;
  }
}

/* 环境控制面板样式 */
.environment-controls {
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255,255,255,0.2);
}

/* 拖拽指示器 */
.drag-indicator {
  position: absolute;
  pointer-events: none;
  border: 2px dashed #3b82f6;
  border-radius: 50%;
  background: rgba(59, 130, 246, 0.1);
  transition: all 0.2s ease;
}

/* 滚动条样式 */
::-webkit-scrollbar {
  width: 8px;
}

::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb {
  background: #c1c1c1;
  border-radius: 4px;
}

::-webkit-scrollbar-thumb:hover {
  background: #a1a1a1;
}
</style>