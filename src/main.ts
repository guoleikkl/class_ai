import './assets/material-design-iconic-font.min.css'
import './assets/style.min.css'

// vue-markdown import
import VMdPreview from '@kangc/v-md-editor/lib/preview'
import '@kangc/v-md-editor/lib/style/preview.css'
import githubTheme from '@kangc/v-md-editor/lib/theme/github.js'
import '@kangc/v-md-editor/lib/theme/style/github.css'

// vue-markdown highlightjs
import hljs from 'highlight.js'

VMdPreview.use(githubTheme, {
  Hljs: hljs,
})

import { createApp } from 'vue'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import App from './App.vue'
import router from './router'

const app = createApp(App)
app.use(ElementPlus)
app.use(router)

app.use(VMdPreview)

app.mount('#app')
