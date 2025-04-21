
404

Sorry, request error


<template>
  <el-result title="404" sub-title="Sorry, request error">
    <template #icon>
      <el-image
          src="https://shadow.elemecdn.com/app/element/hamburger.9cf7b091-55e9-11e9-a976-7f4d0b07eef6.png"
      />
    </template>
    <template #extra>
      <el-button type="primary" @click="router.back()">Back</el-button>
    </template>
  </el-result>
</template>

<script setup>
import {reactive} from "vue";
import router from "@/router/index.js";

const data = reactive({
  id: router.currentRoute.value.query.id
})
</script>
