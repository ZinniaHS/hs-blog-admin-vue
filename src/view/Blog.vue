<template>
  <!-- 表格部分 -->
  <div class="blog-container">
    <div class="insertAndDelete">
      <div class="button-group">
        <el-button
            type="danger"
            :disabled="selectedRows.length === 0"
            @selection-change="handleSelectionChange"
            @click="deleteBlog">删除</el-button>
      </div>
      <div class="search-container">
        <el-input
            v-model="searchKeyword"
            placeholder="请输入搜索内容"
            clearable
            @keyup.enter="pageQuery">
          <template #append>
            <el-button :icon="Search" @click="pageQuery" />
          </template>
        </el-input>
      </div>
    </div>
    <div class="table-container">
      <el-table :data="data.tableData" style="margin:5px;width: 100%"
                stripe :fit="true" :header-cell-style="{ background: '#f5f7fa' }" @selection-change="handleSelectionChange">
        <el-table-column type="selection" width="55" header-class-name="header-center" />
        <el-table-column fixed prop="title" label="标题" min-width="180" />
        <el-table-column prop="subTitle" label="副标题" min-width="180" />
        <el-table-column prop="authorName" label="用户" min-width="120" />
        <el-table-column prop="categoryName" label="分类" min-width="120" />
        <el-table-column prop="status" label="状态" min-width="120" >
          <template #default="scope">
          <span class="status-tag">
            <span class="status-dot" :class="{ 'green': scope.row.status === 1, 'red': scope.row.status !== 1 }"></span>
            {{ scope.row.status === 1 ? '已发布' : '草稿' }}
          </span>
          </template>
        </el-table-column>
        <el-table-column fixed="right" label="操作" min-width="200">
          <template #default="scope">
            <el-button link type="primary" size="small" @click="switchStatus(scope.row)">{{ scope.row.status === 1 ? '锁定' : '发布' }}</el-button>
            <el-button link type="primary" size="small" @click="dialogShowDetail=true;editDetail(scope.row.id)">编辑</el-button>
          </template>
        </el-table-column>
      </el-table>
      <!-- 分页 -->
      <div class="pagination-wrapper">
        <el-pagination
            v-model:current-page="blogPageQueryDTO.pageNum"
            v-model:page-size="blogPageQueryDTO.pageSize"
            :page-sizes="[5, 10, 20]"
            background
            layout="total, sizes, prev, pager, next, jumper"
            :total="data.total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"/>
      </div>
    </div>
  </div>
  <!-- 博客修改/详情页面 -->
  <el-dialog v-model="dialogShowDetail" title="博客详情">
    <el-form ref="formRef"
             :model="blogUpdateDTO"
             :rules="rules"
             label-width="120px"
             :disabled="!isEditing"
             @submit.native.prevent="saveChanges">
      <el-form-item prop="title" label="标题" >
        <el-input v-model="blogUpdateDTO.title" />
      </el-form-item>
      <el-form-item prop="subTitle" label="副标题">
        <el-input v-model="blogUpdateDTO.subTitle" />
      </el-form-item>
      <el-form-item label="作者">
        <el-select v-model="blogUpdateDTO.authorId" placeholder="请选择作者" disabled>
          <el-option v-for="item in authorList" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
      </el-form-item>
      <el-form-item label="分类">
        <el-select v-model="blogUpdateDTO.categoryId" placeholder="请选择分类">
          <el-option v-for="item in categoryList" :key="item.id" :label="item.name" :value="item.id"/>
        </el-select>
      </el-form-item>
      <el-form-item prop="content" label="内容（支持Markdown）">
        <el-input v-model="blogUpdateDTO.content" type="textarea" rows="8" />
      </el-form-item>
      <el-form-item prop="summary" label="摘要">
        <el-input v-model="blogUpdateDTO.summary" type="textarea" rows="3" />
      </el-form-item>
      <el-form-item label="博客封面">
        <el-upload
            class="avatar-uploader"
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            accept="image/*"
        >
          <img v-if="blogUpdateDTO.coverUrl" :src="blogUpdateDTO.coverUrl" class="avatar">
          <el-icon v-else class="avatar-uploader-icon"><Plus /></el-icon>
        </el-upload>
      </el-form-item>
    </el-form>
    <template #footer>
      <el-button @click="dialogShowDetail = false">取消</el-button>
      <el-button type="primary" @click="saveChanges" v-if="isEditing">保存</el-button>
    </template>
  </el-dialog>

