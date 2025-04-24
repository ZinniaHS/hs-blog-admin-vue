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
              <el-button type="text" danger @click="handleDeleteRoot(parent)">删除</el-button>
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
                <el-button type="text" size="small" @click="handleDelete(child)">删除</el-button>
              </div>
            </el-collapse-item>
          </el-collapse>

          <div class="add-section">
            <el-button type="primary" @click="openAddChildDialog(parent)">+ 添加二级分类</el-button>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 分页 -->
<!--    <div class="pagination-wrapper">-->
<!--      <el-pagination-->
<!--          v-model:current-page="categoryPageQueryDTO.pageNum"-->
<!--          v-model:page-size="categoryPageQueryDTO.pageSize"-->
<!--          :page-sizes="[5, 10, 20]"-->
<!--          background-->
<!--          layout="total, sizes, prev, pager, next, jumper"-->
<!--          :total="categoryData.total"-->
<!--          @size-change="handleSizeChange"-->
<!--          @current-change="handleCurrentChange"/>-->
<!--    </div>-->

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
          <el-button type="primary" @click="saveRoot">保存</el-button>
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
          <el-button type="primary" @click="saveChild">保存</el-button>
        </span>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue';
import { ElMessage } from 'element-plus';
import request from '@/utils/request'

// 模拟数据
const rootCategories = reactive([
  {
    id: 1,
    name: '文学',
    children: [
      { id: 4, name: '小说', children: [] },
      { id: 5, name: '散文', children: [] }
    ],
    expanded: true
  },
  {
    id: 2,
    name: '科技',
    children: [
      { id: 6, name: '计算机', children: [] },
      { id: 7, name: '自然科学', children: [] }
    ],
    expanded: true
  },
  {
    id: 3,
    name: '历史',
    children: [
      { id: 8, name: '中国古代史', children: [] },
      { id: 9, name: '世界史', children: [] }
    ],
    expanded: true
  },
  {
    id: 4,
    name: '科技',
    children: [
      { id: 6, name: '计算机', children: [] },
      { id: 7, name: '自然科学', children: [] }
    ],
    expanded: true
  },
  {
    id: 5,
    name: '科技',
    children: [
      { id: 6, name: '计算机', children: [] },
      { id: 7, name: '自然科学', children: [] }
    ],
    expanded: true
  },
]);

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
// 分页查询实体
const categoryPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 5,
  keyWord: ''
})

// 分页查询
// const load = () =>{
//   request.get('/admin/bookCategory/page',{
//     params: {
//       pageNum: categoryPageQueryDTO.pageNum,
//       pageSize: categoryPageQueryDTO.pageSize,
//       keyWord: categoryPageQueryDTO.keyWord
//     }
//   }).then((res) => {
//     console.log(res)
//     categoryData.categories = res.data.records
//     categoryData.total = res.data.total
//   }).catch((err) => {
//     console.log(err)
//   })
// }
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

// 选择每页显示多少条记录时，触发分页查询
const handleSizeChange = () =>{
  load()
}
// 点击其他页面的时候触发分页查询
const handleCurrentChange = () =>{
  load()
}

// 表单验证规则
const rootRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};

const childRules = {
  name: [{ required: true, message: '请输入分类名称', trigger: 'blur' }]
};

// 计算属性：过滤分类
const filteredCategories = computed(() => {
  if (!searchKeyword.value) return rootCategories;

  return rootCategories.map(category => {
    const filteredChildren = category.children.filter(child =>
        child.name.includes(searchKeyword.value)
    );
    return {
      ...category,
      children: filteredChildren
    };
  });
});

// 添加一级分类
const handleAddRoot = () => {
  rootForm.name = '';
  rootDialogVisible.value = true;
};

const saveRoot = () => {
  if (!rootForm.name) return;

  const newCategory = {
    id: Date.now(),
    name: rootForm.name,
    children: [],
    expanded: true
  };

  rootCategories.unshift(newCategory);
  ElMessage.success('添加成功');
  rootDialogVisible.value = false;
};

// 打开添加二级分类弹窗
const openAddChildDialog = (parent) => {
  currentParent.value = parent;
  childForm.name = '';
  childDialogVisible.value = true;
};

const saveChild = () => {
  if (!childForm.name) return;

  const newChild = {
    id: Date.now(),
    name: childForm.name,
    children: []
  };

  if (currentParent.value) {
    currentParent.value.children.push(newChild);
    ElMessage.success('添加成功');
  }

  childDialogVisible.value = false;
};

// 删除操作
const handleDeleteRoot = (category) => {
  ElMessage.confirm('确定删除该一级分类及其所有子分类？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const index = rootCategories.findIndex(c => c.id === category.id);
    rootCategories.splice(index, 1);
    ElMessage.success('删除成功');
  });
};

const handleDelete = (category) => {
  ElMessage.confirm('确定删除该分类？', '警告', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    const parent = findParent(rootCategories, category);
    parent.children = parent.children.filter(c => c.id !== category.id);
    ElMessage.success('删除成功');
  });
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