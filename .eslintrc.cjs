module.exports = {
  root: true,
  ignorePatterns: [
    'vercel.json',
    'dist/',
    'node_modules/'
  ],
  env: {
    node: true,
    browser: true,
    es2022: true
  },
  extends: [
    'eslint:recommended',
    '@vue/eslint-config-prettier',
    'plugin:vue/vue3-essential'
  ],
  parserOptions: {
    ecmaVersion: 'latest',
    sourceType: 'module'
  },
  rules: {
    // 代码质量规则
    'no-console': 'warn', // 警告使用console语句
    'no-debugger': 'error', // 禁止debugger语句
    'no-unused-vars': 'warn', // 警告未使用的变量
    'no-undef': 'error', // 禁止使用未定义的变量
    'no-duplicate-keys': 'error', // 禁止对象字面量中出现重复的key
    'no-unreachable': 'error', // 禁止在return、throw、continue和break语句之后出现不可达代码
    
    // Vue特定规则
    'vue/multi-word-component-names': 'off', // 允许单词组件名
    'vue/no-unused-components': 'warn', // 警告未使用的组件
    'vue/no-unused-vars': 'warn', // 警告未使用的变量
    'vue/require-v-for-key': 'error', // 要求v-for指令的元素有key属性
    'vue/no-use-v-if-with-v-for': 'error', // 禁止v-if和v-for同时使用
    
    // 代码风格规则
    'indent': ['warn', 2], // 使用2个空格缩进
    'quotes': ['warn', 'single'], // 使用单引号
    'semi': ['warn', 'never'], // 不使用分号
    'comma-dangle': ['warn', 'never'], // 不使用尾随逗号
    'object-curly-spacing': ['warn', 'always'], // 对象大括号内部要有空格
    'array-bracket-spacing': ['warn', 'never'], // 数组方括号内部不要空格
    
    // 最佳实践
    'eqeqeq': 'error', // 要求使用 === 和 !==
    'curly': 'error', // 要求所有控制语句使用一致的括号风格
    'no-eval': 'error', // 禁用 eval()
    'no-implied-eval': 'error', // 禁止使用类似 eval() 的方法
    'no-new-func': 'error', // 禁止使用 Function 构造函数
    'no-script-url': 'error', // 禁止使用 javascript: url
    'prefer-const': 'warn', // 要求使用 const 声明那些声明后不再被修改的变量
    'no-var': 'warn' // 要求使用 let 或 const 而不是 var
  },
  globals: {
    // 定义全局变量
    defineProps: 'readonly',
    defineEmits: 'readonly',
    defineExpose: 'readonly',
    withDefaults: 'readonly'
  }
}