</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from 'vue';
import { ElMessage } from 'element-plus';
import { Search } from '@element-plus/icons-vue';

// 模拟数据
const authorList = ref([
  { id: 1, name: '张三' },
  { id: 2, name: '李四' }
]);

const categoryList = ref([
  { id: 1, name: '技术博客' },
  { id: 2, name: '生活随笔' },
  { id: 3, name: '读书笔记' }
]);

// 表单相关
const dialogSaveBlog = ref(false);
const dialogShowDetail = ref(false);
const isEditing = ref(false);
const selectedRows = ref([]);
const searchKeyword = ref('');
const blogPageQueryDTO = reactive({
  pageNum: 1,
  pageSize: 5,
  keyWord: ''
});

// 表单数据
const saveBlogDTO = reactive({
  id: '',
  title: '',
  subTitle: '',
  content: '',
  summary: '',
  authorId: '',
  categoryId: '',
  coverUrl: '',
  status: 0
});

const blogUpdateDTO = reactive({
  id: '',
  title: '',
  subTitle: '',
  content: '',
  summary: '',
  authorId: '',
  categoryId: '',
  coverUrl: '',
  status: 0
});

// 规则验证
const rules = reactive({
  title: [
    { required: true, message: '标题不能为空', trigger: 'blur' },
    { max: 200, message: '不能超过200个字符', trigger: ['blur', 'input'] }
  ],
  content: [
    { required: true, message: '内容不能为空', trigger: 'blur' }
  ]
});

// 表格数据
const data = reactive({
  tableData: [],
  total: 0
});

// 生命周期
onMounted(async () => {
  await loadCategories();
  await loadData();
});

// 加载分类数据
const loadCategories = async () => {
  try {
    // 实际项目中应调用API
    categoryList.value = [
      { id: 1, name: '技术博客' },
      { id: 2, name: '生活随笔' },
      { id: 3, name: '读书笔记' }
    ];
  } catch (error) {
    ElMessage.error('加载分类失败');
  }
};

// 加载数据
const loadData = async () => {
  try {
    // 实际项目中应调用API
    data.tableData = [
      {
        id: 1,
        title: 'Vue3实战指南',
        subTitle: '深入理解Composition API',
        content: '# Vue3 核心概念...',
        summary: '本文详细讲解Vue3的新特性...',
        authorId: 1,
        categoryId: 1,
        status: 1,
        viewCount: 120,
        starCount: 45,
        createTime: '2024-03-15 09:30:00'
      }
    ];
    data.total = 1;
  } catch (err) {
    ElMessage.error('数据加载失败');
  }
};

// 分页处理
const handleSizeChange = () => { loadData(); };
const handleCurrentChange = (newPage: number) => {
  blogPageQueryDTO.pageNum = newPage;
  loadData();
};

// 搜索处理
const pageQuery = () => {
  blogPageQueryDTO.keyWord = searchKeyword.value;
  loadData();
};

// 操作处理
const deleteBlog = async () => {
  try {
    await ElMessageBox.confirm('确定删除所选博客？');
    // 实际项目中应调用API
    ElMessage.success('删除成功');
    loadData();
  } catch (error) {}
};

const switchStatus = async (row: any) => {
  try {
    // 实际项目中应调用API
    row.status = row.status === 1 ? 0 : 1;
    ElMessage.success(`已${row.status === 1 ? '发布' : '撤回'}`);
    loadData();
  } catch (error) {}
};

// 表单操作
const saveBlog = async () => {
  try {
    // 实际项目中应调用API
    ElMessage.success('保存成功');
    dialogSaveBlog.value = false;
    loadData();
  } catch (error) {
    ElMessage.error('保存失败');
  }
};

