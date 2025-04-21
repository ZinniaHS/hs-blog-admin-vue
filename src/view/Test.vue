<template>
  <el-card>
    <div style="margin: 20px">
      <el-form
          :label-position="'top'"
          label-width="100px"
          :model="formLabelAlign"
          style="max-width: 460px"
      >
        <el-form-item label="username">
          <el-input v-model="data.username" />
        </el-form-item>
        <el-form-item label="password">
          <el-input v-model="data.password" />
        </el-form-item>
      </el-form>
      <div style="margin: 20px">
        <el-button type="primary" @click="login">login</el-button>
      </div>
    </div>
  </el-card>
</template>

<script lang="ts" setup>
import { reactive, ref } from 'vue'
import request from '@/utils/request'

const data = reactive({
  username: '',
  password: '',
})
const login = () => {
  console.log(data)
  request.post('/login',data).then((res) => {
    console.log(res)
  })
}

</script>