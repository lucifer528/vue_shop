module.exports = {
  root: true,
  env: {
    node: true
  },
  extends: [
    'plugin:vue/essential',
    '@vue/standard'
  ],
  parserOptions: {
    parser: 'babel-eslint'
  },
  rules: {
    'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
    'space-before-function-paren': 0,
    'eol-last': 0,
    'no-trailing-spaces': 0,
    'vue/no-unused-vars': 0, // 定义了值但是没使用过.,要不改成1.warni
    'camelcase': 0
  }
}
