<script setup lang='ts'>
import { onMounted, ref, provide } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import { useScroll } from './hooks/useScroll'
import "vue3-pdf-app/dist/icons/main.css"
import Requirement from '@/components/FileDisplay/Requirement.vue'
import StepIndicator from '../components/StepIndicator/StepIndicator.vue'
import { Promotion } from '@element-plus/icons-vue'
import { CirclePlus } from '@element-plus/icons-vue'
import { el } from 'element-plus/es/locale/index.mjs'
import { file } from 'jszip'
import axios from 'axios'

// import侧边文件展示组件
import CourseIntroduction from '@/components/FileDisplay/CourseIntroduction.vue'
import LectureNote from '@/components/FileDisplay/LectureNote.vue'
import LessonPlan from '@/components/FileDisplay/LessonPlan.vue'
import PPT from '@/components/FileDisplay/PPT.vue'
import Outline from '@/components/FileDisplay/Outline.vue'
import DigitalHuman from '@/components/FileDisplay/DigitalHuman.vue'



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
let chatDemoStep = ref(0)

// 记录当前文件列表
// let fileList = ref<[string[]]>([[]])
let fileList1 = ref<string[]>([])
let fileList2 = ref<string[]>([])
let fileList3 = ref<string[]>([])
let fileList4 = ref<string[]>([])
let fileList5 = ref<string[]>([])



// Conversation panel toggle control
let showTab = ref<string>("nav-tab-chat")
// let tabWidth = ref<string>("3000px")



// 步骤切换
const currentStep = ref(0);
const currentMaxStep = ref(0)
const handleStepChange = (newStep: number) => {
  currentStep.value = newStep
}

const handleMaxStepChange = (newStep: number) => {
  currentMaxStep.value = newStep
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
  console.log('对话列表为空，创建新对话')
  uuid = Date.now().toString()

  // Initialize empty conversation
  if (!conversations) {
    handleAdd()








  } else {
    // 如果有历史记录，获取最后一次对话
    let lastConversation = conversationList.value[conversationList.value.length - 1]
    uuid = lastConversation.uuid

    let messages = window.localStorage.getItem(uuid + 'messages')
    if (messages) {
      messageList.value = JSON.parse(messages)
    }

    // 导航到'Chat'页面
    router.push({ name: 'Chat', params: { uuid } })
  }
} else {
  // 加载当前对话
  let messages = window.localStorage.getItem(uuid + 'messages')

  let fileList11 = window.localStorage.getItem(uuid + 'fileList1')
  let fileList22 = window.localStorage.getItem(uuid + 'fileList2')
  let fileList33 = window.localStorage.getItem(uuid + 'fileList3')
  let fileList44 = window.localStorage.getItem(uuid + 'fileList4')
  let fileList55 = window.localStorage.getItem(uuid + 'fileList5')
  if (messages) {
    messageList.value = JSON.parse(messages)

  }
  if (fileList11) {
    fileList1.value = JSON.parse(fileList11)
  }
  if (fileList22) {
    fileList2.value = JSON.parse(fileList22)
  }
  if (fileList33) {
    fileList3.value = JSON.parse(fileList33)
  }
  if (fileList44) {
    fileList4.value = JSON.parse(fileList44)
  }
  if (fileList55) {
    fileList5.value = JSON.parse(fileList55)
  }
  
  // fileList1.value = JSON.parse(fileList11)
    // fileList2.value = JSON.parse(fileList22)
    // fileList3.value = JSON.parse(fileList33)
    // fileList4.value = JSON.parse(fileList44)
    // fileList5.value = JSON.parse(fileList55)

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

  fileList1.value = []
  fileList2.value = []
  fileList3.value = []
  fileList4.value = []
  fileList5.value = []

  currentStep.value = 0
  currentMaxStep.value = 0
  chatDemoStep.value = 0


  // 保存当前会话到本地存储
  window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))
  window.localStorage.setItem(uuid + 'messages', JSON.stringify(messageList.value))
  window.localStorage.setItem(uuid + 'fileList1', JSON.stringify(fileList1.value))
  window.localStorage.setItem(uuid + 'fileList2', JSON.stringify(fileList2.value))
  window.localStorage.setItem(uuid + 'fileList3', JSON.stringify(fileList3.value))
  window.localStorage.setItem(uuid + 'fileList4', JSON.stringify(fileList4.value))
  window.localStorage.setItem(uuid + 'fileList5', JSON.stringify(fileList5.value))

  window.localStorage.setItem(uuid + 'currentStep', JSON.stringify(currentStep.value))
  window.localStorage.setItem(uuid + 'currentMaxStep', JSON.stringify(currentMaxStep.value))
  window.localStorage.setItem(uuid + 'chatDemoStep', JSON.stringify(chatDemoStep.value))



}

