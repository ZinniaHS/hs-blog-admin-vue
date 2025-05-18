<!-- RichEditor.vue -->
<template>
  <div class="editor-container">
    <Toolbar
        style="border-bottom: 1px solid #ccc"
        :editor="editorRef"
        :defaultConfig="toolbarConfig"
        :mode="mode"
    />
    <Editor
        :style="{ height: '500px', overflow: 'auto', width: '100%' }"
        v-model="valueHtml"
        :defaultConfig="editorConfig"
        :mode="mode"
        @onCreated="handleCreated"
    />
  </div>
</template>

<script setup>
import '@wangeditor/editor/dist/css/style.css'
import { ref, shallowRef, watch, onBeforeUnmount, nextTick } from 'vue'
import { Editor, Toolbar } from '@wangeditor/editor-for-vue'
import request from '@/utils/request'

const props = defineProps({
  modelValue: {
    type: String,
    default: '<p>hello</p>'
  }
})

const emit = defineEmits(['update:modelValue'])

// 编辑器实例，必须用 shallowRef
const editorRef = shallowRef()

// 内容 HTML
const valueHtml = ref('')

// 模式
const mode = 'default'

// 配置
const toolbarConfig = {}
const editorConfig = {
  placeholder: '请输入内容...',
  MENU_CONF: {
    uploadImage: {
      server: import.meta.env.VITE_UPLOAD_API,
      fieldName: 'file',
      maxFileSize: 5 * 1024 * 1024,
      allowedFileTypes: ['image/*'],
      customUpload: async (file, insertFn) => {
        try {
          const formData = new FormData()
          formData.append('file', file)

          // 修改这里：正确处理响应并插入图片
          const res = await request.post('/common/upload', formData)
          console.log(res.data)
          // 假设后端返回的数据结构为 { url: 'https://oss.example.com/image.jpg' }
          if (res.data) {
            // 关键点：调用 insertFn 插入图片地址
            insertFn(res.data)
          } else {
            console.error('无效的响应格式', res)
            alert('上传成功但获取图片地址失败')
          }
        } catch (err) {
          console.error('上传失败:', err)
          alert('图片上传失败，请重试')
        }
      }
    }
  }
}

// 组件初始化时，将 modelValue 的值赋给 valueHtml
watch(() => props.modelValue, (val) => {
  valueHtml.value = val
}, { immediate: true })

// 监听 valueHtml 变化，同步更新到 modelValue
watch(() => valueHtml.value, (val) => {
  emit('update:modelValue', val)
})

// 创建编辑器
const handleCreated = (editor) => {
  editorRef.value = editor
}

// 组件销毁时，销毁编辑器
onBeforeUnmount(() => {
  const editor = editorRef.value
  if (editor == null) return

  editor.destroy()
})
</script>

<style scoped>
.editor-container {
  border: 1px solid #ccc;
  border-radius: 4px;
  width: 100%;
  overflow: hidden; /* 新增溢出保护 */
}
</style>