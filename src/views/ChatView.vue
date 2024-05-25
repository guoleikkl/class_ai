<script setup lang='ts'>
import { onMounted, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import { useScroll } from './hooks/useScroll'
import "vue3-pdf-app/dist/icons/main.css"
import CourseIntroduction from '@/components/FileDisplay/CourseIntroduction.vue'
import LectureNote from '@/components/FileDisplay/LectureNote.vue'
import LessonPlan from '@/components/FileDisplay/LessonPlan.vue'
import PPT from '@/components/FileDisplay/PPT.vue'
import Outline from '@/components/FileDisplay/Outline.vue'
import Requirement from '@/components/FileDisplay/Requirement.vue'
import StepIndicator from '../components/StepIndicator/StepIndicator.vue'
import { Promotion } from '@element-plus/icons-vue'
import { el } from 'element-plus/es/locale/index.mjs'
// import jsonData from '../assets/chatDemo.json'
import { file } from 'jszip'


import axios from 'axios'

const jsonData = ref({
  target: [
    {
      "speaker": "User",
      "message": "要求",
      "next": false,
      "file": "",
      "step": 0
    }]
})

async function fetchJsonData() {
  try {
    const response = await fetch('https://personalized-edu-1322695558.cos.ap-beijing.myqcloud.com/demo/chatDemo.json');
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    // jsonData.value = data.conversations;
    jsonData.value.target = data.conversations;
  } catch (error) {
    console.error('Error fetching JSON data:', error);
  }
}

onMounted(() => {
  fetchJsonData();
});



// 滚动到底部
const { scrollRef, scrollToBottom } = useScroll()


// 临时
// 用于记录chatDemo.json中的对话的步骤
let chatDemoStep = 0

// 记录当前文件列表
// let fileList = ref<[string[]]>([[]])
let fileList1 = ref<string[]>([])
let fileList2 = ref<string[]>([])
let fileList3 = ref<string[]>([])
let fileList4 = ref<string[]>([])
let fileList5 = ref<string[]>([])

// 注入fileList
// provide('fileList1', fileList1.value)
// provide('fileList2', fileList2.value)
// provide('fileList3', fileList3.value)
// provide('fileList4', fileList4.value)
// provide('fileList5', fileList5.value)



// Conversation panel toggle control
let showTab = ref<string>("nav-tab-chat")
// let tabWidth = ref<string>("3000px")



// 步骤切换
const currentStep = ref(0);
const handleStepChange = (newStep: number) => {
  currentStep.value = newStep
}

// 输入框的消息
const prompt = ref<string>('')

// button按钮状态
const buttonDisabled = ref<boolean>(false)

// Get uuid from URL params
const route = useRoute()
let { uuid } = route.params as { uuid: string }

interface Conversation {
  title: string;
  uuid: string;
  isEdit: boolean;
  createDate: string;
  lastChatContent: string;
  active: boolean;
}

interface Message {
  send: {
    model: string;
    messages: {
      role: string;
      content: string;
      // fileName: any;
      // fileSize: number;
    }[];
    temperature: number;
  };
  loading: boolean;
  receive?: {
    model: string;
    choices: {
      message?: {
        content: string;
      };
      delta: {
        content: string;
      };
    }[];
  };
}

// Conversation list and message list
var conversationList = ref<Conversation[]>([])
var messageList = ref<Message[]>([]);

// 从浏览器本地存储中获取'chatStore'数据
let conversations = window.localStorage.getItem("chatStore")
if (conversations) {
  conversationList.value = JSON.parse(conversations)
}

// Check if new conversation
// 创建新对话或者加载现有对话
if (!uuid || uuid === '0') {
  uuid = Date.now().toString()

  // Initialize empty conversation
  if (!conversations) {
    // conversations为空，创建新对话
    conversationList.value.push({
      title: '教学助手',
      uuid: uuid,
      isEdit: false,
      createDate: new Date().toLocaleString(),
      lastChatContent: '你好，我是智慧教学助手',
      active: true
    })
  } else {
    // 如果有历史记录，获取最后一次对话
    let lastConversation = conversationList.value[conversationList.value.length - 1]
    uuid = lastConversation.uuid

    let messages = window.localStorage.getItem(uuid)
    if (messages) {
      messageList.value = JSON.parse(messages)
    }

    // 导航到'Chat'页面
    router.push({ name: 'Chat', params: { uuid } })
  }
} else {
  // 加载当前对话
  let messages = window.localStorage.getItem(uuid)
  if (messages) {
    messageList.value = JSON.parse(messages)
  }

  conversationList.value.forEach((item, index) => {
    if (item.uuid == uuid) {
      item.active = true
    } else {
      item.active = false
    }
  })

  scrollToBottom()
}


// 用户发送消息
async function sendStepMessage(message: string) {
  // console.log("sendStepMessage-------------------------------------")
  // 这里你可以添加发送消息到聊天的逻辑

  // 创建消息对象，这里我们假设模型的名字是系统，因为这是一个内部生成的消息
  const messageObject = {
    send: {
      model: "system",
      messages: [{
        role: "system",  // 标记发送者为系统
        content: message
      }],
      temperature: 0  // 因为是系统消息，温度设为0
    },
    loading: false  // 系统消息，没有加载状态
  };

  // 将消息对象添加到消息列表
  messageList.value.push(messageObject);

  // 滚动到聊天底部，确保最新消息可见
  scrollToBottom();
}

// 创建一个新的聊天会话
function handleAdd() {
  // Reset the message record of the new conversation
  messageList.value = []

  // 将所有会话设置为非活动状态
  conversationList.value.forEach((item, index) => {
    item.active = false
  })

  // Initialize an empty conversation
  uuid = Date.now().toString()

  conversationList.value.unshift({
    title: "教学助手",
    uuid: uuid,
    isEdit: false,
    createDate: new Date().toLocaleString(),
    lastChatContent: '你好，我是智慧教学助手',
    active: true
  })

  // 保存当前会话到本地存储
  window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))
}