// 控制菜单的显示和隐藏
function handleMenu() {
  console.log("handleMenu-------------------------------------")
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

  console.log("handleSwitch-------------------------------------")
  uuid = selectedUuid
  console.log(uuid)

  // Reset message record of the new conversation
  let messages = window.localStorage.getItem(selectedUuid + 'messages')

  let fileList11 = window.localStorage.getItem(selectedUuid + 'fileList1')
  let fileList22 = window.localStorage.getItem(selectedUuid + 'fileList2')
  let fileList33 = window.localStorage.getItem(selectedUuid + 'fileList3')
  let fileList44 = window.localStorage.getItem(selectedUuid + 'fileList4')
  let fileList55 = window.localStorage.getItem(selectedUuid + 'fileList5')

  let currentStep1 = window.localStorage.getItem(selectedUuid + 'currentStep')
  let currentMaxStep1 = window.localStorage.getItem(selectedUuid + 'currentMaxStep')
  let chatDemoStep1 = window.localStorage.getItem(selectedUuid + 'chatDemoStep')

  if (messages) {
    messageList.value = JSON.parse(messages)

  } else {
    messageList.value = []
  }
  
  if (fileList11) {
    fileList1.value = JSON.parse(fileList11)
  } else {
    fileList1.value = []
  }

  if (fileList22) {
    fileList2.value = JSON.parse(fileList22)
  } else {
    fileList2.value = []
  }

  if (fileList33) {
    fileList3.value = JSON.parse(fileList33)
  } else {
    fileList3.value = []
  }

  if (fileList44) {
    fileList4.value = JSON.parse(fileList44)
  } else {
    fileList4.value = []
  }

  if (fileList55) {
    fileList5.value = JSON.parse(fileList55)
  } else {
    fileList5.value = []
  }

  if (currentStep1) {
    currentStep.value = JSON.parse(currentStep1)
  } else {
    currentStep.value = 0
  }

  if (currentMaxStep1) {
    currentMaxStep.value = JSON.parse(currentMaxStep1)
  } else {
    currentMaxStep.value = 0
  }

  if (chatDemoStep1) {
    chatDemoStep.value = JSON.parse(chatDemoStep1)
  } else {
    chatDemoStep.value = 0
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

  let message = jsonData.value.target[chatDemoStep.value].message
  if (jsonData.value.target[chatDemoStep.value].next) {
    handleStepChange(currentStep.value + 1)
    handleMaxStepChange(currentMaxStep.value + 1)
  }
  chatDemoStep.value++


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
          "content": jsonData.value.target[chatDemoStep.value].message
        }
      }
    ]
  }

  let ssdata = JSON.parse(JSON.stringify(data))

  setTimeout(() => {
    messageList.value[messageList.value.length - 1].receive = ssdata
    messageList.value[messageList.value.length - 1].loading = false



    if (jsonData.value.target[chatDemoStep.value].step === 1) {
      fileList1.value.push(jsonData.value.target[chatDemoStep.value].file)
      window.localStorage.setItem(uuid + 'fileList1', JSON.stringify(fileList1.value))
    }
    else if (jsonData.value.target[chatDemoStep.value].step === 2) {
      fileList2.value.push(jsonData.value.target[chatDemoStep.value].file)
      window.localStorage.setItem(uuid + 'fileList2', JSON.stringify(fileList2.value))
    }
    else if (jsonData.value.target[chatDemoStep.value].step === 3) {
      fileList3.value.push(jsonData.value.target[chatDemoStep.value].file)
      window.localStorage.setItem(uuid + 'fileList3', JSON.stringify(fileList3.value))
    }
    else if (jsonData.value.target[chatDemoStep.value].step === 4) {
      fileList4.value.push(jsonData.value.target[chatDemoStep.value].file)
      window.localStorage.setItem(uuid + 'fileList4', JSON.stringify(fileList4.value))
    }
    else if (jsonData.value.target[chatDemoStep.value].step === 5) {
      fileList5.value.push(jsonData.value.target[chatDemoStep.value].file)
      window.localStorage.setItem(uuid + 'fileList5', JSON.stringify(fileList5.value))
    }

    chatDemoStep.value++

    buttonDisabled.value = false
    scrollToBottom()

    window.localStorage.setItem(uuid + 'messages', JSON.stringify(messageList.value))
    window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))

    window.localStorage.setItem(uuid + 'currentStep', JSON.stringify(currentStep.value))
    window.localStorage.setItem(uuid + 'currentMaxStep', JSON.stringify(currentMaxStep.value))
    window.localStorage.setItem(uuid + 'chatDemoStep', JSON.stringify(chatDemoStep.value))

  }, 2500);


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
      window.localStorage.removeItem(selectedUuid + 'messages')
      messageList.value = []
    }
  }
}

</script>




<template>
  <div id="layout" class="common-layout">

    <!-- Sidebar -->
    <el-aside class="sidebar border-end py-xl-4 py-3 px-xl-4 px-3" style="width: 340px;">
      <div class="tab-content">
        <!-- Chat Records -->
        <div class="tab-pane fade active show" id="nav-tab-chat" role="tabpanel" v-if="showTab === 'nav-tab-chat'">
          <div class="d-flex justify-content-between align-items-center mb-4">
            <h4 class="mb-0 text-primary">个性化教育内容生成平台</h4>
          </div>
          <div style="display: flex;justify-content: space-between;">
            <div></div>
            <el-button round type="primary" @click="handleAdd" :icon="CirclePlus">新建</el-button>
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
          <StepIndicator @changeStep="handleStepChange" :currentStep="currentStep" :currentMaxStep="currentMaxStep"></StepIndicator>
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
                        <el-button circle type="primary" :icon="Promotion" :disabled="buttonDisabled"
                          @click="handleSubmit" />
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
      <div v-else-if="currentStep === 6" style="height: 100%;">
        <DigitalHuman></DigitalHuman>

      </div>
    </div>
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
