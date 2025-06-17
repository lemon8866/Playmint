<template>
  <div class="password-generator p-6">
    <div class="text-center mb-8">
      <h2 class="text-2xl font-bold text-gray-900 mb-2">🔐 密码生成器</h2>
      <p class="text-gray-600">生成安全可靠的密码，保护您的账户安全</p>
    </div>
    
    <!-- 生成的密码显示 -->
    <div class="password-display bg-gray-50 rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">生成的密码</h3>
        <div class="flex items-center gap-2">
          <span class="text-sm text-gray-600">强度:</span>
          <div class="flex items-center gap-1">
            <div 
              v-for="i in 5" 
              :key="i"
              class="w-2 h-2 rounded-full"
              :class="i <= passwordStrength ? getStrengthColor(passwordStrength) : 'bg-gray-300'"
            ></div>
          </div>
          <span class="text-sm font-medium" :class="getStrengthTextColor(passwordStrength)">
            {{ getStrengthText(passwordStrength) }}
          </span>
        </div>
      </div>
      
      <div class="password-container bg-white border border-gray-300 rounded-lg p-4 mb-4">
        <div class="flex items-center gap-3">
          <input 
            v-model="generatedPassword" 
            type="text" 
            readonly 
            class="flex-1 font-mono text-lg bg-transparent border-none outline-none"
            placeholder="点击生成密码按钮"
          >
          <button 
            @click="copyPassword"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="复制密码"
          >
            📋
          </button>
          <button 
            @click="togglePasswordVisibility"
            class="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded transition-colors"
            title="显示/隐藏密码"
          >
            {{ showPassword ? '🙈' : '👁️' }}
          </button>
        </div>
      </div>
      
      <div class="flex gap-3">
        <button 
          @click="generatePassword"
          class="btn-primary flex items-center gap-2"
        >
          <span>🎲</span>
          生成密码
        </button>
        <button 
          @click="generateMultiplePasswords"
          class="btn-secondary flex items-center gap-2"
        >
          <span>📝</span>
          批量生成
        </button>
      </div>
    </div>
    
    <!-- 密码设置 -->
    <div class="password-settings bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <h3 class="text-lg font-semibold text-gray-900 mb-4">密码设置</h3>
      
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
        <!-- 密码长度 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-2">
            密码长度
          </label>
          <div class="flex items-center gap-3 mb-2">
            <input 
              v-model.number="passwordLength" 
              type="number" 
              min="4" 
              max="128" 
              class="w-20 px-3 py-1 border border-gray-300 rounded-md text-center focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              @input="validateAndUpdateLength"
              @blur="validateAndUpdateLength"
            >
            <span class="text-sm text-gray-600">位</span>
          </div>
          <input 
            v-model.number="passwordLength" 
            type="range" 
            min="4" 
            max="128" 
            class="w-full"
            @input="generatePassword"
          >
          <div class="flex justify-between text-xs text-gray-500 mt-1">
            <span>4</span>
            <span>128</span>
          </div>
        </div>
        
        <!-- 字符类型选择 -->
        <div>
          <label class="block text-sm font-medium text-gray-700 mb-3">包含字符类型</label>
          <div class="space-y-2">
            <label class="flex items-center">
              <input 
                v-model="includeUppercase" 
                type="checkbox" 
                class="mr-2"
                @change="generatePassword"
              >
              <span class="text-sm">大写字母 (A-Z)</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="includeLowercase" 
                type="checkbox" 
                class="mr-2"
                @change="generatePassword"
              >
              <span class="text-sm">小写字母 (a-z)</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="includeNumbers" 
                type="checkbox" 
                class="mr-2"
                @change="generatePassword"
              >
              <span class="text-sm">数字 (0-9)</span>
            </label>
            <label class="flex items-center">
              <input 
                v-model="includeSymbols" 
                type="checkbox" 
                class="mr-2"
                @change="generatePassword"
              >
              <span class="text-sm">特殊符号 (!@#$%^&*)</span>
            </label>
          </div>
        </div>
      </div>
      
      <!-- 高级选项 -->
      <div class="mt-6 pt-6 border-t border-gray-200">
        <h4 class="text-md font-medium text-gray-900 mb-3">高级选项</h4>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <label class="flex items-center">
            <input 
              v-model="excludeSimilar" 
              type="checkbox" 
              class="mr-2"
              @change="generatePassword"
            >
            <span class="text-sm">排除相似字符 (0, O, l, 1, I)</span>
          </label>
          <label class="flex items-center">
            <input 
              v-model="excludeAmbiguous" 
              type="checkbox" 
              class="mr-2"
              @change="generatePassword"
            >
            <span class="text-sm">排除歧义字符 ({}, [], (), /\)</span>
          </label>
        </div>
      </div>
    </div>
    
    <!-- 批量生成结果 -->
    <div v-if="multiplePasswords.length > 0" class="multiple-passwords bg-white border border-gray-200 rounded-lg p-6 mb-6">
      <div class="flex items-center justify-between mb-4">
        <h3 class="text-lg font-semibold text-gray-900">批量生成结果</h3>
        <button 
          @click="exportPasswords"
          class="btn-outline text-sm flex items-center gap-1"
        >
          <span>💾</span>
          导出
        </button>
      </div>
      
      <div class="space-y-2 max-h-64 overflow-y-auto">
        <div 
          v-for="(password, index) in multiplePasswords" 
          :key="index"
          class="flex items-center gap-3 p-3 bg-gray-50 rounded border"
        >
          <span class="text-sm text-gray-500 w-8">{{ index + 1 }}.</span>
          <input 
            :value="password" 
            type="text" 
            readonly 
            class="flex-1 font-mono text-sm bg-transparent border-none outline-none"
          >
          <button 
            @click="copyToClipboard(password)"
            class="p-1 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
            title="复制"
          >
            📋
          </button>
        </div>
      </div>
    </div>
    
    <!-- 密码安全建议 -->
    <div class="security-tips bg-blue-50 rounded-lg p-6">
      <h3 class="text-lg font-semibold text-blue-900 mb-3">🛡️ 密码安全建议</h3>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
        <div>
          <h4 class="font-medium mb-2">密码强度要求</h4>
          <ul class="space-y-1">
            <li>• 长度至少12位字符</li>
            <li>• 包含大小写字母</li>
            <li>• 包含数字和特殊符号</li>
            <li>• 避免使用个人信息</li>
          </ul>
        </div>
        <div>
          <h4 class="font-medium mb-2">使用建议</h4>
          <ul class="space-y-1">
            <li>• 每个账户使用不同密码</li>
            <li>• 定期更换重要账户密码</li>
            <li>• 使用密码管理器</li>
            <li>• 启用双因素认证</li>
          </ul>
        </div>
      </div>
    </div>
    
    <!-- 复制成功提示 -->
    <div 
      v-if="showCopySuccess" 
      class="fixed bottom-4 right-4 bg-green-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up"
    >
      ✅ 密码已复制到剪贴板
    </div>

    <!-- 错误消息提示 -->
    <div 
      v-if="showError" 
      class="fixed bottom-4 left-4 bg-red-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up"
    >
      ❌ {{ errorMessage }}
    </div>

    <!-- 成功消息提示 -->
    <div 
      v-if="showSuccess" 
      class="fixed bottom-4 left-1/2 transform -translate-x-1/2 bg-blue-500 text-white px-4 py-2 rounded-lg shadow-lg animate-slide-up"
    >
      ✅ {{ successMessage }}
    </div>
  </div>
</template>

<script>
export default {
  name: 'PasswordGenerator',
  data() {
    return {
      generatedPassword: '',
      passwordLength: 16,
      includeUppercase: true,
      includeLowercase: true,
      includeNumbers: true,
      includeSymbols: true,
      excludeSimilar: false,
      excludeAmbiguous: false,
      showPassword: true,
      multiplePasswords: [],
      showCopySuccess: false,
      errorMessage: '',
      successMessage: '',
      showError: false,
      showSuccess: false
    }
  },
  computed: {
    /**
     * 计算密码强度（1-5级）
     */
    passwordStrength() {
      if (!this.generatedPassword) return 0
      
      let score = 0
      const password = this.generatedPassword
      
      // 长度评分
      if (password.length >= 8) score++
      if (password.length >= 12) score++
      if (password.length >= 16) score++
      
      // 字符类型评分
      if (/[a-z]/.test(password)) score++
      if (/[A-Z]/.test(password)) score++
      if (/[0-9]/.test(password)) score++
      if (/[^a-zA-Z0-9]/.test(password)) score++
      
      // 复杂度评分
      if (password.length >= 20) score++
      
      return Math.min(5, Math.max(1, Math.floor(score / 2)))
    },
    
    /**
     * 可用字符集
     */
    characterSet() {
      let chars = ''
      
      if (this.includeUppercase) chars += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
      if (this.includeLowercase) chars += 'abcdefghijklmnopqrstuvwxyz'
      if (this.includeNumbers) chars += '0123456789'
      if (this.includeSymbols) chars += '!@#$%^&*()_+-=[]{}|;:,.<>?'
      
      // 排除相似字符
      if (this.excludeSimilar) {
        chars = chars.replace(/[0Ol1I]/g, '')
      }
      
      // 排除歧义字符
      if (this.excludeAmbiguous) {
        chars = chars.replace(/[{}\[\]\(\)\/\\]/g, '')
      }
      
      return chars
    }
  },
  methods: {
    /**
     * 生成密码
     */
    generatePassword() {
      if (this.characterSet.length === 0) {
        this.showErrorMessage('请至少选择一种字符类型')
        return
      }
      
      let password = ''
      const chars = this.characterSet
      
      // 确保包含每种选中的字符类型
      if (this.includeUppercase && chars.includes('A')) {
        password += this.getRandomChar('ABCDEFGHIJKLMNOPQRSTUVWXYZ')
      }
      if (this.includeLowercase && chars.includes('a')) {
        password += this.getRandomChar('abcdefghijklmnopqrstuvwxyz')
      }
      if (this.includeNumbers && chars.includes('0')) {
        password += this.getRandomChar('0123456789')
      }
      if (this.includeSymbols && chars.includes('!')) {
        password += this.getRandomChar('!@#$%^&*()_+-=[]{}|;:,.<>?')
      }
      
      // 填充剩余长度
      for (let i = password.length; i < this.passwordLength; i++) {
        password += this.getRandomChar(chars)
      }
      
      // 打乱密码字符顺序
      this.generatedPassword = this.shuffleString(password)
    },
    
    /**
     * 批量生成密码
     */
    generateMultiplePasswords() {
      const count = 10
      this.multiplePasswords = []
      
      for (let i = 0; i < count; i++) {
        this.generatePassword()
        if (this.generatedPassword) {
          this.multiplePasswords.push(this.generatedPassword)
        }
      }
      
      if (this.multiplePasswords.length > 0) {
        this.showSuccessMessage(`已批量生成 ${this.multiplePasswords.length} 个密码`)
      }
    },
    
    /**
     * 复制密码到剪贴板
     */
    async copyPassword() {
      if (!this.generatedPassword) {
        this.showErrorMessage('请先生成密码')
        return
      }
      
      await this.copyToClipboard(this.generatedPassword)
    },
    
    /**
     * 复制到剪贴板的通用方法
     */
    async copyToClipboard(text) {
      try {
        await navigator.clipboard.writeText(text)
        this.showCopySuccess = true
        setTimeout(() => {
          this.showCopySuccess = false
        }, 2000)
      } catch (error) {
        this.showErrorMessage('复制失败，请手动复制密码')
      }
    },
    
    /**
     * 切换密码显示/隐藏
     */
    togglePasswordVisibility() {
      this.showPassword = !this.showPassword
      const input = this.$el.querySelector('.password-container input')
      if (input) {
        input.type = this.showPassword ? 'text' : 'password'
      }
    },
    
    /**
     * 导出密码列表
     */
    exportPasswords() {
      if (this.multiplePasswords.length === 0) {
        this.showErrorMessage('没有可导出的密码，请先批量生成密码')
        return
      }
      
      try {
        const content = this.multiplePasswords.join('\n')
        const blob = new Blob([content], { type: 'text/plain' })
        const url = URL.createObjectURL(blob)
        
        const link = document.createElement('a')
        link.href = url
        link.download = `密码列表_${Date.now()}.txt`
        link.click()
        
        URL.revokeObjectURL(url)
        this.showSuccessMessage('密码列表已导出')
      } catch (error) {
        this.showErrorMessage('导出失败，请重试')
      }
    },
    
    /**
     * 获取随机字符
     */
    getRandomChar(chars) {
      return chars.charAt(Math.floor(Math.random() * chars.length))
    },
    
    /**
     * 打乱字符串
     */
    shuffleString(str) {
      const arr = str.split('')
      for (let i = arr.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[arr[i], arr[j]] = [arr[j], arr[i]]
      }
      return arr.join('')
    },
    
    /**
     * 获取强度颜色
     */
    getStrengthColor(strength) {
      const colors = {
        1: 'bg-red-500',
        2: 'bg-orange-500',
        3: 'bg-yellow-500',
        4: 'bg-blue-500',
        5: 'bg-green-500'
      }
      return colors[strength] || 'bg-gray-300'
    },
    
    /**
     * 获取强度文本颜色
     */
    getStrengthTextColor(strength) {
      const colors = {
        1: 'text-red-600',
        2: 'text-orange-600',
        3: 'text-yellow-600',
        4: 'text-blue-600',
        5: 'text-green-600'
      }
      return colors[strength] || 'text-gray-600'
    },
    
    /**
     * 获取强度文本
     */
    getStrengthText(strength) {
      const texts = {
        1: '很弱',
        2: '较弱',
        3: '一般',
        4: '较强',
        5: '很强'
      }
      return texts[strength] || '未知'
    },

    /**
     * 显示错误消息
     */
    showErrorMessage(message) {
      this.errorMessage = message
      this.showError = true
      setTimeout(() => {
        this.showError = false
      }, 3000)
    },

    /**
     * 显示成功消息
     */
    showSuccessMessage(message) {
      this.successMessage = message
      this.showSuccess = true
      setTimeout(() => {
        this.showSuccess = false
      }, 3000)
    },

    /**
     * 验证并更新密码长度
     */
    validateAndUpdateLength() {
      // 确保密码长度在有效范围内
      if (this.passwordLength < 4) {
        this.passwordLength = 4
        this.showErrorMessage('密码长度不能少于4位')
      } else if (this.passwordLength > 128) {
        this.passwordLength = 128
        this.showErrorMessage('密码长度不能超过128位')
      } else if (isNaN(this.passwordLength) || this.passwordLength === '') {
        this.passwordLength = 16
        this.showErrorMessage('请输入有效的数字')
      }
      
      // 重新生成密码
      this.generatePassword()
    }
  },
  mounted() {
    this.generatePassword()
  }
}
</script>

<style scoped>
.password-container input[type="password"] {
  font-family: monospace;
  letter-spacing: 2px;
}
</style>