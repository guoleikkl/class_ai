<script setup lang='ts'>
import { onMounted, ref } from 'vue'
import { useRoute } from 'vue-router'
import { router } from '@/router'
import { useScroll } from './hooks/useScroll'
import "vue3-pdf-app/dist/icons/main.css"
import { encode } from 'gpt-tokenizer'
import CourseIntroduction from '@/components/CourseIntroduction.vue'
import lectureNote from '@/components/LectureNote.vue'
import LessonPlan from '@/components/LessonPlan.vue'
import PPT from '@/components/PPT.vue'
import Outline from '@/components/Outline.vue'
import StepIndicator from '../components/StepIndicator.vue'
const someText = ref('测试文本显示...')
const faqData = ref([])

onMounted(async () => {
  const url_data = new URL('../assets/data.json', import.meta.url);
  const response_data = await fetch(url_data.href)  // 确保路径正确
  const data = await response_data.json()
  someText.value = data.text

  const url_faqs = new URL('../assets/faqs.json', import.meta.url);
  const response_faqs = await fetch(url_faqs.href)  // 确保路径正确 
  faqData.value = await response_faqs.json()
 
  // const url_ans = new URL('../assets/answers.json', import.meta.url);
  // const response_ans = await fetch(url_ans.href)  // 确保路径正确
  // const answers = await response_ans.json()
});
const currentStep = ref(1);
const { scrollRef, scrollToBottom } = useScroll()
// Conversation and PDF preview panel toggle control
let showTab = ref<string>("nav-tab-chat")
let tabWidth = ref<string>("")
// vue3-pdf-app UI configuration
let pdfFile = ref<string>("")
const config = ref<{}>({
  sidebar: true,
  toolbar: {
    toolbarViewerLeft: {
      findbar: true,
      previous: true,
      next: true,
      pageNumber: false,
    },
    toolbarViewerRight: {
      presentationMode: true,
      openFile: false,
      print: false,
      download: false,
      viewBookmark: false,
    },
    toolbarViewerMiddle: {
      zoomOut: true,
      zoomIn: true,
      scaleSelectContainer: true,
    }
  },
})

//页面切换
let activePage = ref('课程介绍')
const handlePageChange = (newPage:string) => {
  activePage.value = newPage
}

// Message input box
const prompt = ref<string>('')

// Loading state and button state
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
      fileName: any;
      fileSize: number;
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

let conversations = window.localStorage.getItem("chatStore")
if (conversations) {
  conversationList.value = JSON.parse(conversations)
}

// Check if new conversation
if (!uuid || uuid === '0') {
  uuid = Date.now().toString()

  // Initialize empty conversation
  if (!conversations) {
    conversationList.value.push({
      title: 'New Chat',
      uuid: uuid,
      isEdit: false,
      createDate: new Date().toLocaleString(),
      lastChatContent: 'Hello I am ChatGPT3.5...',
      active: true
    })
  } else {
    // If has history, get last conversation
    let lastConversation = conversationList.value[conversationList.value.length - 1]
    uuid = lastConversation.uuid

    let messages = window.localStorage.getItem(uuid)
    if (messages) {
      messageList.value = JSON.parse(messages)
    }

    router.push({ name: 'Chat', params: { uuid } })
  }
} else {
  // Load current conversation messages
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

function updateStep(newStep:number) {
  currentStep.value = newStep;
  sendStepMessage(`已进入第 ${newStep} 步`);
}

function nextStep() {
  if (currentStep.value < 4) {
    currentStep.value += 1;
    sendStepMessage(`已进入第 ${currentStep.value} 步`);
  }
}

async function sendStepMessage(message:string) {
  // 这里你可以添加发送消息到聊天的逻辑
  // 例如：
  // messageList.value.push({ content: message, sender: 'system' });
  // scrollToBottom();
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

// Set active conversation
function handleAdd() {
  // Reset the message record of the new conversation
  messageList.value = []

  // Reset the active status of the conversation list
  conversationList.value.forEach((item, index) => {
    item.active = false
  })

  // Initialize an empty conversation
  uuid = Date.now().toString()

  conversationList.value.unshift({
    title: "New Chat",
    uuid: uuid,
    isEdit: false,
    createDate: new Date().toLocaleString(),
    lastChatContent: 'Hello I am ChatGPT3.5...',
    active: true
  })

  // Save the conversation to local storage
  window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))
}

// Menu toggle
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

// Switch conversation
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