const saveChanges = async () => {
  try {
    // 实际项目中应调用API
    ElMessage.success('修改成功');
    dialogShowDetail.value = false;
    loadData();
  } catch (error) {
    ElMessage.error('修改失败');
  }
};

// 上传处理
const uploadUrl = 'http://localhost:8080/admin/common/upload';
const uploadHeaders = { Authorization: 'Bearer token' };

const handleUploadSuccess = (response: any) => {
  const dto = isEditing.value ? blogUpdateDTO : saveBlogDTO;
  dto.coverUrl = response.data.url;
  ElMessage.success('上传成功');
};

const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/');
  const isLt5M = file.size / 1024 / 1024 < 5;

  if (!isImage) ElMessage.error('只能上传图片文件');
  if (!isLt5M) ElMessage.error('图片大小不能超过5MB');

  return isImage && isLt5M;
};

// 公共方法
const reset = () => {
  Object.assign(saveBlogDTO, {
    id: '',
    title: '',
    subTitle: '',
    content: '',
    summary: '',
    authorId: '',
    categoryId: '',
    coverUrl: '',
    status: 0
  });
};

const editDetail = (id: number) => {
  // 实际项目中应调用API获取详情
  Object.assign(blogUpdateDTO, {
    id,
    title: 'Vue3实战指南',
    subTitle: '深入理解Composition API',
    content: '# Vue3 核心概念...',
    summary: '本文详细讲解Vue3的新特性...',
    authorId: 1,
    categoryId: 1,
    coverUrl: '',
    status: 1
  });
  isEditing.value = true;
};
</script>

<style lang="scss">

.blog-container {
  margin: 10px;
  padding: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.1);
  // 移除固定max-height，改用flex填充
  flex: 1;
  overflow: hidden;
}

.table-container {
  // 改为100%高度继承
  height: 100%;
  overflow: auto; // 允许表格内容滚动

  // 新增表格高度控制
  & > .el-table {
    min-height: 400px; // 保证表头始终可见
    max-height: calc(100% - 60px); // 减去分页高度
  }
}

.insertAndDelete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 5px;
  gap: 12px;
}

.button-group {
  display: flex;
  gap: 8px;
}

.search-container {
  flex: 1;
  max-width: 300px;
}

.search-container {
  margin-left: auto;
}

.form-tip {
  margin-left: 10px;
  color: #909399;
  font-size: 0.8em;
}

.el-table {
  display: block;
  overflow-y: auto;
  overflow-x: hidden;
}

.el-table__body-wrapper {
  min-height: 300px;
}

.pagination-wrapper {
  margin: 20px 0;
  display: flex;
  justify-content: center;
  padding: 0 20px;
}
//.table{
//    // 边框阴影
//    box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
//    border-radius: 4px;
//    overflow: hidden; /* 确保阴影不被圆角裁剪 */
//  }
//  .page{
//    display: flex;
//    flex-direction: column;
//    align-items: center;
//    margin: 10px;
//  }
.status-tag {
  display: flex;
  align-items: center;
  gap: 4px;
}

.status-dot {
  display: inline-block;
  width: 12px;
  height: 12px;
  border-radius: 50%;
}

.green {
  background-color: #67C23A;
}

.red {
  background-color: #F56C6C;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  transition: var(--el-transition-duration-fast);
}

.avatar-uploader .el-upload:hover {
  border-color: var(--el-color-primary);
}

.el-icon.avatar-uploader-icon {
  font-size: 28px;
  color: #8c939d;
  width: 178px;
  height: 178px;
  text-align: center;
}

.avatar {
  width: 200px;       // 设置固定宽度
  height: 200px;      // 设置固定高度
  object-fit: cover;  // 保持比例填充，可裁剪多余部分
  // 或使用下面这个属性如果希望完整显示图片
  // object-fit: contain;
}

/* 同时需要调整上传组件的容器尺寸 */
.avatar-uploader .el-upload {
  width: 200px;
  height: 200px;
}

.avatar-uploader .el-upload {
  border: 1px dashed var(--el-border-color);
  border-radius: 6px;
  width: 200px;
  height: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
}
</style>