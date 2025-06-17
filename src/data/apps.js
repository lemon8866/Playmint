/**
 * 应用数据配置
 * 定义所有Web App和Web Game的信息
 */

/**
 * 应用类型枚举
 */
export const APP_TYPES = {
  TOOL: 'tool',        // 工具类应用
  GAME: 'game',        // 游戏类应用
  AI: 'ai',           // AI相关应用
  CREATIVE: 'creative' // 创意类应用
}



/**
 * 应用文件夹配置
 * 根据应用类型确定组件所在文件夹
 */
export const APP_FOLDERS = {
  [APP_TYPES.TOOL]: 'webapps',
  [APP_TYPES.AI]: 'webapps',
  [APP_TYPES.CREATIVE]: 'webapps',
  [APP_TYPES.GAME]: 'webgames'
}

/**
 * 动态导入应用组件
 * @param {string} componentName - 组件名称
 * @param {string} type - 应用类型
 * @returns {Promise} 组件模块
 */
export async function importAppComponent(componentName, type) {
  const folder = APP_FOLDERS[type]
  if (!folder) {
    throw new Error(`未知的应用类型: ${type}`)
  }
  
  try {
    // 动态导入组件
    const module = await import(`../components/${folder}/${componentName}.vue`)
    return module
  } catch (error) {
    throw new Error(`无法加载组件 ${componentName}: ${error.message}`)
  }
}

/**
 * 应用数据列表
 */
export const APPS_DATA = [
  {
    id: 'color-palette-generator',
    name: '调色板生成器',
    description: '智能生成和谐的颜色搭配方案，支持多种色彩理论',
    icon: '🎨',
    type: APP_TYPES.TOOL,
    tags: ['设计', '颜色', '工具'],
    features: ['智能配色', '色彩理论', '导出功能'],
    component: 'ColorPaletteGenerator',
    route: '/app/color-palette-generator'
  },
  {
    id: 'password-generator',
    name: '密码生成器',
    description: '生成安全可靠的密码，支持多种复杂度设置',
    icon: '🔐',
    type: APP_TYPES.TOOL,
    tags: ['安全', '密码', '工具'],
    features: ['安全算法', '自定义规则', '强度检测'],
    component: 'PasswordGenerator',
    route: '/app/password-generator'
  },
  {
    id: 'color-echo',
    name: '色彩回声',
    description: '点击一个颜色，它会"回应"一个颜色，一来一回构建调色板',
    icon: '🎵',
    type: APP_TYPES.CREATIVE,
    tags: ['设计', '颜色', '创意', '互动'],
    features: ['色彩对话', '挑战模式', '渐变生成', '调色板导出'],
    component: 'ColorEcho',
    route: '/app/color-echo'
  },
  {
    id: 'snake-game',
    name: '贪吃蛇',
    description: '经典贪吃蛇游戏，支持多种难度和音效',
    icon: '🐍',
    type: APP_TYPES.GAME,
    tags: ['游戏', '经典', '休闲'],
    features: ['多难度选择', '音效支持', '历史最高分', '流畅操作'],
    component: 'SnakeGame',
    route: '/webgames/snake'
  },
  {
    id: 'blob-land',
    name: '果冻星球',
    description: '果冻星球 - 创造可爱的果冻生命体，观察它们的互动与演化',
    icon: '🧬',
    type: APP_TYPES.GAME,
    tags: ['创意', '模拟', '互动', '可爱'],
    features: ['果冻生命体编辑器', '智能行为模拟', '物理引擎', '沙盒观察', '导出分享'],
    component: 'BlobLand',
    route: '/webgames/blob-land'
  }
]

/**
 * 根据ID获取应用信息
 * @param {string} id - 应用ID
 * @returns {Object|null} 应用信息
 */
export function getAppById(id) {
  const app = APPS_DATA.find(app => app.id === id)
  return app || null
}

/**
 * 根据类型获取应用列表
 * @param {string} type - 应用类型
 * @returns {Array} 应用列表
 */
export function getAppsByType(type) {
  const apps = APPS_DATA.filter(app => app.type === type)
  return apps
}



/**
 * 获取所有应用类型
 * @returns {Array} 类型列表
 */
export function getAllAppTypes() {
  const types = [...new Set(APPS_DATA.map(app => app.type))]
  return types
}