// File upload related
var fileName = ref()
var fileSize = ref<number>(0)
var formattedFileSize = ref<string>('0B')
var fileUploadCard = ref<boolean>(false)

var fileContent = ref()


// Handle file upload
function handleUpload(e: Event) {
  const target = e.target as HTMLInputElement;
  if (target.files && target.files[0].size >= 5 * 1024 * 1024) {
    alert('Maximum file size limit is 5MB')
    return
  } else if (!target.files || target.files.length === 0) {
    alert('Please select a file')
    return
  }

  // Set file upload style
  fileName.value = target.files[0].name
  fileSize.value = target.files[0].size
  formatFileSize()

  // Preview PDF
  showTab.value = 'nav-tab-doc'
  tabWidth.value = 'width: 60%'

  pdfFile.value = URL.createObjectURL(target.files[0])

  // Upload file and extract content
  const formData = new FormData()
  formData.append('doc', target.files[0])

  fetch(import.meta.env.VITE_API_UPLOAD, {
    method: 'POST',
    body: formData,
  })
    .then(response => response.text())
    .catch(error => console.error('Error:', error))
    .then(function (docContent) {
      if (typeof docContent !== 'string') {
        alert("Failed to extract file content")
        return
      }

      const tokens = encode(docContent)

      if (tokens.length > 4096) {
        alert("Exceeded maximum token limit of 4096")
        fileName.value = ''
        fileSize.value = 0
        formattedFileSize.value = '0B'
      } else {
        // Set the extracted content
        fileContent.value = docContent

        // Show file upload card
        fileUploadCard.value = true
      }
    })
}

function handleBackChat() {
  showTab.value = 'nav-tab-chat'
  tabWidth.value = ''
}

function handleBackDoc() {
  showTab.value = 'nav-tab-doc'
  tabWidth.value = 'width: 40%'
}

// Format file size in Bytes, KB, MB, GB
function formatFileSize() {
  if (fileSize.value < 1024) {
    formattedFileSize.value = fileSize.value + 'B';
  } else if (fileSize.value < (1024 * 1024)) {
    var temp = fileSize.value / 1024
    formattedFileSize.value = temp.toFixed(2) + 'KB'
  } else if (fileSize.value < (1024 * 1024 * 1024)) {
    var temp = fileSize.value / (1024 * 1024)
    formattedFileSize.value = temp.toFixed(2) + 'MB'
  } else {
    var temp = fileSize.value / (1024 * 1024 * 1024);
    formattedFileSize.value = temp.toFixed(2) + 'GB'
  }
}

// Submit message
function handleSubmit() {
  onConversation()
}