// 控制菜单的显示和隐藏
function handleMenu() {
  let rootbody = document.getElementById("rootbody")
  if (rootbody) {
    if (rootbody.classList.value == "") {
      rootbody.classList.value = "open-sidebar-menu"
    } else {
      rootbody.classList.value = ""
    }
  }
}

// 切换会话
function handleSwitch(selectedUuid: string) {
  uuid = selectedUuid

  // Reset message record of the new conversation
  let messages = window.localStorage.getItem(selectedUuid)
  if (messages) {
    messageList.value = JSON.parse(messages)
  } else {
    messageList.value = []
  }

  // Reset active status of the conversation list
  conversationList.value.forEach((item, index) => {
    if (item.uuid == selectedUuid) {
      item.active = true
    } else {
      item.active = false
    }
  })

  router.push({ name: 'Chat', params: { uuid } })
}

function handleBackChat() {
  showTab.value = 'nav-tab-chat'
  // tabWidth.value = '300px'
}


// Submit message
function handleSubmit() {
  onConversation()
}



// 提交消息
async function onConversation() {
  let promptMessage = prompt.value
  if (promptMessage.trim() === '') {
    return
  }

  let message = jsonData.value.target[chatDemoStep].message
  if (jsonData.value.target[chatDemoStep].next) {
    handleStepChange(currentStep.value + 1)
  }
  chatDemoStep++


  // Clear input box and disable button
  prompt.value = ''
  buttonDisabled.value = true

  // Send message (for local display, not directly sent to GPT)
  messageList.value.push({
    send: {
      model: "glm-4",
      messages: [
        {
          role: "user",
          content: promptMessage,
        },
      ],
      temperature: 0.7,
    },
    loading: true,
  });

  scrollToBottom()



  // 从json文件中获取AI对话数据
  let data = {
    "id": uuid,
    "created": new Date().toLocaleString(),
    "model": "glm-4",
    "choices": [
      {
        "index": 0,
        "delta": {
          "role": "assistant",
          "content": jsonData.value.target[chatDemoStep].message
        }
      }
    ]
  }

  let ssdata = JSON.parse(JSON.stringify(data))

  setTimeout(() => {
    messageList.value[messageList.value.length - 1].receive = ssdata
    messageList.value[messageList.value.length - 1].loading = false



    if (jsonData.value.target[chatDemoStep].step === 1) {
      fileList1.value.push(jsonData.value.target[chatDemoStep].file)
    }
    else if (jsonData.value.target[chatDemoStep].step === 2) {
      fileList2.value.push(jsonData.value.target[chatDemoStep].file)
    }
    else if (jsonData.value.target[chatDemoStep].step === 3) {
      fileList3.value.push(jsonData.value.target[chatDemoStep].file)
    }
    else if (jsonData.value.target[chatDemoStep].step === 4) {
      fileList4.value.push(jsonData.value.target[chatDemoStep].file)
    }
    else if (jsonData.value.target[chatDemoStep].step === 5) {
      fileList5.value.push(jsonData.value.target[chatDemoStep].file)
    }





    chatDemoStep++

    buttonDisabled.value = false
    scrollToBottom()



  }, 2500);






  // let data = { "id": "8635231172645742753", "created": 1715072859, "model": "glm-4", "choices": [{ "index": 0, "delta": { "role": "assistant", "content": "谢谢" } }] }
  // let ssdata = JSON.parse(JSON.stringify(data))
  // console.log('ssdata', ssdata)

  // Stream request to ChatGPT3.5
  // try {

  //   let data = {
  //     "model": "glm-4",
  //     "messages": [{ "role": "user", "content": message }],
  //     "temperature": 0.7,
  //     "stream": true
  //   }

  //   // console.log("data", data)

  //   let headers = {
  //     'Content-Type': 'application/json',
  //     'Authorization': 'Bearer ' + import.meta.env.VITE_API_KEY,
  //   }

  //   // console.log("headers", headers)
  //   // console.log("import.meta.env.VITE_APP_URL", import.meta.env.VITE_APP_URL)

  //   // Send request
  //   let response = await fetch(import.meta.env.VITE_APP_URL, {
  //     method: 'POST',
  //     headers: headers,
  //     body: JSON.stringify(data)
  //   })

  //   // console.log("response", response)


  //   const reader = response.body?.getReader();
  //   // console.log("reader",reader)
  //   const textDecoder = new TextDecoder()
  //   let result = true
  //   console.log('messageList111', messageList)
  //   while (reader && result) {
  //     // Get a chunk
  //     const { done, value } = await reader.read()

  //     if (done) {
  //       // console.log('Stream ended')
  //       result = false

  //       // Restore button state
  //       buttonDisabled.value = false
  //       // fileContent.value = ''

  //       // Save current messages
  //       window.localStorage.setItem(uuid, JSON.stringify(messageList.value))
  //       window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))
  //       break
  //     }


  //     // Convert chunk string to array
  //     let chunkText = textDecoder.decode(value)
  //     chunkText = chunkText.replace(/data:/g, '')
  //     // chunkText = 'hellohello'
  //     let results = chunkText.split('\n\n').filter(Boolean)
  //     // console.log('chunkText', chunkText)
  //     // console.log('results', results)
  //     // Iterate through the array and process multiple chunks
  //     for (let i = 0; i < results.length; i++) {
  //       var chunk = results[i]
  //       if (chunk.indexOf('DONE') == -1) {
  //         var chunkData = JSON.parse(chunk)
  //         console.log('chunk')
  //         console.log('chunkData', chunkData)
  //         if (chunkData.choices[0].delta.content) {
  //           if (!messageList.value[messageList.value.length - 1].receive) {
  //             // If it is the first result, set the state directly
  //             messageList.value[messageList.value.length - 1].receive = chunkData
  //             // messageList.value[messageList.value.length - 1].receive = ""
  //             messageList.value[messageList.value.length - 1].loading = false
  //           } else {
  //             // console.log('dddddd')
  //             const lastMessage = messageList.value[messageList.value.length - 1]?.receive;
  //             if (lastMessage && lastMessage.choices[0].delta.content) {
  //               lastMessage.choices[0].delta.content += chunkData.choices[0].delta.content;
  //             }
  //           }
  //           scrollToBottom()
  //         }
  //       }
  //     }
  //   }
  //   console.log('messageList2222', messageList)
  // } catch (e) {
  //   console.log(e)
  // }
}

