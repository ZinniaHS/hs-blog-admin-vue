<template>
  <el-container class="login-container">
    <el-main>
      <el-card class="login-card">
        <h2>后台管理系统</h2>
        <el-form :model="form" :rules="rules" ref="formRef">
          <el-form-item prop="username">
            <el-input v-model="form.username" placeholder="用户名">
              <template #prefix>
                <el-icon><User /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item prop="password">
            <el-input v-model="form.password" type="password" placeholder="密码">
              <template #prefix>
                <el-icon><Lock /></el-icon>
              </template>
            </el-input>
          </el-form-item>

          <el-form-item>
            <el-button type="primary" :loading="loading" @click="handleLogin" style="width: 100%">
              {{ loading ? '登录中...' : '登录' }}
            </el-button>
          </el-form-item>
        </el-form>
      </el-card>
    </el-main>
  </el-container>
</template>

<script setup>
import { ref, reactive } from 'vue'
import axios from '@/utils/request'
import { ElMessage } from 'element-plus'
import "@element-plus/icons-vue";
import { User, Lock } from '@element-plus/icons-vue'
import request from '@/utils/request'
import router from '@/router';

const formRef = ref()
const loading = ref(false)

const form = ref({
  username: '',
  password: ''
})

const rules = reactive({
  username: [{ required: true, message: '请输入用户名', trigger: 'blur' }],
  password: [{ required: true, message: '请输入密码', trigger: 'blur' }]
})

const handleLogin = async () => {
  try {
    await formRef.value.validate()
    loading.value = true

    const res = await request.post('/admin/login', {
      username: form.value.username,
      password: form.value.password,
    })
    console.log(res)
    localStorage.setItem('token', res.data)
    ElMessage.success('登录成功')
    // 跳转到原请求页面或首页
    const redirect = router.currentRoute.value.query.redirect || '/manager/home';
    router.push(redirect);
  } catch (error) {
    if (error.response?.data?.msg) {
      ElMessage.error(error.response.data.msg)
    } else {
      ElMessage.error('登录失败，请重试')
    }
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
html, body {
  margin: 0;
  height: 100%;
}

.login-container {
  height: 100vh;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f0f2f5;
}

.el-main {
  width: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.login-card {
  width: 400px;
}

h2 {
  margin-bottom: 30px;
  color: #333;
}
</style>