
## 环境要求
开发版本： Node 18.15.0 + Vue 3

## 项目配置
默认配置存储在“.env”文件中。

```env
VITE_APP_URL = 填写OpenAI的API地址或第三方封装的API,格式示例：https://api.openai.com/v1/chat/completions

VITE_API_KEY= 填写OpenAI的ApiKey, 格式示例: sk-FihjnhGKO14eYLmPpV1234BlbkFJUq1lS0RNenkDsjgGLopx

VITE_API_UPLOAD = 填写解析pdf文件的API地址，格式示例: http://domain.com/upload/pdf
```

## 项目初始化

```sh
npm install
```

### 运行开发环境

```sh
npm run dev
```

### 访问项目
```sh
http://localhost:1003
```

### 构建生产环境

```sh
npm run build
```