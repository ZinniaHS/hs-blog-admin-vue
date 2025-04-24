<template>
  <div class="layout-container">
    <!--头部导航栏-->
    <div class="h-6" />
    <el-menu
        class="el-menu-demo"
        mode="horizontal"
        background-color="#545c64"
        text-color="#fff"
        active-text-color="#ffd04b"
    >
      <el-menu-item index="1">Processing Center</el-menu-item>
      <el-sub-menu index="2">
        <template #title>Workspace</template>
        <el-menu-item index="2-1">item one</el-menu-item>
        <el-menu-item index="2-2">item two</el-menu-item>
        <el-menu-item index="2-3">item three</el-menu-item>
        <el-sub-menu index="2-4">
          <template #title>item four</template>
          <el-menu-item index="2-4-1">item one</el-menu-item>
          <el-menu-item index="2-4-2">item two</el-menu-item>
          <el-menu-item index="2-4-3">item three</el-menu-item>
        </el-sub-menu>
      </el-sub-menu>
      <el-menu-item index="3" disabled>Info</el-menu-item>
      <el-menu-item index="4">Orders</el-menu-item>
    </el-menu>
    <div class="main-layout">
      <!--左侧导航栏-->
      <el-row >
        <el-col :span="24">
          <el-menu
              active-text-color="#ffd04b"
              background-color="#545c64"
              class="sidebar-menu"
              default-active="2"
              text-color="#fff"
              @open="handleOpen"
              @close="handleClose"
          >
            <el-sub-menu index="1">
              <template #title>
                <el-icon><location /></el-icon>
                <span>首页</span>
              </template>
              <el-menu-item index="1-1">系统概览</el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title>
                <el-icon><location /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="2-1">用户信息</el-menu-item>
              <el-menu-item index="2-2">权限管理</el-menu-item>
            </el-sub-menu>
            <el-menu-item index="3" @click="router.push('../manager/blog')">
              <template #title>
                <el-icon><Notebook /></el-icon>
                <span>博客管理</span>
              </template>
            </el-menu-item>
            <el-sub-menu index="4">
              <template #title>
                <el-icon><location /></el-icon>
                <span>图书模块</span>
              </template>
              <el-menu-item index="4-1" @click="router.push('../manager/book')">
                <template #title>
                  <el-icon><Reading /></el-icon>
                  <span>图书管理</span>
                </template>
              </el-menu-item>
              <el-menu-item index="4-2" @click="router.push('../manager/bookCategory')">
                <template #title>
                  <el-icon><Reading /></el-icon>
                  <span>分类管理</span>
                </template>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="5">
              <template #title>
                <el-icon><location /></el-icon>
                <span>测试</span>
              </template>
              <el-menu-item index="5-1" @click="router.push('../manager/test')">登录测试</el-menu-item>
              <el-menu-item index="5-2">item two</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-col>
      </el-row>
      <!--右侧内容区-->
      <div class="content-wrapper">
        <transition name="slide-fade" mode="out-in">
          <router-view/>
        </transition>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import router from '@/router';
import {
  Document,
  Menu as IconMenu,
  Location,
  Setting,
} from '@element-plus/icons-vue'
const handleOpen = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
const handleClose = (key: string, keyPath: string[]) => {
  console.log(key, keyPath)
}
</script>

<style lang="scss">
.layout-container {
  min-height: 100vh;
}

.main-layout {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
}

.sidebar-menu {
  width: 250px;
  flex-shrink: 0;
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  max-height: calc(100vh - 60px);
  overflow: auto; // 允许整体内容滚动
}

.content{
  flex: 1;
  display: flex;
  flex-direction: column;
  //align-items: center;     /* 水平居中 */
  min-height: calc(100vh - 300px); /* 减去导航栏高度 */
  //width: 500px;
  //height: 300px;
  margin: 20px;
}

/* 滑动动画 */
.slide-fade-enter-active {
  transition: all 0.3s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from {
  transform: translateX(30px);
  opacity: 0;
}

.slide-fade-leave-to {
  transform: translateX(-30px);
  opacity: 0;
}

.router-view {
  display: block;
  position: relative;
  will-change: transform;
}

</style>