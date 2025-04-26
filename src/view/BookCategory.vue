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
          <div class="category-header" @click="toggleExpand(parent)">
            <h3>{{ parent.name }}</h3>
            <el-icon :size="18" :class="['expand-icon', parent.expanded ? 'expanded' : '']">
              <!-- 这里很奇怪，应该是ArrowUpBold，但是这样的话是向右的箭头  -->
              <ArrowLeftBold v-if="parent.expanded" />
              <ArrowDownBold v-else />
            </el-icon>
            <div class="header-actions">
              <el-button type="text" @click.stop="openRootEditDialog(parent)">编辑</el-button>
            </div>
            <div class="header-actions">
              <el-button type="text" danger @click.stop="deleteCategory(parent)">删除</el-button>
            </div>
          </div>

          <!-- 使用条件渲染控制显示 -->
          <div v-show="parent.expanded" class="children-container">
            <div v-for="child in parent.children" :key="child.id" class="child-item">
              <div class="child-content">
                {{ child.name }}
                <div class="child-actions">
                  <el-button type="text" size="small" @click.stop="openChildEditDialog(child)">编辑</el-button>
                  <el-divider direction="vertical" />
                  <el-button type="text" size="small" @click.stop="deleteCategory(child)">删除</el-button>
                </div>
              </div>
            </div>

            <div class="add-section">
              <el-button type="primary" @click="openAddChildDialog(parent)">+ 添加二级分类</el-button>
            </div>
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

    <!-- 一级分类修改弹窗 -->
    <el-dialog
        v-model="rootEditDialogVisible"
        :title="`为【${currentParent?.name}】修改信息`"
        width="500px"
    >
      <el-form :model="rootForm" :rules="rootRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="rootForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="rootEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editCategory(null)">保存</el-button>
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

    <!-- 二级分类修改弹窗 -->
    <el-dialog
        v-model="childEditDialogVisible"
        :title="`为【${currentParent?.name}】修改信息`"
        width="500px"
    >
      <el-form :model="childForm" :rules="childRules" label-width="100px">
        <el-form-item label="分类名称" prop="name">
          <el-input v-model="childForm.name" />
        </el-form-item>
      </el-form>
      <template #footer>
        <span>
          <el-button @click="childEditDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="editCategory('child')">保存</el-button>
        </span>
      </template>
    </el-dialog>

  </div>
</template>

<script lang="ts" setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus'
import request from '@/utils/request'
import {ArrowUpBold, ArrowDownBold, ArrowLeftBold, ArrowRightBold} from "@element-plus/icons-vue";

// 状态管理
const searchKeyword = ref('');
const rootDialogVisible = ref(false);
const rootEditDialogVisible = ref(false);
const childDialogVisible = ref(false);
const childEditDialogVisible = ref(false);
// 当前一级目录值
const currentParent = ref(null);
// 一级目录表单绑定值（添加，修改）
const rootForm = reactive({ name: '' });
// 二级目录表单绑定值（添加，修改）
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
    categoryData.categories = res.data.map(parent => ({
      ...parent,
      expanded: false // 添加展开状态
    }));
  }).catch((err) => {
    console.log(err)
  })
}
// 加载页面时调用
load()
// 表单验证规则
const rootRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '分类名称长度需在1-20个字符', trigger: 'blur' }
  ]
};
const childRules = {
  name: [
    { required: true, message: '请输入分类名称', trigger: 'blur' },
    { min: 1, max: 20, message: '分类名称长度需在1-20个字符', trigger: 'blur' }
  ]
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
// 打开修改一级分类弹窗
const openRootEditDialog = (parent) => {
  currentParent.value = parent;
  rootForm.name = parent.name;
  rootEditDialogVisible.value = true;
};
// 打开修改二级分类弹窗
const openChildEditDialog = (parent) => {
  currentParent.value = parent;
  childForm.name = parent.name;
  childEditDialogVisible.value = true;
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
  // 如果不合规则弹窗
  if(name.length==0 || name.length>20){
    ElMessage({
      message: '请完善信息后提交！',
      type: 'error',
    })
  }else{
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
  }
};
// 修改一级，二级分类
const editCategory = (type) => {
  const category = {
    id: null,
    name: null,
    parentId: null,
  }
  category.id = currentParent.value.id;
  category.parentId = currentParent.value.parentId;
  // 如果是child的话就是二级分类修改，此外是一级分类
  if(type === 'child') {
    category.name = childForm.name;
  }else{
    category.name = rootForm.name;
  }
  // 如果不合规则弹窗
  if(category.name.length==0 || category.name.length>20){
    ElMessage({
      message: '请完善信息后提交！',
      type: 'error',
    })
  }else{
    request.put('/admin/bookCategory',{
      id: category.id,
      name: category.name,
      parentId: category.parentId,
    }).then((res) => {
      ElMessage({
        message: '修改成功！',
        type: 'success',
      })
      childEditDialogVisible.value = false;
      rootEditDialogVisible.value = false;
      load()
    })
  }
}
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

/* 新增样式 */
.category-header {
  cursor: pointer;
  transition: all 0.3s;
  display: flex;
  align-items: center;
  gap: 10px;
}

.expand-icon {
  transition: transform 0.3s;
}

.expand-icon.expanded {
  transform: rotate(90deg);
}

.children-container {
  margin-top: 10px;
  border-top: 1px solid #f5f7fa;
  padding-top: 10px;
}

.child-item {
  margin-bottom: 8px;
  padding: 8px;
  background-color: #fafafa;
  border-radius: 4px;
}

.child-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
}
</style>