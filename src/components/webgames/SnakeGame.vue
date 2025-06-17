<template>
  <div class="snake-game-container">
    <!-- 游戏头部 -->
    <div class="game-header mb-6">
      <div class="flex justify-between items-center">
        <div>
          <h2 class="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">🐍 贪吃蛇游戏</h2>
          <p class="text-gray-600 mt-1">经典的贪吃蛇游戏，挑战你的反应速度！</p>
        </div>
        <div class="text-right space-y-2">
          <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">当前得分</div>
            <div class="text-2xl font-bold">{{ score }}</div>
          </div>
          <div class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white px-4 py-2 rounded-lg">
            <div class="text-xs opacity-90">历史最高</div>
            <div class="text-lg font-bold">{{ highScore }}</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏控制面板 -->
    <div class="game-controls mb-6">
      <div class="flex flex-wrap gap-4 items-center justify-center">
        <button
          @click="startGame"
          :disabled="gameRunning"
          class="px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          <span class="text-lg">{{ gameRunning ? '🎮' : '🚀' }}</span>
          {{ gameRunning ? '游戏进行中' : '开始游戏' }}
        </button>
        
        <button
          @click="pauseGame"
          :disabled="!gameRunning"
          class="px-6 py-3 bg-gradient-to-r from-yellow-500 to-orange-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none flex items-center gap-2"
        >
          <span class="text-lg">{{ gamePaused ? '▶️' : '⏸️' }}</span>
          {{ gamePaused ? '继续' : '暂停' }}
        </button>
        
        <button
          @click="resetGame"
          class="px-6 py-3 bg-gradient-to-r from-red-500 to-pink-500 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <span class="text-lg">🔄</span>
          重新开始
        </button>
        
        <select 
          v-model="difficulty" 
          @change="changeDifficulty"
          :disabled="gameRunning"
          class="px-4 py-3 bg-gradient-to-r from-purple-500 to-indigo-500 text-white font-semibold rounded-xl shadow-lg focus:ring-4 focus:ring-purple-300 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <option value="easy" class="bg-gray-800">🐌 简单</option>
          <option value="medium" class="bg-gray-800">🏃 中等</option>
          <option value="hard" class="bg-gray-800">🚀 困难</option>
          <option value="extreme" class="bg-gray-800">⚡ 极限</option>
        </select>
        
        <button
          @click="toggleSound"
          class="px-4 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200 flex items-center gap-2"
        >
          <span class="text-lg">{{ soundEnabled ? '🔊' : '🔇' }}</span>
          {{ soundEnabled ? '音效开' : '音效关' }}
        </button>
      </div>
    </div>

    <!-- 游戏画布 -->
    <div class="game-canvas-container relative">
      <div class="canvas-wrapper relative bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 rounded-2xl p-4 shadow-2xl">
        <canvas
          ref="gameCanvas"
          :width="canvasWidth"
          :height="canvasHeight"
          class="border-2 border-gray-600 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 shadow-inner"
          @keydown="handleKeyPress"
          tabindex="0"
        ></canvas>
        
        <!-- 粒子效果容器 -->
        <div ref="particleContainer" class="absolute inset-0 pointer-events-none rounded-xl overflow-hidden"></div>
        
        <!-- 游戏状态覆盖层 -->
        <div v-if="!gameRunning && !gameOver" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl">
          <div class="text-center text-white">
            <div class="text-6xl mb-4">🐍</div>
            <div class="text-2xl font-bold mb-2">准备开始游戏</div>
            <div class="text-gray-300">点击开始游戏按钮或按空格键开始</div>
          </div>
        </div>
        
        <!-- 暂停覆盖层 -->
        <div v-if="gamePaused" class="absolute inset-0 flex items-center justify-center bg-black bg-opacity-70 rounded-xl">
          <div class="text-center text-white">
            <div class="text-6xl mb-4">⏸️</div>
            <div class="text-2xl font-bold mb-2">游戏已暂停</div>
            <div class="text-gray-300">按空格键继续游戏</div>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏说明 -->
    <div class="game-instructions mt-6">
      <div class="card p-4">
        <h3 class="font-semibold text-gray-900 mb-2">🎮 游戏说明</h3>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-600">
          <div>
            <p><strong>控制方式：</strong></p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>↑ ↓ ← → 方向键控制移动</li>
              <li>空格键暂停/继续游戏</li>
            </ul>
          </div>
          <div>
            <p><strong>游戏规则：</strong></p>
            <ul class="list-disc list-inside mt-1 space-y-1">
              <li>吃到食物得分并变长</li>
              <li>撞墙或撞到自己游戏结束</li>
              <li>难度越高速度越快</li>
            </ul>
          </div>
        </div>
      </div>
    </div>

    <!-- 游戏结束弹窗 -->
    <div v-if="gameOver" class="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 backdrop-blur-sm">
      <div class="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl border border-gray-200 transform animate-bounce-in">
        <div class="text-center">
          <div class="text-6xl mb-4 animate-pulse">{{ isNewRecord ? '🏆' : '🎮' }}</div>
          <h3 class="text-2xl font-bold bg-gradient-to-r from-red-600 to-pink-600 bg-clip-text text-transparent mb-4">
            {{ isNewRecord ? '🎉 新纪录！' : '游戏结束' }}
          </h3>
          
          <div class="space-y-3 mb-6">
            <div class="bg-gradient-to-r from-blue-500 to-purple-600 text-white p-3 rounded-xl">
              <div class="text-sm opacity-90">本次得分</div>
              <div class="text-2xl font-bold">{{ score }}</div>
            </div>
            
            <div class="bg-gradient-to-r from-yellow-500 to-orange-600 text-white p-3 rounded-xl">
              <div class="text-sm opacity-90">历史最高</div>
              <div class="text-xl font-bold">{{ highScore }}</div>
            </div>
            
            <div class="grid grid-cols-2 gap-3">
              <div class="bg-gray-100 p-3 rounded-xl">
                <div class="text-xs text-gray-600">游戏时长</div>
                <div class="text-lg font-bold text-gray-800">{{ formatTime(gameTime) }}</div>
              </div>
              <div class="bg-gray-100 p-3 rounded-xl">
                <div class="text-xs text-gray-600">蛇身长度</div>
                <div class="text-lg font-bold text-gray-800">{{ snake.length }}</div>
              </div>
            </div>
          </div>
          
          <div class="flex gap-3">
            <button @click="resetGame" class="flex-1 px-6 py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              🚀 再来一局
            </button>
            <button @click="closeGameOver" class="flex-1 px-6 py-3 bg-gradient-to-r from-gray-500 to-gray-600 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-200">
              ❌ 关闭
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SnakeGame',
  data() {
    return {
      // 游戏状态
      gameRunning: false,
      gamePaused: false,
      gameOver: false,
      score: 0,
      highScore: 0,
      difficulty: 'medium',
      isNewRecord: false,
      
      // 画布设置
      canvasWidth: 820,
      canvasHeight: 650,
      gridSize: 24,
      
      // 游戏对象
      snake: [],
      food: {},
      direction: 'right',
      nextDirection: 'right',
      
      // 游戏循环和时间
      gameLoop: null,
      gameSpeed: 150,
      gameStartTime: 0,
      gameTime: 0,
      gameTimeInterval: null,
      
      // 音效和视觉效果
      soundEnabled: true,
      audioContext: null,
      particles: [],
      
      // 特殊食物
      specialFood: null,
      specialFoodTimer: 0,
      
      // 连击系统
      combo: 0,
      lastEatTime: 0
    }
  },
  mounted() {
    this.loadHighScore()
    this.initGame()
    this.setupKeyboardListeners()
  },
  beforeUnmount() {
    this.stopGame()
    this.removeKeyboardListeners()
  },
  methods: {
    /**
     * 加载历史最高分
     */
    loadHighScore() {
      const saved = localStorage.getItem('snakeGame_highScore')
      this.highScore = saved ? parseInt(saved) : 0
    },
    
    /**
     * 保存历史最高分
     */
    saveHighScore() {
      localStorage.setItem('snakeGame_highScore', this.highScore.toString())
      console.log(`历史最高分已保存: ${this.highScore}`)
    },
    
    /**
     * 初始化游戏
     */
    initGame() {
      this.resetGameState()
      this.setupCanvas()
      this.generateFood()
      this.draw()
    },
    
    /**
     * 重置游戏状态
     */
    resetGameState() {
      this.snake = [
        { x: 10, y: 10 },
        { x: 9, y: 10 },
        { x: 8, y: 10 }
      ]
      this.direction = 'right'
      this.nextDirection = 'right'
      this.score = 0
      this.gameOver = false
      this.isNewRecord = false
      this.gameTime = 0
      this.combo = 0
      this.particles = []
      this.specialFood = null
      this.specialFoodTimer = 0
    },
    
    /**
     * 设置画布
     */
    setupCanvas() {
      const canvas = this.$refs.gameCanvas
      if (canvas) {
        canvas.focus()
      }
    },
    
    /**
     * 开始游戏
     */
    startGame() {
      if (this.gameRunning) return
      
      console.log('开始游戏')
      
      // 如果游戏结束了，先重置游戏状态
      if (this.gameOver) {
        console.log('游戏已结束，重置游戏状态')
        this.resetGameState()
        this.generateFood()
      }
      
      // 初始化音频上下文（需要用户交互）
      this.initAudioContext()
      
      this.gameRunning = true
      this.gamePaused = false
      this.gameOver = false
      this.gameStartTime = Date.now()
      
      console.log('游戏开始，蛇的位置:', this.snake[0])
      
      // 游戏主循环
      this.gameLoop = setInterval(() => {
        if (!this.gamePaused) {
          this.update()
          this.updateParticles()
          this.draw()
        }
      }, this.gameSpeed)
      
      // 时间计算循环
      this.gameTimeInterval = setInterval(() => {
        if (!this.gamePaused && this.gameRunning) {
          this.gameTime = Math.floor((Date.now() - this.gameStartTime) / 1000)
        }
      }, 1000)
      
      this.playSound('start')
    },
    
    /**
     * 暂停/继续游戏
     */
    pauseGame() {
      this.gamePaused = !this.gamePaused
    },
    
    /**
     * 停止游戏
     */
    stopGame() {
      if (this.gameLoop) {
        clearInterval(this.gameLoop)
        this.gameLoop = null
      }
      if (this.gameTimeInterval) {
        clearInterval(this.gameTimeInterval)
        this.gameTimeInterval = null
      }
      this.gameRunning = false
    },
    
    /**
     * 重新开始游戏
     */
    resetGame() {
      console.log('重置游戏开始')
      this.gameRunning = false
      this.gamePaused = false
      this.gameOver = false
      
      // 停止当前游戏循环
      if (this.gameLoop) {
        clearInterval(this.gameLoop)
        this.gameLoop = null
      }
      
      // 重置游戏状态
      this.resetGameState()
      
      // 重新设置画布和生成食物
      this.setupCanvas()
      this.generateFood()
      
      // 重新绘制游戏
      this.draw()
      
      console.log('游戏重置完成，蛇的位置:', this.snake[0])
    },
    
    /**
     * 改变难度
     */
    changeDifficulty() {
      const speeds = {
        easy: 200,
        medium: 150,
        hard: 100,
        extreme: 60
      }
      this.gameSpeed = speeds[this.difficulty]
      
      if (this.gameRunning) {
        // 重新启动游戏循环以应用新速度
        this.stopGame()
        this.startGame()
      }
    },
    
    /**
     * 切换音效
     */
    toggleSound() {
      this.soundEnabled = !this.soundEnabled
      this.playSound('click')
    },
    
    /**
     * 游戏更新逻辑
     */
    update() {
      this.direction = this.nextDirection
      
      // 移动蛇头
      const head = { ...this.snake[0] }
      switch (this.direction) {
        case 'up': head.y--; break
        case 'down': head.y++; break
        case 'left': head.x--; break
        case 'right': head.x++; break
      }
      
      // 检查碰撞
      if (this.checkCollision(head)) {
        this.endGame()
        return
      }
      
      this.snake.unshift(head)
      
      // 检查是否吃到普通食物
      if (head.x === this.food.x && head.y === this.food.y) {
        this.eatFood()
      }
      // 检查是否吃到特殊食物
      else if (this.specialFood && head.x === this.specialFood.x && head.y === this.specialFood.y) {
        this.eatSpecialFood()
      }
      else {
        this.snake.pop()
        this.combo = 0 // 重置连击
      }
      
      // 更新特殊食物计时器
      this.updateSpecialFood()
    },
    
    /**
     * 吃到普通食物
     */
    eatFood() {
      const currentTime = Date.now()
      const timeDiff = currentTime - this.lastEatTime
      
      // 连击系统
      if (timeDiff < 3000) { // 3秒内连续吃到食物
        this.combo++
      } else {
        this.combo = 1
      }
      
      this.lastEatTime = currentTime
      
      // 计算得分（基础分 + 连击奖励 + 难度奖励）
      let baseScore = 10
      let comboBonus = this.combo > 1 ? (this.combo - 1) * 5 : 0
      let difficultyMultiplier = {
        easy: 1,
        medium: 1.5,
        hard: 2,
        extreme: 3
      }[this.difficulty]
      
      const earnedScore = Math.floor((baseScore + comboBonus) * difficultyMultiplier)
      this.score += earnedScore
      
      // 创建得分粒子效果
      this.createScoreParticle(this.food.x, this.food.y, earnedScore)
      
      // 播放音效
      this.playSound('eat')
      
      // 生成新食物
      this.generateFood()
      
      // 有概率生成特殊食物
      if (Math.random() < 0.15 && !this.specialFood) {
        this.generateSpecialFood()
      }
    },
    
    /**
     * 吃到特殊食物
     */
    eatSpecialFood() {
      const bonusScore = 50 * {
        easy: 1,
        medium: 1.5,
        hard: 2,
        extreme: 3
      }[this.difficulty]
      
      this.score += Math.floor(bonusScore)
      
      // 创建特殊得分粒子效果
      this.createSpecialParticle(this.specialFood.x, this.specialFood.y)
      
      // 播放特殊音效
      this.playSound('specialEat')
      
      // 移除特殊食物
      this.specialFood = null
      this.specialFoodTimer = 0
    },
    
    /**
     * 检查碰撞
     */
    checkCollision(head) {
      const gridWidth = this.canvasWidth / this.gridSize
      const gridHeight = this.canvasHeight / this.gridSize
      
      // 撞墙
      if (head.x < 0 || head.x >= gridWidth || head.y < 0 || head.y >= gridHeight) {
        return true
      }
      
      // 撞到自己
      return this.snake.some(segment => segment.x === head.x && segment.y === head.y)
    },
    
    /**
     * 生成食物
     */
    generateFood() {
      const gridWidth = this.canvasWidth / this.gridSize
      const gridHeight = this.canvasHeight / this.gridSize
      
      do {
        this.food = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight)
        }
      } while (this.snake.some(segment => segment.x === this.food.x && segment.y === this.food.y) ||
               (this.specialFood && this.food.x === this.specialFood.x && this.food.y === this.specialFood.y))
    },
    
    /**
     * 生成特殊食物
     */
    generateSpecialFood() {
      const gridWidth = this.canvasWidth / this.gridSize
      const gridHeight = this.canvasHeight / this.gridSize
      
      do {
        this.specialFood = {
          x: Math.floor(Math.random() * gridWidth),
          y: Math.floor(Math.random() * gridHeight),
          type: Math.random() < 0.5 ? 'golden' : 'rainbow'
        }
      } while (this.snake.some(segment => segment.x === this.specialFood.x && segment.y === this.specialFood.y) ||
               (this.food.x === this.specialFood.x && this.food.y === this.specialFood.y))
      
      this.specialFoodTimer = 10000 // 10秒后消失
    },
    
    /**
     * 更新特殊食物
     */
    updateSpecialFood() {
      if (this.specialFood) {
        this.specialFoodTimer -= this.gameSpeed
        if (this.specialFoodTimer <= 0) {
          this.specialFood = null
          this.specialFoodTimer = 0
        }
      }
    },
    
    /**
     * 绘制游戏
     */
    draw() {
      const canvas = this.$refs.gameCanvas
      if (!canvas) return
      
      this.ctx = canvas.getContext('2d')
      
      // 清空画布
      this.ctx.fillStyle = '#f8fafc'
      this.ctx.fillRect(0, 0, this.canvasWidth, this.canvasHeight)
      
      // 绘制网格背景
      this.drawGrid()
      
      // 绘制蛇
      this.drawSnake()
      
      // 绘制普通食物
      this.drawFood()
      
      // 绘制特殊食物
      if (this.specialFood) {
        this.drawSpecialFood()
      }
      
      // 绘制粒子效果
      this.drawParticles()
      
      // 绘制连击提示
      if (this.combo > 1) {
        this.drawCombo()
      }
    },
    
    /**
     * 绘制网格背景
     */
    drawGrid() {
      this.ctx.strokeStyle = '#e2e8f0'
      this.ctx.lineWidth = 0.5
      
      for (let x = 0; x <= this.canvasWidth; x += this.gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(x, 0)
        this.ctx.lineTo(x, this.canvasHeight)
        this.ctx.stroke()
      }
      
      for (let y = 0; y <= this.canvasHeight; y += this.gridSize) {
        this.ctx.beginPath()
        this.ctx.moveTo(0, y)
        this.ctx.lineTo(this.canvasWidth, y)
        this.ctx.stroke()
      }
    },
    
    /**
     * 绘制蛇
     */
    drawSnake() {
      this.snake.forEach((segment, index) => {
        const x = segment.x * this.gridSize
        const y = segment.y * this.gridSize
        
        if (index === 0) {
          // 蛇头 - 渐变效果
          const gradient = this.ctx.createRadialGradient(
            x + this.gridSize / 2, y + this.gridSize / 2, 0,
            x + this.gridSize / 2, y + this.gridSize / 2, this.gridSize / 2
          )
          gradient.addColorStop(0, '#10b981')
          gradient.addColorStop(1, '#059669')
          this.ctx.fillStyle = gradient
        } else {
          // 蛇身 - 根据位置渐变
          const alpha = 1 - (index / this.snake.length) * 0.3
          this.ctx.fillStyle = `rgba(16, 185, 129, ${alpha})`
        }
        
        this.ctx.fillRect(x + 1, y + 1, this.gridSize - 2, this.gridSize - 2)
        
        // 蛇头眼睛
        if (index === 0) {
          this.ctx.fillStyle = '#fff'
          const eyeSize = 3
          const eyeOffset = 6
          
          if (this.direction === 'up' || this.direction === 'down') {
            this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize)
            this.ctx.fillRect(x + this.gridSize - eyeOffset - eyeSize, y + eyeOffset, eyeSize, eyeSize)
          } else {
            this.ctx.fillRect(x + eyeOffset, y + eyeOffset, eyeSize, eyeSize)
            this.ctx.fillRect(x + eyeOffset, y + this.gridSize - eyeOffset - eyeSize, eyeSize, eyeSize)
          }
        }
      })
    },
    
    /**
     * 绘制普通食物
     */
    drawFood() {
      const x = this.food.x * this.gridSize
      const y = this.food.y * this.gridSize
      
      // 脉冲效果
      const pulse = Math.sin(Date.now() * 0.01) * 0.1 + 0.9
      const size = this.gridSize * pulse
      const offset = (this.gridSize - size) / 2
      
      const gradient = this.ctx.createRadialGradient(
        x + this.gridSize / 2, y + this.gridSize / 2, 0,
        x + this.gridSize / 2, y + this.gridSize / 2, size / 2
      )
      gradient.addColorStop(0, '#f87171')
      gradient.addColorStop(1, '#ef4444')
      
      this.ctx.fillStyle = gradient
      this.ctx.fillRect(x + offset, y + offset, size, size)
    },
    
    /**
     * 绘制特殊食物
     */
    drawSpecialFood() {
      const x = this.specialFood.x * this.gridSize
      const y = this.specialFood.y * this.gridSize
      
      // 旋转和脉冲效果
      const time = Date.now() * 0.005
      const pulse = Math.sin(time * 2) * 0.2 + 1
      
      this.ctx.save()
      this.ctx.translate(x + this.gridSize / 2, y + this.gridSize / 2)
      this.ctx.rotate(time)
      this.ctx.scale(pulse, pulse)
      
      if (this.specialFood.type === 'golden') {
        // 金色特殊食物
        const gradient = this.ctx.createRadialGradient(0, 0, 0, 0, 0, this.gridSize / 2)
        gradient.addColorStop(0, '#f59e0b')
        gradient.addColorStop(1, '#d97706')
        this.ctx.fillStyle = gradient
        this.ctx.fillRect(-this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize)
      } else {
        // 彩虹特殊食物
        const hue = (time * 100) % 360
        this.ctx.fillStyle = `hsl(${hue}, 60%, 60%)`
        this.ctx.fillRect(-this.gridSize / 2, -this.gridSize / 2, this.gridSize, this.gridSize)
      }
      
      this.ctx.restore()
      
      // 绘制倒计时环
      const progress = this.specialFoodTimer / 10000
      this.ctx.strokeStyle = '#64748b'
      this.ctx.lineWidth = 2
      this.ctx.beginPath()
      this.ctx.arc(
        x + this.gridSize / 2,
        y + this.gridSize / 2,
        this.gridSize / 2 + 3,
        -Math.PI / 2,
        -Math.PI / 2 + (Math.PI * 2 * progress)
      )
      this.ctx.stroke()
    },
    
    /**
     * 绘制粒子效果
     */
    drawParticles() {
      this.particles.forEach(particle => {
        const alpha = particle.life / particle.maxLife
        this.ctx.save()
        this.ctx.globalAlpha = alpha
        this.ctx.fillStyle = particle.color
        this.ctx.font = '14px Arial'
        this.ctx.textAlign = 'center'
        this.ctx.fillText(particle.text, particle.x, particle.y)
        this.ctx.restore()
      })
    },
    
    /**
     * 绘制连击提示
     */
    drawCombo() {
      this.ctx.save()
      this.ctx.fillStyle = '#d97706'
      this.ctx.font = 'bold 20px Arial'
      this.ctx.textAlign = 'center'
      this.ctx.fillText(
        `COMBO x${this.combo}!`,
        this.canvasWidth / 2,
        30
      )
      this.ctx.restore()
    },
    
    /**
     * 处理键盘输入
     */
    handleKeyPress(event) {
      const key = event.key
      
      // 方向键控制
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(key)) {
        event.preventDefault()
        
        if (!this.gameRunning || this.gameOver) return
        
        const opposites = {
          ArrowUp: 'ArrowDown',
          ArrowDown: 'ArrowUp',
          ArrowLeft: 'ArrowRight',
          ArrowRight: 'ArrowLeft'
        }
        
        const directions = {
          ArrowUp: 'up',
          ArrowDown: 'down',
          ArrowLeft: 'left',
          ArrowRight: 'right'
        }
        
        // 防止蛇反向移动
        if (opposites[key] !== `Arrow${this.direction.charAt(0).toUpperCase()}${this.direction.slice(1)}`) {
          this.nextDirection = directions[key]
        }
      }
      
      // 空格键暂停/继续
      if (key === ' ') {
        event.preventDefault()
        if (this.gameRunning && !this.gameOver) {
          this.togglePause()
        }
      }
      
      // ESC键停止游戏
      if (key === 'Escape') {
        event.preventDefault()
        if (this.gameRunning) {
          this.stopGame()
        }
      }
    },
    
    /**
     * 设置键盘监听器
     */
    setupKeyboardListeners() {
      document.addEventListener('keydown', this.handleKeyPress)
    },
    
    /**
     * 移除键盘监听器
     */
    removeKeyboardListeners() {
      document.removeEventListener('keydown', this.handleKeyPress)
    },
    
    /**
     * 切换暂停状态
     */
    togglePause() {
      if (!this.gameRunning || this.gameOver) return
      
      this.gamePaused = !this.gamePaused
      this.playSound('click')
    },
    
    /**
     * 结束游戏
     */
    endGame() {
      this.stopGame()
      this.gameOver = true
      
      // 检查是否创造新纪录
      if (this.score > this.highScore) {
        this.isNewRecord = true
        this.highScore = this.score
        this.saveHighScore()
        this.playSound('newRecord')
      } else {
        this.playSound('gameOver')
      }
    },
    
    /**
     * 创建得分粒子效果
     */
    createScoreParticle(x, y, score) {
      const particle = {
        x: x * this.gridSize + this.gridSize / 2,
        y: y * this.gridSize + this.gridSize / 2,
        text: `+${score}`,
        life: 60,
        maxLife: 60,
        vx: (Math.random() - 0.5) * 2,
        vy: -2,
        color: this.combo > 1 ? '#d97706' : '#10b981'
      }
      this.particles.push(particle)
    },
    
    /**
     * 创建特殊粒子效果
     */
    createSpecialParticle(x, y) {
      for (let i = 0; i < 8; i++) {
        const angle = (i / 8) * Math.PI * 2
        const particle = {
          x: x * this.gridSize + this.gridSize / 2,
          y: y * this.gridSize + this.gridSize / 2,
          text: '★',
          life: 40,
          maxLife: 40,
          vx: Math.cos(angle) * 3,
          vy: Math.sin(angle) * 3,
          color: `hsl(${Math.random() * 360}, 60%, 60%)`
        }
        this.particles.push(particle)
      }
    },
    
    /**
     * 更新粒子效果
     */
    updateParticles() {
      this.particles = this.particles.filter(particle => {
        particle.x += particle.vx
        particle.y += particle.vy
        particle.vy += 0.1 // 重力
        particle.life--
        return particle.life > 0
      })
    },
    
    /**
     * 初始化音频上下文
     */
    initAudioContext() {
      if (!this.audioContext) {
        try {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
          console.log('音频上下文初始化成功')
        } catch (e) {
          console.log('音频上下文初始化失败:', e.message)
        }
      }
    },
    
    /**
     * 播放音效
     */
    playSound(type) {
      if (!this.soundEnabled) return
      
      // 这里可以集成真实的音效库，现在用简单的提示音代替
      const frequencies = {
        eat: 800,
        specialEat: 1200,
        gameOver: 200,
        newRecord: 1000,
        start: 600,
        click: 400
      }
      
      try {
        // 创建或复用AudioContext
        if (!this.audioContext) {
          this.audioContext = new (window.AudioContext || window.webkitAudioContext)()
        }
        
        // 如果AudioContext被暂停，尝试恢复
        if (this.audioContext.state === 'suspended') {
          this.audioContext.resume()
        }
        
        const oscillator = this.audioContext.createOscillator()
        const gainNode = this.audioContext.createGain()
        
        oscillator.connect(gainNode)
        gainNode.connect(this.audioContext.destination)
        
        oscillator.frequency.setValueAtTime(frequencies[type] || 400, this.audioContext.currentTime)
        gainNode.gain.setValueAtTime(0.1, this.audioContext.currentTime)
        gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.1)
        
        oscillator.start(this.audioContext.currentTime)
        oscillator.stop(this.audioContext.currentTime + 0.1)
        
        console.log(`播放音效: ${type}`)
      } catch (e) {
        console.log(`音效播放失败: ${e.message}`)
      }
    },
    
    /**
     * 格式化时间显示
     */
    formatTime(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    },
    
    /**
     * 关闭游戏结束弹窗
     */
    closeGameOver() {
      this.gameOver = false
    }
  }
}
</script>

