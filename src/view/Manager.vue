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
      <el-menu-item index="1" @click="router.push({ name: 'home' })">
        <img
            style="width: 40px"
            src="../statics/images/brand.jpg"
            alt="hs-blog"
        />
        <span class="top-nav-title">hs-blog 后台管理系统</span>
      </el-menu-item>
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
                <el-icon><House /></el-icon>
                <span>首页</span>
              </template>
              <el-menu-item index="1-1" @click="router.push({ name: 'home' })">
                <template #title>
                  <el-icon><Histogram /></el-icon>
                  <span>系统概览</span>
                </template>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2">
              <template #title>
                <el-icon><User /></el-icon>
                <span>用户管理</span>
              </template>
              <el-menu-item index="2-1" @click="router.push({ name: 'user' })">
                <template #title>
                  <el-icon><User /></el-icon>
                  <span>用户信息</span>
                </template>
              </el-menu-item>
<!--              <el-menu-item index="2-2">-->
<!--                <template #title>-->
<!--                  <el-icon><Key /></el-icon>-->
<!--                  <span>权限管理</span>-->
<!--                </template>-->
<!--              </el-menu-item>-->
            </el-sub-menu>
            <el-sub-menu>
              <template #title>
                <el-icon><Notebook /></el-icon>
                <span>博客模块</span>
              </template>
              <el-menu-item index="3-1" @click="router.push({ name: 'blog' })">
                <template #title>
                  <el-icon><Notebook /></el-icon>
                  <span>博客管理</span>
                </template>
              </el-menu-item>
              <el-menu-item index="3-2" @click="router.push({ name: 'blogCategory' })">
                <template #title>
                  <el-icon><More /></el-icon>
                  <span>分类管理</span>
                </template>
              </el-menu-item>
            </el-sub-menu>

            <el-sub-menu index="4">
              <template #title>
                <el-icon><Reading /></el-icon>
                <span>图书模块</span>
              </template>
              <el-menu-item index="4-1" @click="router.push({ name: 'book' })">
                <template #title>
                  <el-icon><Reading /></el-icon>
                  <span>图书管理</span>
                </template>
              </el-menu-item>
              <el-menu-item index="4-2" @click="router.push({ name: 'bookCategory' })">
                <template #title>
                  <el-icon><More /></el-icon>
                  <span>分类管理</span>
                </template>
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="5">
              <template #title>
                <el-icon><location /></el-icon>
                <span>测试</span>
              </template>
              <el-menu-item index="5-1" @click="router.push({ name: 'test' })">登录测试</el-menu-item>
              <el-menu-item index="5-2">item two</el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-col>
      </el-row>
      <!--右侧内容区-->
      <div class="content-wrapper">
        <transition name="page-fade" mode="out-in">
          <router-view />
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

.top-nav-title{
  margin-left: 20px;
}

.layout-container {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.main-layout {
  display: flex;
  flex: 1;
  min-height: calc(100vh - 60px);
  /* 让内容区高度自适应 */
}

.sidebar-menu {
  width: 250px;
  height: 100%;
  min-height: calc(100vh - 60px); /* 60px为顶部nav高度 */
  flex-shrink: 0;
  border-right: 1px solid #eee;
  /* 确保左侧占满高度 */
}

.content-wrapper {
  flex: 1;
  display: flex;
  flex-direction: column;
  min-height: 0; // 让flex布局自适应
  background: #f7f7f7;
  overflow: auto;
  position: relative;
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
.page-fade-enter-active, .page-fade-leave-active {
  transition: opacity 0.25s, transform 0.25s;
}
.page-fade-enter-from, .page-fade-leave-to {
  opacity: 0;
  transform: translateY(10px);
}
.page-fade-leave-from, .page-fade-enter-to {
  opacity: 1;
  transform: translateY(0);
}

.router-view {
  display: block;
  position: relative;
  will-change: transform;
}

</style>