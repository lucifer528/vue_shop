import Vue from 'vue'
import App from './App.vue'
import router from './router'
import './plugins/element.js'
// 导入全局样式表
import './assets/css/global.css'
// 导入字体图标
import './assets/fonts/iconfont.css'
// 导入 treeTable
import TreeTable from 'vue-table-with-tree-grid'
// 导入富文本编辑器
import VueQuillEditor from 'vue-quill-editor'
// require styles 富文本编辑器对应的样式
import 'quill/dist/quill.core.css' // import styles
import 'quill/dist/quill.snow.css' // for snow theme
import 'quill/dist/quill.bubble.css' // for bubble theme

import axios from 'axios'

import moment from 'moment'
Vue.filter('dateFormat', function(dateStr, pattren = 'YYYY-MM-DD HH:mm:ss') {
  return moment(dateStr).format(pattren)
})
axios.defaults.baseURL = 'http://127.0.0.1:8888/api/private/v1/'
axios.interceptors.request.use(config => {
  config.headers.Authorization = window.sessionStorage.getItem('token')
  return config
})
Vue.prototype.$http = axios
// Vue.prototype.$axios = axios
// 这样也行...我上次因为2个都用..就这么挂的,只是引用的时候 this.$axios

Vue.config.productionTip = false

// 官方文档里 用 Use 也行
Vue.component('tree-table', TreeTable)
Vue.use(VueQuillEditor)
new Vue({
  router,
  render: h => h(App)
}).$mount('#app')