<style scoped>
.snake-game-container {
  max-width: 900px;
  margin: 0 auto;
  padding: 20px;
  background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
  border-radius: 20px;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.05);
  color: #334155;
}

.game-canvas-container {
  display: flex;
  justify-content: center;
  position: relative;
}

.canvas-wrapper {
  position: relative;
  border-radius: 15px;
  overflow: hidden;
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

canvas {
  cursor: pointer;
  display: block;
  background: #f8fafc;
}

canvas:focus {
  outline: 2px solid #4facfe;
  outline-offset: 2px;
}

.card {
  background: rgba(255, 255, 255, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 15px;
  border: 1px solid rgba(226, 232, 240, 0.5);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

@keyframes bounce-in {
  0% {
    transform: scale(0.3) rotate(6deg);
    opacity: 0;
  }
  50% {
    transform: scale(1.05);
  }
  70% {
    transform: scale(0.9);
  }
  100% {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-bounce-in {
  animation: bounce-in 0.6s ease-out;
}

@media (max-width: 768px) {
  .snake-game-container {
    padding: 15px;
    max-width: 95%;
  }
  
  .canvasWidth {
    width: 100%;
    max-width: 400px;
  }
  
  .canvasHeight {
    height: auto;
  }
}

@media (max-width: 480px) {
  .snake-game-container {
    padding: 10px;
  }
  
  .canvasWidth {
    max-width: 320px;
  }
}
</style>