// 删除会话
function handleDele(selectedUuid: string) {
  // Reset the active state of the conversation list
  conversationList.value.forEach((item, index) => {
    if (item.uuid == selectedUuid) {
      conversationList.value.splice(index, 1)

      // Save the conversation to local storage
      window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))
      return false
    }
  })

  // Reset the message records of the new conversation
  if (uuid == selectedUuid) {
    let messages = window.localStorage.getItem(selectedUuid)
    if (messages) {
      window.localStorage.removeItem(selectedUuid)
      messageList.value = []
    }
  }
}


</script>



<template>
  <div id="layout" class="common-layout">

    <!-- Sidebar -->
    <el-aside class="sidebar border-end py-xl-4 py-3 px-xl-4 px-3" style="width: 350px;">
      <!-- <div class="sidebar border-end py-xl-4 py-3 px-xl-4 px-3" :style="tabWidth"> -->
      <div class="tab-content">
        <!-- Chat Records -->
        <div class="tab-pane fade active show" id="nav-tab-chat" role="tabpanel" v-if="showTab === 'nav-tab-chat'">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h3 class="mb-0 text-primary">教育生成系统</h3>

            <div>
              <el-button round  type="primary" @click="handleAdd" :icon="CirclePlus">新建</el-button>
            </div>
          </div>
          <ul class="chat-list">
            <li class="header d-flex justify-content-between ps-3 pe-3 mb-1">
              <span>历史记录</span>
            </li>
            <!-- 会话列表 -->
            <li v-for="(item, index) in conversationList" :class="[item.active ? 'active' : '']"
              @click="handleSwitch(item.uuid)">
              <div class="hover_action">
                <button type="button" class="btn btn-link text-info"><i class="zmdi zmdi-eye"></i></button>
                <button type="button" class="btn btn-link text-danger" @click="handleDele(item.uuid)"><i
                    class="zmdi zmdi-delete"></i></button>
              </div>
              <a href="#" class="card">
                <div class="card-body">
                  <div class="media">
                    <div class="avatar me-3">
                      <span class="status rounded-circle"></span>
                      <img class="avatar rounded-circle"
                        :style="[item.active ? 'filter:grayscale(0)' : 'filter:grayscale(1)']" src="../assets/ai.png"
                        alt="avatar">
                    </div>
                    <div class="media-body overflow-hidden">
                      <div class="d-flex align-items-center mb-1">
                        <h6 class="text-truncate mb-0 me-auto">{{ item.title }}</h6>
                        <p class="small text-muted text-nowrap ms-4 mb-0">{{ item.createDate }}</p>
                      </div>
                      <div class="text-truncate">{{ item.lastChatContent }}</div>
                    </div>
                  </div>
                </div>
              </a>
            </li>
          </ul>
        </div>
        <!-- end Chat Records -->
      </div>
      <!-- </div> -->
    </el-aside>
    <div class="main px-xl-2 px-lg-2 px-2">
      <div class="chat-body">
        <!-- Chat Box Header -->
        <div class="chat-header border-bottom py-xl-4 py-md-3 py-2">
          <StepIndicator @changeStep="handleStepChange" :currentStep="currentStep"></StepIndicator>
        </div>
        <!-- end Chat Box Header -->
        <div class="chat-content" id="scrollRef" ref="scrollRef">
          <div class="container-xxl">
            <ul class="list-unstyled py-4" v-for="(item, index) of messageList">
              <!-- Right Message -->
              <li class="d-flex message right">

                <div class="message-body">
                  <span class="date-time text-muted"></span>
                  <div class="message-row d-flex align-items-center justify-content-end">
                    <div class="message-content border p-3">
                      {{ item.send.messages[0].content }}
                      <div class="attachment">
                        <div class="media mt-2">
                          <div class="media-body overflow-hidden">
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <!-- end Right Message -->
              <!-- Left Message -->
              <li class="d-flex message" v-if="item.receive">
                <div class="mr-lg-3 me-2">
                  <img class="avatar sm rounded-circle" src="../assets/ai.png" alt="avatar">
                </div>
                <div class="message-body">
                  <span class="date-time text-muted">教学助手</span>
                  <div class="message-row d-flex align-items-center">
                    <div class="message-content">
                      <v-md-preview
                        :text="item.receive.choices[0].message ? item.receive.choices[0].message.content : item.receive.choices[0].delta.content"></v-md-preview>
                    </div>
                  </div>
                </div>
              </li>
              <!-- end Left Message -->
              <!-- Loading Message -->
              <li class="d-flex message" v-if="item.loading">
                <div class="mr-lg-3 me-2">
                  <img class="avatar sm rounded-circle" src="../assets/ai.png" alt="avatar">
                </div>
                <div class="message-body">
                  <div class="message-row d-flex align-items-center">
                    <div class="message-content p-3">
                      <div class="wave">
                        <span class="dot"></span>
                        <span class="dot"></span>
                        <span class="dot"></span>
                      </div>
                    </div>
                  </div>
                </div>
              </li>
              <!-- end Loading Message -->
            </ul>
          </div>
        </div>
        <!-- Message Input Box -->
        <div class="chat-footer border-top py-xl-4 py-lg-2 py-2">
          <div class="container-xxl">
            <div class="row">
              <div class="col-12">
                <form @submit.prevent="handleSubmit">
                  <div class="input-group align-items-center">
                    <input type="text" v-model="prompt" class="form-control border-0 pl-0" placeholder="请输入你的问题">
                    <div class="input-group-append">
                      <span class="input-group-text border-0">
                      </span>
                    </div>
                    <div class="input-group-append">
                      <span class="input-group-text border-0 pr-0">
                        <!-- <button type="submit"  :disabled="buttonDisabled"
                          @click="handleSubmit">
                          <i class="zmdi zmdi-mail-send"></i>
                        </button> -->
                        <el-button circle  type="primary" :icon="Promotion" :disabled="buttonDisabled"
                          @click="handleSubmit"/>
                      </span>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
        <!-- end Message Input Box -->
      </div>
    </div>

    <div class="main px-xl-1 px-lg-1 px-1">
      <div v-if="currentStep === 0" style="height: 100%;">
        <Requirement></Requirement>
      </div>
      <div v-if="currentStep === 1" style="height: 100%;">
        <CourseIntroduction :fileList1="fileList1"></CourseIntroduction>
      </div>
      <div v-else-if="currentStep === 2" style="height: 100%;">
        <Outline :fileList2="fileList2"></Outline>
      </div>
      <div v-else-if="currentStep === 3" style="height: 100%;">
        <LessonPlan :fileList3="fileList3"></LessonPlan>
      </div>
      <div v-else-if="currentStep === 4" style="height: 100%;">
        <LectureNote :fileList4="fileList4"></LectureNote>
      </div>
      <div v-else-if="currentStep === 5" style="height: 100%;">
        <PPT :fileList5="fileList5"></PPT>
      </div>
    </div>
    <!-- 后续页面内容可按照实际需求自行添加 -->
    <!-- <el-main><TextDisplay :text="someText" /></el-main> -->
  </div>
</template>

<style scoped>
.chat-layout {
  display: flex;
  height: 100vh;
}

.btn-blue {
  background-color: #0000FF;
  /* 这是蓝色的十六进制代码 */
  border-color: #0000FF;
  color: #FFFFFF;
  /* 这是白色的十六进制代码，用于按钮的文本颜色 */
}

.chat-right {
  width: 300px;
  /* 右侧固定宽度 */
  /* border-left: 1px solid #ccc; */
  display: flex;
  justify-content: flex-end;
  background-color: aqua;
}

.demo-tabs>.el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
