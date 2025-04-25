<template>
  <div class="category-manager">
    <!-- 操作区 -->
    <el-row class="action-bar" justify="flex-start" align="middle" :gutter="10">
      <!-- 添加一级分类 -->
      <el-col :span="3" class="action-buttons">
        <el-button type="primary" @click="handleAddRoot">添加一级分类</el-button>
      </el-col>
      <!-- 搜索区域 -->
      <el-col :span="16" class="search-section">
        <el-input
            v-model="searchKeyword"
            placeholder="搜索分类"
            prefix-icon="Search"
            class="search-input"
        ></el-input>
      </el-col>
      <el-col :span="3" class="search-buttons">
        <el-button type="primary" @click="searchCategory">搜索</el-button>
      </el-col>
    </el-row>

    <!-- 分类展示区 -->
    <el-row class="category-container">
      <el-col
          v-for="parent in categoryData.categories"
          :key="parent.id"
          :xs="24"
          :sm="12"
          :md="8"
          :lg="6"
          class="category-column"
      >
        <div class="category-card">
          <div class="category-header">
            <h3>{{ parent.name }}</h3>
            <div class="header-actions">
              <el-button type="text" danger @click="deleteCategory(parent)">删除</el-button>
            </div>
          </div>

          <el-collapse v-model="parent.expanded">
            <el-collapse-item
                v-for="child in parent.children"
                :key="child.id"
                :title="child.name"
            >
              <div class="child-actions">
                <el-button type="text" size="small" @click="handleEdit(child)">编辑</el-button>
                <el-divider direction="vertical" />
                <el-button type="text" size="small" @click="deleteCategory(child)">删除</el-button>
              </div>
            </el-collapse-item>
          </el-collapse>

          <div class="add-section">
            <el-button type="primary" @click="openAddChildDialog(parent)">+ 添加二级分类</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 一级分类添加弹窗 -->
    <el-dialog
        v-model="rootDialogVisible"
        title="添加一级分类"
        width="500px"
    >
      <el-form :model="rootForm" :rules="rootRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="rootForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="rootDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory(null)">保存</el-button>
        </span>
      </template>
    </el-dialog>

    <!-- 二级分类添加弹窗 -->
    <el-dialog
        v-model="childDialogVisible"
        :title="`为【${currentParent?.name}】添加子分类`"
        width="500px"
    >
      <el-form :model="childForm" :rules="childRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="childForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="childDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="saveCategory('child')">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'

// 状态管理
const searchKeyword = ref('');
const rootDialogVisible = ref(false);
const childDialogVisible = ref(false);
const currentParent = ref(null);
const rootForm = reactive({ name: '' });
const childForm = reactive({ name: '' });
// 分类数据
const categoryData = reactive({
  categories:[]
});
// 查询全部分类
const load = () =>{
  request.get('/admin/bookCategory/all',{
  }).then((res) => {
    console.log(res)
    categoryData.categories = res.data;
  }).catch((err) => {
    console.log(err)
  })
}
// 加载页面时调用
load()
// 表单验证规则
const rootRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};
const childRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};
// 打开添加一级分类弹窗
const handleAddRoot = () => {
  rootForm.name = '';
  rootDialogVisible.value = true;
};
// 打开添加二级分类弹窗
const openAddChildDialog = (parent) => {
  currentParent.value = parent;
  childForm.name = '';
  childDialogVisible.value = true;
};
// 添加一级，二级分类
const saveCategory = (type) => {
  let id = null
  let name = null
  // 如果参数是null表示添加一级分类
  // 如果参数是child则表示添加二级分类
  // currentParent.value即当前一级目录的信息
  if(type === 'child') {
    id = currentParent.value.id
    name = childForm.name;
  }else{
    name = rootForm.name
  }
  console.log(id)
  console.log(name)
  request.post('/admin/bookCategory',{
    parentId: id,
    name: name
  }).then((res) => {
    ElMessage({
      message: '添加成功！',
      type: 'success',
    })
    // 关闭弹窗
    rootDialogVisible.value = false;
    childDialogVisible.value = false;
    // 重新加载页面
    load()
  }).catch((err) => {
    ElMessage({
      message: err,
      type: 'error',
    })
  })
};
// 删除一级，二级分类操作
const deleteCategory = (category) => {
  let level = '一级分类'
  if(category.parentId != null)
    level = '二级分类'
  let categoryName = '【'+category.name+'】';
  ElMessageBox.confirm(
      '确认要删除'+level+categoryName+'吗？',
      '危险操作',
      {
        confirmButtonText: '确认',
        cancelButtonText: '取消',
        type: 'warning',
      }
  ).then(() => {
    request.delete('/admin/bookCategory/delete',{
      params: {
        id: category.id,
        parentId: category.parentId
      }
      }).then((res) => {
        console.log(res)
        if(res.code === 0) {
          ElMessage({
            type: 'error',
            message: res.msg,
          })
          return;
        }
      ElMessage({
        type: 'success',
        message: res.data,
      })
      load()
    })
  }).catch(() => {
    ElMessage({
      type: 'info',
      message: '操作取消',
    })
  })
};
// 查找父级分类
const findParent = (categories, target) => {
  for (const category of categories) {
    if (category.children.includes(target)) return category;
    const found = findParent(category.children, target);
    if (found) return found;
  }
  return null;
};
// 切换展开状态
const toggleExpand = (category) => {
  category.expanded = !category.expanded;
};
</script>

<style scoped>
.category-manager {
  padding: 20px;
}

.action-bar {
  margin-bottom: 20px;
  gap: 8px;
}

.search-input {
  width: 100%;
}

.category-container {
  gap: 20px;
}

.category-card {
  border: 1px solid #ebeef5;
  border-radius: 8px;
  padding: 16px;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
}

.category-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.header-actions {
  display: flex;
  gap: 8px;
}

.child-actions {
  display: flex;
  gap: 8px;
  margin-top: 8px;
  padding-top: 8px;
  border-top: 1px solid #f5f7fa;
}

.add-section {
  margin-top: 16px;
  text-align: right;
}

/* 响应式布局 */
@media (max-width: 768px) {
  .category-container {
    flex-direction: column;
  }
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}
</style>