// Stream request to ChatGPT3.5
async function onConversation() {
  let message = prompt.value
  if (!message || message.trim() === '')
    return

  // Clear input box and disable button
  prompt.value = ''
  buttonDisabled.value = true
  fileUploadCard.value = false

  // Send message (for local display, not directly sent to GPT)
  messageList.value.push({
    send: {
      model: "glm-4",
      messages: [
        {
          role: "user",
          content: message,
          fileName: fileName.value,
          fileSize: fileSize.value,
        },
      ],
      temperature: 0.7,
    },
    loading: true,
  });

  scrollToBottom()



  // 查找匹配的问题和答案
  const match = faqData.value.find(faq => faq.question.toLowerCase() === message.toLowerCase());
  // 如果找到匹配的问题
  console.log("找到了：", match)

  // 如果找到匹配的问题
  // if (match) {
  //   messageList.value.push({
  //     receive: {
  //       model: "local-faq",
  //       choices: [{
  //         message: {
  //           content: match.answer
  //         }
  //       }]
  //     },
  //     loading: false
  //   });
  // } else {
  //   // 如果没有找到匹配，返回默认回答
  //   messageList.value.push({
  //     receive: {
  //       model: "local-faq",
  //       choices: [{
  //         message: {
  //           content: "对不起，我无法找到关于这个问题的答案。"
  //         }
  //       }]
  //     },
  //     loading: false
  //   });
  // }

  // scrollToBottom();
  // buttonDisabled.value = false;

  // Stream request to ChatGPT3.5
  try {
    if (fileContent.value) {
      message += ', Uploaded file content: ' + fileContent.value
    }

    let data = {
      "model": "glm-4",
      "messages": [{ "role": "user", "content": message }],
      "temperature": 0.7,
      "stream": true
    }

    console.log("data", data)

    let headers = {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer ' + import.meta.env.VITE_API_KEY,
    }

    console.log("headers", headers)
    console.log("import.meta.env.VITE_APP_URL", import.meta.env.VITE_APP_URL)
 
    // Send request
    let response = await fetch(import.meta.env.VITE_APP_URL, {
      method: 'POST',
      headers: headers,
      body: JSON.stringify(data)
    })

    console.log("response", response)
    // Reset file upload related states immediately after sending to ChatGPT
    fileName.value = ''
    fileSize.value = 0
    formattedFileSize.value = '0B'

    // if (!response.ok) {
    //   throw new Error('Network response was not ok')
    // }
 
    // console.log("response", response)
    // Read the data returned from the stream
    const reader = response.body?.getReader();
    // console.log("reader",reader)
    const textDecoder = new TextDecoder()
    let result = true
    while (reader && result) {
      // Get a chunk
      const { done, value } = await reader.read()

      if (done) {
        console.log('Stream ended')
        result = false

        // Restore button state
        buttonDisabled.value = false
        fileContent.value = ''

        // Save current messages
        window.localStorage.setItem(uuid, JSON.stringify(messageList.value))
        window.localStorage.setItem("chatStore", JSON.stringify(conversationList.value))
        break
      }

      console.log('hhhhh')

      // Convert chunk string to array
      let chunkText = textDecoder.decode(value)
      chunkText = chunkText.replace(/data:/g, '')
      // chunkText = 'hellohello'
      let results = chunkText.split('\n\n').filter(Boolean)
      console.log('chunkText', chunkText)
      console.log('results', results)
      // Iterate through the array and process multiple chunks
      for (let i = 0; i < results.length; i++) {
        var chunk = results[i]
        if (chunk.indexOf('DONE') == -1) {
          var chunkData = JSON.parse(chunk)
          console.log('chunkData', chunkData)
          if (chunkData.choices[0].delta.content) {
            if (!messageList.value[messageList.value.length - 1].receive) {
              // If it is the first result, set the state directly
              messageList.value[messageList.value.length - 1].receive = chunkData
              messageList.value[messageList.value.length - 1].loading = false
            } else {
              const lastMessage = messageList.value[messageList.value.length - 1]?.receive;
              if (lastMessage && lastMessage.choices[0].delta.content) {
                lastMessage.choices[0].delta.content += chunkData.choices[0].delta.content;
              }
            }
            scrollToBottom()
          }
        }
      }
    }
  } catch (e) {
    console.log(e)
  }
}

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
      <div class="navigation navbar justify-content-center py-xl-4 py-md-3 py-0 px-3">
      <a href="#" title="ChatGPT-UI" class="brand">
        <svg class="logo" viewBox="0 0 128 128" width="24" height="24" data-v-c0161dce="">
          <path fill="#42b883" d="M78.8,10L64,35.4L49.2,10H0l64,110l64-110C128,10,78.8,10,78.8,10z" data-v-c0161dce="">
          </path>
          <path fill="#35495e" d="M78.8,10L64,35.4L49.2,10H25.6L64,76l38.4-66H78.8z" data-v-c0161dce=""></path>
        </svg>
      </a>
      <div class="nav flex-md-column nav-pills flex-grow-1" role="tablist" aria-orientation="vertical">
        <a class="mb-xl-3 mb-md-2 nav-link active" data-toggle="pill" href="#" role="tab">
          <i class="zmdi zmdi-comment-alt"></i> <!-- Chat -->
        </a>
        <a class="mb-xl-3 mb-md-2 nav-link  d-none d-sm-block flex-grow-1" data-toggle="pill" href="#" role="tab">
          <i class="zmdi zmdi-layers"></i> <!-- Layers -->
        </a>

        <a class="mt-xl-3 mt-md-2 nav-link light-dark-toggle" href="#">
          <i class="zmdi zmdi-brightness-2"></i> <!-- Light/Dark Mode -->
          <input class="light-dark-btn" type="checkbox">
        </a>
        <a class="mt-xl-3 mt-md-2 nav-link d-none d-sm-block" href="#" role="tab">
          <i class="zmdi zmdi-settings"></i> <!-- Settings -->
        </a>
      </div>
      <button type="submit" class="btn sidebar-toggle-btn shadow-sm" @click="handleMenu">
        <i class="zmdi zmdi-menu"></i> <!-- Menu -->
      </button>
    </div>
    <!-- Sidebar -->
      <div class="sidebar border-end py-xl-4 py-3 px-xl-4 px-3" :style="tabWidth">
        <div class="tab-content">
        <!-- Chat Records -->
          <div class="tab-pane fade active show" id="nav-tab-chat" role="tabpanel" v-if="showTab === 'nav-tab-chat'">
            <div class="d-flex justify-content-between align-items-center mb-4">
              <h3 class="mb-0 text-primary">智慧教学</h3>
              <div>
                <button class="btn btn-dark" type="button" @click="handleAdd">新建需求</button>
              </div>
            </div>
            <ul class="chat-list">
              <li class="header d-flex justify-content-between ps-3 pe-3 mb-1">
                <span>RECENT CHATS</span>
              </li>
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
                          :style="[item.active ? 'filter:grayscale(0)' : 'filter:grayscale(1)']"
                          src="../assets/chatgpt.jpg" alt="avatar">
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
      </div>
    <div class="main px-xl-5 px-lg-4 px-3">
      <div class="chat-body">
        <!-- Chat Box Header -->
        <div class="chat-header border-bottom py-xl-4 py-md-3 py-2">
          <StepIndicator @update:page="handlePageChange"></StepIndicator>
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
                      <div class="attachment" v-show="item.send.messages[0].fileName" @click="handleBackDoc">
                        <div class="media mt-2">
                          <div class="avatar me-2">
                            <div class="avatar rounded no-image orange">
                              <i class="zmdi zmdi-collection-pdf"></i>
                            </div>
                          </div>
                          <div class="media-body overflow-hidden">
                            <h6 class="text-truncate mb-0">{{ item.send.messages[0].fileName }}</h6>
                            <span class="file-size">{{ item.send.messages[0].fileSize }}</span>
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
                  <img class="avatar sm rounded-circle" src="../assets/chatgpt.jpg" alt="avatar">
                </div>
                <div class="message-body">
                  <span class="date-time text-muted">{{ item.receive.model }}</span>
                  <div class="message-row d-flex align-items-center">
                    <div class="message-content p-3">
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
                  <img class="avatar sm rounded-circle" src="../assets/chatgpt.jpg" alt="avatar">
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
                    <input type="text" v-model="prompt" class="form-control border-0 pl-0"
                      placeholder="Type your message...">
                    <div class="attachment" v-show="fileUploadCard" @click="handleBackDoc">
                      <div class="media mt-2">
                        <div class="avatar me-2">
                          <div class="avatar rounded no-image orange">
                            <i class="zmdi zmdi-collection-pdf"></i>
                          </div>
                        </div>
                        <div class="media-body overflow-hidden">
                          <h6 class="text-truncate mb-0">{{ fileName }}</h6>
                          <span class="file-size">{{ fileSize }}</span>
                        </div>
                      </div>
                    </div>
                    <div class="input-group-append">
                      <span class="input-group-text border-0">
                        <input type="file" accept="application/pdf" id="fileInput" ref="file" @change="handleUpload"
                          style="display:none">
                        <button class="btn btn-sm btn-link text-muted" data-toggle="tooltip"
                          @click="($refs.file as HTMLInputElement).click()" title="" type="button"
                          data-original-title="Attachment">
                          <i class="zmdi zmdi-attachment font-22"></i>
                        </button>
                      </span>
                    </div>
                    <div class="input-group-append">
                      <span class="input-group-text border-0 pr-0">
                        <button type="submit" class="btn btn-primary" :disabled="buttonDisabled" @click="handleSubmit">
                          <i class="zmdi zmdi-mail-send"></i>
                        </button>
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
      <div v-if="activePage === '课程介绍'"><CourseIntroduction></CourseIntroduction></div>
      <div v-else-if="activePage === '目录大纲'"><Outline></Outline></div>
      <div v-else-if="activePage === '教案'"><LessonPlan></LessonPlan></div>
      <div v-else-if="activePage === '讲义'"><lectureNote></lectureNote></div>
      <div v-else-if="activePage === 'PPT'"><PPT></PPT></div>
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
.chat-right {
  width: 300px;
  /* 右侧固定宽度 */
  /* border-left: 1px solid #ccc; */
  display: flex;
  justify-content: flex-end;
  background-color: aqua;
}
.demo-tabs > .el-tabs__content {
  padding: 32px;
  color: #6b778c;
  font-size: 32px;
  font-weight: 600;
}
</style>
